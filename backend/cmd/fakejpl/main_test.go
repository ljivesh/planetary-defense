package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHandlerServesFixtures(t *testing.T) {
	h := newHandler("../../internal/jpl/testdata")

	cases := map[string]string{
		"/cad.api?date-min=now":    "NASA/JPL SBDB Close Approach Data API",
		"/sentry.api":              "NASA/JPL Sentry Data API",
		"/sentry.api?des=99942":    "NASA/JPL Sentry Data API",
		"/sbdb.api?sstr=99942":     "NASA/JPL Small-Body Database (SBDB) API",
		"/fireball.api?sort=-date": "NASA/JPL Fireball Data API",
	}
	for target, source := range cases {
		t.Run(target, func(t *testing.T) {
			rec := httptest.NewRecorder()
			h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, target, nil))
			require.Equal(t, http.StatusOK, rec.Code, rec.Body.String())
			assert.Equal(t, "application/json", rec.Header().Get("Content-Type"))

			var body struct {
				Signature struct {
					Source string `json:"source"`
				} `json:"signature"`
			}
			require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body))
			assert.Equal(t, source, body.Signature.Source)
		})
	}
}

func TestSentryDetailVsList(t *testing.T) {
	h := newHandler("../../internal/jpl/testdata")

	list := httptest.NewRecorder()
	h.ServeHTTP(list, httptest.NewRequest(http.MethodGet, "/sentry.api", nil))
	detail := httptest.NewRecorder()
	h.ServeHTTP(detail, httptest.NewRequest(http.MethodGet, "/sentry.api?des=99942", nil))

	assert.NotEqual(t, list.Body.String(), detail.Body.String(), "?des= switches to the detail fixture")
}

func TestUnknownPathIs404(t *testing.T) {
	rec := httptest.NewRecorder()
	newHandler("../../internal/jpl/testdata").ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/nope.api", nil))
	assert.Equal(t, http.StatusNotFound, rec.Code)
}
