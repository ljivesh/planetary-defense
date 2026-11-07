package httpapi

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5/middleware"
)

// requestLogger logs one structured line per request.
func requestLogger(log *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
			next.ServeHTTP(ww, r)

			status := ww.Status()
			if status == 0 {
				status = http.StatusOK
			}
			level := slog.LevelInfo
			if status >= http.StatusInternalServerError {
				level = slog.LevelError
			}
			log.LogAttrs(r.Context(), level, "http request",
				slog.String("method", r.Method),
				slog.String("path", r.URL.Path),
				slog.String("query", r.URL.RawQuery),
				slog.Int("status", status),
				slog.Int("bytes", ww.BytesWritten()),
				slog.Duration("duration", time.Since(start)),
				slog.String("client_ip", middleware.GetClientIP(r.Context())),
				slog.String("request_id", middleware.GetReqID(r.Context())),
			)
		})
	}
}

// clientIP resolves the client IP according to the deployment's proxy trust model.
func clientIP(trustedProxies int) func(http.Handler) http.Handler {
	if trustedProxies > 0 {
		return middleware.ClientIPFromXFFTrustedProxies(trustedProxies)
	}
	return middleware.ClientIPFromRemoteAddr
}

// clientIPKey keys rate limiting by the resolved client IP.
func clientIPKey(r *http.Request) (string, error) {
	return middleware.GetClientIP(r.Context()), nil
}
