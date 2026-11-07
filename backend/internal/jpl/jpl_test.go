package jpl

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// fixtureServer serves testdata files by API path; query string selects variants
// via the routes map (path+"?"+rawQuery has priority over path).
func fixtureServer(t *testing.T, routes map[string]string) *Client {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		file, ok := routes[r.URL.Path+"?"+r.URL.RawQuery]
		if !ok {
			file, ok = routes[r.URL.Path]
		}
		if !ok {
			w.WriteHeader(http.StatusBadRequest)
			_, _ = w.Write([]byte(`{"code":"400","message":"invalid designation"}`))
			return
		}
		b, err := os.ReadFile(filepath.Join("testdata", file))
		require.NoError(t, err)
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(b)
	}))
	t.Cleanup(srv.Close)
	return New(srv.URL, 5*time.Second)
}

func TestCloseApproaches(t *testing.T) {
	c := fixtureServer(t, map[string]string{"/cad.api": "cad.json"})
	got, err := c.CloseApproaches(context.Background(), CADQuery{DateMin: "now", Limit: 3})
	require.NoError(t, err)
	require.Len(t, got, 3)

	first := got[0]
	assert.Equal(t, "2026 VZ3", first.Designation)
	assert.Equal(t, "(2026 VZ3)", first.FullName)
	assert.Equal(t, time.Date(2026, 11, 7, 0, 18, 0, 0, time.UTC), first.Time)
	assert.InDelta(t, 0.047066595877179, first.DistanceAU, 1e-12)
	assert.InDelta(t, 15.2881540899001, first.VRelKms, 1e-9)
	require.NotNil(t, first.H)
	assert.InDelta(t, 26.452, *first.H, 1e-9)
	assert.Nil(t, first.DiameterKm, "null diameter stays nil")
	assert.Equal(t, "< 00:01", got[2].TimeUncertainty)
}

func TestSentryList(t *testing.T) {
	c := fixtureServer(t, map[string]string{"/sentry.api": "sentry_list.json"})
	got, err := c.SentryList(context.Background())
	require.NoError(t, err)
	require.Len(t, got, 5)
	assert.Equal(t, "2011 TO", got[0].Designation)
	assert.InDelta(t, 2.937e-06, got[0].ImpactProb, 1e-15)
	assert.InDelta(t, -6.15, got[0].PalermoCum, 1e-9)
	assert.Equal(t, 1, got[0].NumImpacts)
}

func TestSentryDetail(t *testing.T) {
	c := fixtureServer(t, map[string]string{
		"/sentry.api?des=29075": "sentry_detail.json",
		"/sentry.api?des=99942": "sentry_removed.json",
	})

	d, err := c.SentryDetail(context.Background(), "29075")
	require.NoError(t, err)
	assert.Equal(t, "29075 (1950 DA)", d.FullName)
	assert.Nil(t, d.TorinoMax)
	require.NotEmpty(t, d.Impactors)
	assert.Equal(t, "2880-03-16.99", d.Impactors[0].Date)

	_, err = c.SentryDetail(context.Background(), "99942")
	assert.ErrorIs(t, err, ErrNotFound, "removed objects map to ErrNotFound")
}

func TestLookup(t *testing.T) {
	c := fixtureServer(t, map[string]string{"/sbdb.api": "sbdb.json"})
	rec, err := c.Lookup(context.Background(), "99942")
	require.NoError(t, err)
	assert.Equal(t, "99942 Apophis (2004 MN4)", rec.Object.FullName)
	assert.True(t, rec.Object.PHA)
	assert.Equal(t, "ATE", rec.Object.OrbitCode)

	el := rec.Orbit.Elements
	assert.InDelta(t, 2461200.5, el.Epoch, 1e-9)
	assert.InDelta(t, 0.1911492279663492, el.E, 1e-15)
	assert.InDelta(t, 0.9223592206975018, el.A, 1e-15)
	assert.InDelta(t, 203.8936514240762, el.Node, 1e-12)
	require.NotNil(t, rec.Orbit.MOIDAU)
	assert.InDelta(t, 0.000107917, *rec.Orbit.MOIDAU, 1e-12)
	assert.NotEmpty(t, rec.Phys)
}

func TestLookupNotFound(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte(`{"code":"200","message":"specified object was not found"}`))
	}))
	defer srv.Close()
	_, err := New(srv.URL, time.Second).Lookup(context.Background(), "nope")
	assert.ErrorIs(t, err, ErrNotFound)
}

func TestFireballs(t *testing.T) {
	c := fixtureServer(t, map[string]string{"/fireball.api": "fireball.json"})
	got, err := c.Fireballs(context.Background(), 3)
	require.NoError(t, err)
	require.Len(t, got, 3)
	f := got[0]
	assert.Equal(t, time.Date(2026, 10, 4, 3, 14, 45, 0, time.UTC), f.Time)
	assert.InDelta(t, 5.4e10, f.RadiatedEnergyJ, 1)
	require.NotNil(t, f.Lat)
	assert.InDelta(t, -41.8, *f.Lat, 1e-9, "south is negative")
	assert.InDelta(t, -173.1, *f.Lon, 1e-9, "west is negative")
	assert.Nil(t, got[1].VelocityKms)
}

func TestAPIError(t *testing.T) {
	c := fixtureServer(t, map[string]string{})
	_, err := c.CloseApproaches(context.Background(), CADQuery{Des: "zzzz"})
	var apiErr *APIError
	require.True(t, errors.As(err, &apiErr))
	assert.True(t, apiErr.IsBadRequest())
	assert.Equal(t, "invalid designation", apiErr.Message)
}

func TestParseFloat(t *testing.T) {
	f := func(v float64) *float64 { return &v }
	cases := []struct {
		in   string
		want *float64
	}{
		{".1911", f(0.1911)}, {"1.3e+00", f(1.3)}, {" -6.15 ", f(-6.15)},
		{"", nil}, {"abc", nil}, {"NaN", nil}, {"Inf", nil}, {"-Inf", nil},
	}
	for _, c := range cases {
		assert.Equal(t, c.want, parseFloat(c.in), c.in)
	}
}
