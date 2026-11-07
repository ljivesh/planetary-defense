package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/ljivesh/planetary-defense/backend/internal/jpl"
	"github.com/ljivesh/planetary-defense/backend/internal/neo"
)

// statusClientClosedRequest is nginx's de-facto code for an aborted request.
const statusClientClosedRequest = 499

// envelope is the success response shape: {"data": ...}.
type envelope struct {
	Data any `json:"data"`
}

// errorBody is the error response shape: {"error": {"code", "message"}}.
type errorBody struct {
	Error struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

// writeJSON encodes v before writing headers so an encoding failure becomes a
// proper 500 instead of an empty 200.
func writeJSON(w http.ResponseWriter, status int, v any) {
	body, err := json.Marshal(v)
	if err != nil {
		slog.Error("encode response", slog.Any("err", err))
		status = http.StatusInternalServerError
		body = []byte(`{"error":{"code":"internal","message":"failed to encode response"}}`)
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write(body)
}

// writeData writes a 200 response with data and an optional public cache hint.
func writeData(w http.ResponseWriter, data any, maxAgeSec int) {
	if maxAgeSec > 0 {
		w.Header().Set("Cache-Control", "public, max-age="+strconv.Itoa(maxAgeSec))
	}
	writeJSON(w, http.StatusOK, envelope{Data: data})
}

func writeError(w http.ResponseWriter, status int, code, msg string) {
	var b errorBody
	b.Error.Code = code
	b.Error.Message = msg
	writeJSON(w, status, b)
}

// writeServiceError maps domain/upstream errors to HTTP responses.
func (a *API) writeServiceError(w http.ResponseWriter, r *http.Request, err error) {
	var apiErr *jpl.APIError
	switch {
	case errors.Is(err, neo.ErrNotFound):
		writeError(w, http.StatusNotFound, "not_found", "object not found")
	case errors.As(err, &apiErr) && apiErr.IsBadRequest():
		writeError(w, http.StatusBadRequest, "bad_request", apiErr.Message)
	case errors.Is(err, context.Canceled) && r.Context().Err() != nil:
		// Client went away (e.g. navigation aborted the fetch); not a server error.
		writeError(w, statusClientClosedRequest, "client_closed", "client closed request")
	case errors.Is(err, context.DeadlineExceeded):
		writeError(w, http.StatusGatewayTimeout, "timeout", "request timed out")
	default:
		a.log.ErrorContext(r.Context(), "upstream failure", slog.String("path", r.URL.Path), slog.Any("err", err))
		writeError(w, http.StatusBadGateway, "upstream_error", "NASA/JPL data service is unavailable, try again shortly")
	}
}
