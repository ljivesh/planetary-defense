package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"math"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/ljivesh/planetary-defense/backend/internal/jpl"
	"github.com/ljivesh/planetary-defense/backend/internal/neo"
)

type fakeService struct {
	lastFilter neo.ApproachFilter
	lastDes    string
	err        error
}

func (f *fakeService) Summary(context.Context) (*neo.Summary, error) {
	return &neo.Summary{ApproachCount: 3}, f.err
}

func (f *fakeService) CloseApproaches(_ context.Context, flt neo.ApproachFilter) ([]neo.CloseApproach, error) {
	f.lastFilter = flt
	return []neo.CloseApproach{{Designation: "2026 VK2"}}, f.err
}

func (f *fakeService) ObjectApproaches(_ context.Context, des string) ([]neo.CloseApproach, error) {
	f.lastDes = des
	return nil, f.err
}

func (f *fakeService) RiskList(context.Context) ([]neo.RiskObject, error) {
	return []neo.RiskObject{{Designation: "a"}, {Designation: "b"}, {Designation: "c"}}, f.err
}

func (f *fakeService) Object(_ context.Context, des string) (*neo.ObjectDetail, error) {
	f.lastDes = des
	if f.err != nil {
		return nil, f.err
	}
	return &neo.ObjectDetail{Designation: des}, nil
}

func (f *fakeService) Fireballs(context.Context, int) ([]neo.Fireball, error) { return nil, f.err }

func do(t *testing.T, svc Service, target string) (*httptest.ResponseRecorder, map[string]any) {
	t.Helper()
	h := NewRouter(svc, slog.New(slog.NewTextHandler(io.Discard, nil)), Options{})
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, target, nil))
	var body map[string]any
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body), rec.Body.String())
	return rec, body
}

func TestHealth(t *testing.T) {
	rec, body := do(t, &fakeService{}, "/api/v1/health")
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "ok", body["data"].(map[string]any)["status"])
}

func TestCloseApproachesDefaultsAndValidation(t *testing.T) {
	svc := &fakeService{}
	rec, body := do(t, svc, "/api/v1/close-approaches")
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Len(t, body["data"], 1)
	assert.Equal(t, neo.ApproachFilter{From: "now", To: "+60", MaxDistAU: 0.05, Limit: 500}, svc.lastFilter)

	rec, _ = do(t, svc, "/api/v1/close-approaches?from=2026-01-01&to=2026-02-01&maxDistAu=0.1&minDiameterM=140")
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, neo.ApproachFilter{From: "2026-01-01", To: "2026-02-01", MaxDistAU: 0.1, MinDiameterM: 140, Limit: 500}, svc.lastFilter)

	for _, bad := range []string{"from=yesterday", "maxDistAu=9", "limit=0", "minDiameterM=-1"} {
		rec, body := do(t, svc, "/api/v1/close-approaches?"+bad)
		assert.Equal(t, http.StatusBadRequest, rec.Code, bad)
		assert.Equal(t, "bad_request", body["error"].(map[string]any)["code"], bad)
	}
}

func TestRiskLimit(t *testing.T) {
	_, body := do(t, &fakeService{}, "/api/v1/risk?limit=2")
	assert.Len(t, body["data"], 2)
}

func TestObjectDesignationUnescaped(t *testing.T) {
	svc := &fakeService{}
	rec, _ := do(t, svc, "/api/v1/objects/2026%20VK2")
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "2026 VK2", svc.lastDes)
}

func TestErrorMapping(t *testing.T) {
	cases := []struct {
		err    error
		status int
		code   string
	}{
		{neo.ErrNotFound, http.StatusNotFound, "not_found"},
		{&jpl.APIError{Status: 400, Message: "invalid designation"}, http.StatusBadRequest, "bad_request"},
		{errors.New("dial tcp: timeout"), http.StatusBadGateway, "upstream_error"},
	}
	for _, c := range cases {
		rec, body := do(t, &fakeService{err: c.err}, "/api/v1/objects/x")
		assert.Equal(t, c.status, rec.Code)
		assert.Equal(t, c.code, body["error"].(map[string]any)["code"])
	}
}

func TestUnknownRoute(t *testing.T) {
	rec, _ := do(t, &fakeService{}, "/api/v1/nope")
	assert.Equal(t, http.StatusNotFound, rec.Code)
}

type nanService struct{ *fakeService }

func (nanService) RiskList(context.Context) ([]neo.RiskObject, error) {
	nan := math.NaN()
	return []neo.RiskObject{{Designation: "x", VelocityInfKms: &nan}}, nil
}

func TestUnencodableResponseIs500(t *testing.T) {
	rec, body := do(t, nanService{&fakeService{}}, "/api/v1/risk")
	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Equal(t, "internal", body["error"].(map[string]any)["code"])
}
