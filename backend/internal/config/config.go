// Package config loads runtime configuration from environment variables.
package config

import (
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/caarlos0/env/v11"
)

// Config holds all runtime settings for the API server.
type Config struct {
	Addr            string        `env:"ADDR"               envDefault:":8080"`
	Env             string        `env:"APP_ENV"            envDefault:"development"`
	LogLevel        string        `env:"LOG_LEVEL"          envDefault:"info"`
	CORSOrigins     []string      `env:"CORS_ORIGINS"       envDefault:"http://localhost:5173" envSeparator:","`
	JPLBaseURL      string        `env:"JPL_BASE_URL"       envDefault:"https://ssd-api.jpl.nasa.gov"`
	UpstreamTimeout time.Duration `env:"UPSTREAM_TIMEOUT"   envDefault:"20s"`
	RequestTimeout  time.Duration `env:"REQUEST_TIMEOUT"    envDefault:"30s"`
	RateLimitPerMin int           `env:"RATE_LIMIT_PER_MIN" envDefault:"120"`
	TrustedProxies  int           `env:"TRUSTED_PROXIES"    envDefault:"0"`
}

// Load parses the environment into a Config.
func Load() (Config, error) {
	cfg, err := env.ParseAs[Config]()
	if err != nil {
		return Config{}, fmt.Errorf("parse env: %w", err)
	}
	return cfg, nil
}

// IsProduction reports whether the server runs in production mode.
func (c Config) IsProduction() bool { return strings.EqualFold(c.Env, "production") }

// SlogLevel converts LogLevel into a slog.Level, defaulting to Info.
func (c Config) SlogLevel() slog.Level {
	var lvl slog.Level
	if err := lvl.UnmarshalText([]byte(c.LogLevel)); err != nil {
		return slog.LevelInfo
	}
	return lvl
}
