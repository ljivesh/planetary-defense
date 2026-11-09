// Command fakejpl serves the recorded JPL SSD fixtures over HTTP so the API
// (and the end-to-end tests) can run without touching ssd-api.jpl.nasa.gov.
//
//	go run ./cmd/fakejpl -addr :9090
//	JPL_BASE_URL=http://localhost:9090 go run ./cmd/server
package main

import (
	"flag"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func main() {
	addr := flag.String("addr", ":9090", "listen address")
	dir := flag.String("dir", "internal/jpl/testdata", "fixture directory")
	flag.Parse()

	srv := &http.Server{
		Addr:              *addr,
		Handler:           newHandler(*dir),
		ReadHeaderTimeout: 5 * time.Second,
	}
	slog.Info("fake JPL listening", "addr", *addr, "dir", *dir)
	if err := srv.ListenAndServe(); err != nil {
		slog.Error("fake JPL exited", "err", err)
		os.Exit(1)
	}
}

// newHandler maps each JPL endpoint to a fixture file. Sentry has two shapes:
// the full list, and a single-object detail when ?des= is present.
func newHandler(dir string) http.Handler {
	serve := func(file string) http.HandlerFunc {
		return func(w http.ResponseWriter, _ *http.Request) {
			b, err := os.ReadFile(filepath.Join(dir, file))
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write(b)
		}
	}

	mux := http.NewServeMux()
	mux.Handle("GET /cad.api", serve("cad.json"))
	mux.Handle("GET /sbdb.api", serve("sbdb.json"))
	mux.Handle("GET /fireball.api", serve("fireball.json"))
	mux.HandleFunc("GET /sentry.api", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("des") != "" {
			serve("sentry_detail.json")(w, r)
			return
		}
		serve("sentry_list.json")(w, r)
	})
	return mux
}
