// Package jpl is a typed client for the NASA/JPL Solar System Dynamics APIs
// (https://ssd-api.jpl.nasa.gov). It knows the wire formats and nothing about
// how the dashboard presents the data.
package jpl

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

const userAgent = "planetary-defense-dashboard/0.1 (+https://github.com/ljivesh/planetary-defense)"

// maxBody caps upstream response size (Sentry's full list is ~1 MB).
const maxBody = 16 << 20

var (
	// ErrNotFound is returned when JPL reports the requested object does not exist
	// (or, for Sentry, that it has been removed from the risk list).
	ErrNotFound = errors.New("jpl: object not found")
)

// APIError is a non-success response reported by a JPL API.
type APIError struct {
	Status  int
	Message string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("jpl: upstream returned %d: %s", e.Status, e.Message)
}

// IsBadRequest reports whether JPL rejected the request parameters.
func (e *APIError) IsBadRequest() bool { return e.Status == http.StatusBadRequest }

// Client talks to the JPL SSD APIs.
type Client struct {
	baseURL string
	http    *http.Client
}

// New creates a Client. timeout bounds each upstream request.
func New(baseURL string, timeout time.Duration) *Client {
	return &Client{
		baseURL: baseURL,
		http:    &http.Client{Timeout: timeout},
	}
}

// errorBody is the common error envelope used by the SSD APIs.
type errorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Error   string `json:"error"`
}

// getJSON performs a GET to path with query q and decodes the JSON body into out.
// It returns the raw body so callers can inspect API-specific error shapes that
// arrive with HTTP 200.
func (c *Client) getJSON(ctx context.Context, path string, q url.Values, out any) ([]byte, error) {
	u := c.baseURL + path
	if len(q) > 0 {
		u += "?" + q.Encode()
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, fmt.Errorf("jpl: build request: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", userAgent)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("jpl: GET %s: %w", path, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, maxBody))
	if err != nil {
		return nil, fmt.Errorf("jpl: read body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var eb errorBody
		_ = json.Unmarshal(body, &eb)
		msg := eb.Message
		if msg == "" {
			msg = http.StatusText(resp.StatusCode)
		}
		return body, &APIError{Status: resp.StatusCode, Message: msg}
	}

	if err := json.Unmarshal(body, out); err != nil {
		return body, fmt.Errorf("jpl: decode %s: %w", path, err)
	}
	return body, nil
}
