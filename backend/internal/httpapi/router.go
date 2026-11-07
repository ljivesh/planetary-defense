// Package httpapi exposes the dashboard's REST API over HTTP.
package httpapi

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"

	"github.com/ljivesh/planetary-defense/backend/internal/neo"
)

// Service is what the handlers need from the domain layer.
type Service interface {
	Summary(ctx context.Context) (*neo.Summary, error)
	CloseApproaches(ctx context.Context, f neo.ApproachFilter) ([]neo.CloseApproach, error)
	ObjectApproaches(ctx context.Context, des string) ([]neo.CloseApproach, error)
	RiskList(ctx context.Context) ([]neo.RiskObject, error)
	Object(ctx context.Context, des string) (*neo.ObjectDetail, error)
	Fireballs(ctx context.Context, limit int) ([]neo.Fireball, error)
}

// Options configures cross-cutting HTTP behaviour.
type Options struct {
	CORSOrigins     []string
	RateLimitPerMin int
	RequestTimeout  time.Duration
	// TrustedProxies is the number of reverse proxies in front of the server.
	// 0 means clients connect directly and RemoteAddr is used as the client IP.
	TrustedProxies int
}

// API holds handler dependencies.
type API struct {
	svc Service
	log *slog.Logger
}

// NewRouter builds the HTTP handler with middleware and all /api/v1 routes.
func NewRouter(svc Service, log *slog.Logger, opts Options) http.Handler {
	a := &API{svc: svc, log: log}

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(clientIP(opts.TrustedProxies))
	r.Use(requestLogger(log))
	r.Use(middleware.Recoverer)
	r.Use(middleware.Compress(5))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: opts.CORSOrigins,
		AllowedMethods: []string{http.MethodGet, http.MethodOptions},
		AllowedHeaders: []string{"Accept", "Content-Type"},
		MaxAge:         300,
	}))
	if opts.RateLimitPerMin > 0 {
		r.Use(httprate.LimitBy(opts.RateLimitPerMin, time.Minute, clientIPKey))
	}
	if opts.RequestTimeout > 0 {
		r.Use(middleware.Timeout(opts.RequestTimeout))
	}

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", a.health)
		r.Get("/summary", a.summary)
		r.Get("/close-approaches", a.closeApproaches)
		r.Get("/risk", a.riskList)
		r.Get("/objects/{des}", a.object)
		r.Get("/objects/{des}/close-approaches", a.objectApproaches)
		r.Get("/fireballs", a.fireballs)
	})

	r.NotFound(func(w http.ResponseWriter, _ *http.Request) {
		writeError(w, http.StatusNotFound, "not_found", "route not found")
	})
	r.MethodNotAllowed(func(w http.ResponseWriter, _ *http.Request) {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "method not allowed")
	})
	return r
}
