package neo

import (
	"context"
	"io"
	"log/slog"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/ljivesh/planetary-defense/backend/internal/jpl"
)

func ptr[T any](v T) *T { return &v }

func TestDiameterEstimateRoundTrip(t *testing.T) {
	// Apophis: H ≈ 19.09, measured D ≈ 340 m with albedo ≈ 0.35.
	d := EstimateDiameterKm(19.09, 0.35)
	assert.InDelta(t, 0.34, d, 0.03)
	assert.InDelta(t, 19.09, HForDiameterKm(d, 0.35), 1e-9)

	r := estimateRange(ptr(22.0))
	require.NotNil(t, r)
	assert.Less(t, r.MinM, r.MaxM)
	assert.Nil(t, estimateRange(nil))
}

func TestBuildSummary(t *testing.T) {
	now := time.Date(2026, 11, 7, 0, 0, 0, 0, time.UTC)
	approaches := []CloseApproach{
		{Designation: "A", DistanceAU: 0.03, H: ptr(25.0)},
		{Designation: "B", DistanceAU: 0.001, H: ptr(28.0)},
		{Designation: "C", DistanceAU: 0.04, H: ptr(21.0)},
		{Designation: "D", DistanceAU: 0.02},
	}
	risk := []RiskObject{{Designation: "R1", PalermoCumulative: -1}, {Designation: "R2", PalermoCumulative: -3}}
	fireballs := []Fireball{{ImpactEnergyKt: 0.2}}

	s := buildSummary(approaches, risk, fireballs, now)
	assert.Equal(t, 4, s.ApproachCount)
	assert.Equal(t, 1, s.WithinLunarDistance)
	assert.Equal(t, "B", s.ClosestApproach.Designation)
	assert.Equal(t, "C", s.LargestApproach.Designation)
	assert.Equal(t, 2, s.SentryCount)
	assert.Equal(t, "R1", s.HighestRisk.Designation)
	assert.InDelta(t, 0.2, s.LatestFireball.ImpactEnergyKt, 1e-9)

	empty := buildSummary(nil, nil, nil, now)
	assert.Nil(t, empty.ClosestApproach)
	assert.Nil(t, empty.HighestRisk)
}

type fakeUpstream struct {
	sentryDetailErr error
	lookups         int
}

func (f *fakeUpstream) CloseApproaches(context.Context, jpl.CADQuery) ([]jpl.CloseApproach, error) {
	return nil, nil
}

func (f *fakeUpstream) SentryList(context.Context) ([]jpl.SentryObject, error) {
	return []jpl.SentryObject{
		{Designation: "low", PalermoCum: -5},
		{Designation: "high", PalermoCum: -1},
	}, nil
}

func (f *fakeUpstream) SentryDetail(context.Context, string) (*jpl.SentryDetail, error) {
	if f.sentryDetailErr != nil {
		return nil, f.sentryDetailErr
	}
	return &jpl.SentryDetail{PalermoCum: -2, Impactors: []jpl.VirtualImpactor{{Date: "2100-01-01"}}}, nil
}

func (f *fakeUpstream) Lookup(_ context.Context, sstr string) (*jpl.SBDBRecord, error) {
	f.lookups++
	if sstr == "missing" {
		return nil, jpl.ErrNotFound
	}
	return &jpl.SBDBRecord{
		Object: jpl.SBDBObject{Designation: "99942", FullName: "99942 Apophis"},
		Phys: []jpl.PhysParam{
			{Name: "H", Value: "19.09"},
			{Name: "diameter", Value: "0.34", Units: "km"},
		},
	}, nil
}

func (f *fakeUpstream) Fireballs(context.Context, int) ([]jpl.Fireball, error) { return nil, nil }

func newTestService(up Upstream) *Service {
	return NewService(up, slog.New(slog.NewTextHandler(io.Discard, nil)))
}

func TestRiskListSortedByPalermo(t *testing.T) {
	got, err := newTestService(&fakeUpstream{}).RiskList(context.Background())
	require.NoError(t, err)
	require.Len(t, got, 2)
	assert.Equal(t, "high", got[0].Designation)
}

func TestObjectMergesRiskAndCaches(t *testing.T) {
	up := &fakeUpstream{}
	svc := newTestService(up)

	d, err := svc.Object(context.Background(), "99942")
	require.NoError(t, err)
	assert.Equal(t, "99942 Apophis", d.FullName)
	require.NotNil(t, d.DiameterM)
	assert.InDelta(t, 340, *d.DiameterM, 1e-9)
	require.NotNil(t, d.Risk)
	assert.Len(t, d.Risk.Impactors, 1)

	_, err = svc.Object(context.Background(), "99942")
	require.NoError(t, err)
	assert.Equal(t, 1, up.lookups, "SBDB lookup is cached")
}

func TestObjectWithoutRisk(t *testing.T) {
	d, err := newTestService(&fakeUpstream{sentryDetailErr: jpl.ErrNotFound}).Object(context.Background(), "99942")
	require.NoError(t, err)
	assert.Nil(t, d.Risk)
}

func TestObjectNotFound(t *testing.T) {
	_, err := newTestService(&fakeUpstream{}).Object(context.Background(), "missing")
	assert.ErrorIs(t, err, ErrNotFound)
}
