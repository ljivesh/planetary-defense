# Planetary Defense Dashboard

Track near-Earth objects using public NASA/JPL data. The dashboard shows upcoming
close approaches, the Sentry impact-risk table, object profiles with a 3D orbit
viewer, and fireball (bolide) events.

- **Frontend:** React 19 · TypeScript 7 · Vite 8 · Tailwind CSS v4 · shadcn/ui (Radix) · TanStack Query & Table · React Router 8 · Recharts · react-three-fiber · zod
- **Backend:** Go 1.26 · chi · otter (TTL cache with load coalescing) · slog · caarlos0/env
- **Design:** an "instrument data sheet" system (near-black canvas, hairline rules, mono figures, one amber signal colour), specified in [`docs/DESIGN.md`](docs/DESIGN.md). Read it before changing UI.

```
┌───────────────┐   /api/v1/*   ┌──────────────────────────┐   HTTPS   ┌──────────────────────┐
│ React (Vite)  │ ────────────▶ │ Go API                   │ ────────▶ │ ssd-api.jpl.nasa.gov │
│ :5173         │ ◀──────────── │ cache · normalize · CORS │ ◀──────── │ cad / sentry / sbdb  │
└───────────────┘   typed JSON  └──────────────────────────┘  fields+  │ fireball             │
                                                              data[][] └──────────────────────┘
```

The Go service puts a cache in front of JPL. It turns JPL's column-oriented
`fields` + `data[][]` responses into typed camelCase JSON, adds derived values
(size estimated from H, merged SBDB and Sentry profiles), and gives clean error
semantics. The frontend validates every response with zod.

## Quick start

Prerequisites: Go ≥ 1.26 (an older Go downloads the right toolchain automatically), Node ≥ 22, pnpm ≥ 10.

```bash
make install      # go mod download + pnpm install
make dev          # API on :8080 (live reload via air) + web on :5173
```

Open http://localhost:5173. No API keys are needed because the JPL SSD APIs are public.

Other targets: `make test`, `make lint`, `make build`, `make fmt` (`make help` lists them all).

## API

All endpoints are `GET` and return `{ "data": … }`. Errors return `{ "error": { "code", "message" } }`.

| Endpoint | Description |
|---|---|
| `/api/v1/health` | Liveness |
| `/api/v1/summary` | KPIs: next-30-day approaches, closest/largest flyby, Sentry count and top risk, latest fireball |
| `/api/v1/close-approaches?from=&to=&maxDistAu=&minDiameterM=&limit=` | Earth close approaches (defaults: next 60 days, ≤ 0.05 AU) |
| `/api/v1/risk?limit=` | Sentry risk table sorted by cumulative Palermo scale |
| `/api/v1/objects/{des}` | SBDB orbit and physical data, merged with the Sentry assessment |
| `/api/v1/objects/{des}/close-approaches` | Encounters within 0.2 AU, 1900–2200 |
| `/api/v1/fireballs?limit=` | Most recent fireball events |

Upstream responses are cached in memory: close approaches for 1 h, Sentry and fireballs for 6 h, SBDB for 24 h.
Concurrent requests for the same uncached key share a single upstream call.

### Configuration (env)

See `backend/.env.example`: `ADDR`, `APP_ENV`, `LOG_LEVEL`, `CORS_ORIGINS`, `JPL_BASE_URL`,
`UPSTREAM_TIMEOUT`, `REQUEST_TIMEOUT`, `RATE_LIMIT_PER_MIN`, `TRUSTED_PROXIES`.

## Project structure

```
backend/
  cmd/server/            entrypoint: config, wiring, graceful shutdown
  internal/config/       env config
  internal/jpl/          typed JPL SSD client (cad, sentry, sbdb, fireball) + fixtures
  internal/neo/          domain models, service (caching, merging, summary), physics helpers
  internal/cache/        generic otter-backed TTL cache with load coalescing
  internal/httpapi/      chi router, middleware, handlers, param validation, error mapping
frontend/src/
  app/                   app root, providers, router, theme
  components/ui/         shadcn/ui primitives (generated)
  components/layout/     app shell, masthead (nav, "/" search, UTC clock, theme switch), page header
  components/common/     Section, Readout, RiskMark, DataTable (TanStack Table v9), PlainTable, chart theme, states…
  features/<feature>/    schemas.ts (zod) · api.ts (query options) · hooks/ · components/
                         close-approaches · risk · objects · orbit · fireballs · summary
  hooks/                 useUrlState, useDebounce, useMediaQuery, useTheme
  lib/                   api-client, query-client, format, orbital (Kepler), constants
  pages/                 route components (lazy-loaded)
docs/DESIGN.md           the visual system: tokens, type, components, data-viz and 3D rules
docs/IDEAS.md            the other brainstormed project ideas and the roadmap
```

## Notes on the science

- **Lunar distance (LD):** 1 LD = 384,400 km ≈ 0.00257 AU.
- **Size from H:** if no measured diameter exists, size is estimated as D = 1329 km / √p · 10^(−H/5)
  with albedo p between 0.05 and 0.25. That gives a range, not a single number.
- **Palermo scale:** log₁₀ of the hazard relative to the background impact risk. Below −2 means
  no likely consequence; −2 to 0 merits monitoring; above 0 is of concern. **Torino** (0–10) is the public scale.
- **Orbit viewer:** two-body Keplerian propagation from SBDB osculating elements. Planets use JPL's mean
  J2000 elements (Standish). The orbit is drawn solid above the ecliptic and dashed below, with drop lines,
  nodes (☊ ☋), perihelion/aphelion (q/Q) and the next Earth encounter. It is fine for visualization, not for
  precise ephemerides (planetary perturbations are ignored).

## Data credits

NASA/JPL Solar System Dynamics and CNEOS: [SSD APIs](https://ssd-api.jpl.nasa.gov/).
Fireball data comes from US Government sensors, via JPL.
