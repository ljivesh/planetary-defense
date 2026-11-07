package httpapi

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
)

// paramError is a client input validation error.
type paramError struct{ msg string }

func (e *paramError) Error() string { return e.msg }

func badParam(format string, args ...any) error {
	return &paramError{msg: fmt.Sprintf(format, args...)}
}

// queryFloat parses an optional float query param constrained to [lo, hi].
func queryFloat(q url.Values, name string, def, lo, hi float64) (float64, error) {
	raw := strings.TrimSpace(q.Get(name))
	if raw == "" {
		return def, nil
	}
	v, err := strconv.ParseFloat(raw, 64)
	if err != nil || v < lo || v > hi {
		return 0, badParam("%s must be a number between %g and %g", name, lo, hi)
	}
	return v, nil
}

// queryInt parses an optional integer query param constrained to [lo, hi].
func queryInt(q url.Values, name string, def, lo, hi int) (int, error) {
	raw := strings.TrimSpace(q.Get(name))
	if raw == "" {
		return def, nil
	}
	v, err := strconv.Atoi(raw)
	if err != nil || v < lo || v > hi {
		return 0, badParam("%s must be an integer between %d and %d", name, lo, hi)
	}
	return v, nil
}

// queryDate parses an optional YYYY-MM-DD query param, returning def when absent.
func queryDate(q url.Values, name, def string) (string, error) {
	raw := strings.TrimSpace(q.Get(name))
	if raw == "" {
		return def, nil
	}
	if _, err := time.Parse(time.DateOnly, raw); err != nil {
		return "", badParam("%s must be a date in YYYY-MM-DD format", name)
	}
	return raw, nil
}

// designation extracts and validates the {des} path parameter.
func designation(r *http.Request) (string, error) {
	raw := chi.URLParam(r, "des")
	des, err := url.PathUnescape(raw)
	if err != nil {
		des = raw
	}
	des = strings.TrimSpace(des)
	if des == "" || len(des) > 64 {
		return "", badParam("designation must be 1-64 characters")
	}
	return des, nil
}
