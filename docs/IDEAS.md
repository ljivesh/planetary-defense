# Project ideas & roadmap

Brainstormed astronomy projects built on public NASA / ESA / observatory data.
**Planetary Defense Dashboard** (this repo) was picked first; the rest are parked here.

---

## 1. Planetary Defense Dashboard ✅ *in progress*

Near-Earth object monitoring: upcoming close approaches, the Sentry impact-risk table,
object profiles with a 3D orbit viewer, and fireball (bolide) events.

**Data:** JPL SSD/CNEOS APIs (`cad.api`, `sentry.api`, `sbdb.api`, `fireball.api`).

### Roadmap

- [x] Go API proxy with caching, normalized JSON, tests
- [x] Overview KPIs, close-approach timeline, risk table, fireball list
- [x] Object profile: orbit elements, physical params, Sentry assessment, encounter history
- [x] 3D orbit viewer (two-body Kepler propagation, time scrubber)
- [ ] **Fireball world map** (MapLibre GL) with energy-scaled markers
- [ ] **Scout API** feed: unconfirmed NEOCP objects with hypothetical impact scores
- [ ] **Horizons API** ephemerides for accurate positions (replace two-body approximation near encounters)
- [ ] Show close-approach **B-plane / uncertainty** (dist_min–dist_max) as an error bar on the timeline
- [ ] Alerts: email/push when a new object enters Sentry or passes within 1 LD
- [ ] Persist daily snapshots (Postgres/SQLite) to chart how risk evolves as orbits are refined
- [ ] Impact effects calculator (crater size, airburst altitude) from size/velocity/angle
- [ ] Deploy: API container + static frontend (Fly.io/Render + Cloudflare Pages)

---

## 2. Transit Hunter – open TESS exoplanet candidate pipeline

Search public TESS light curves for transiting planets nobody has catalogued yet, vet
them with physics checks + ML, and publish a ranked explorer. Strong candidates can be
submitted to ExoFOP as **Community TOIs (CTOIs)** – a real path to scientific contribution.

**Why:** fainter full-frame-image stars are under-searched; the TOI catalog gives a
built-in answer key, so precision/recall are measurable.

**Data**
| Source | What | Access |
|---|---|---|
| MAST (STScI) | TESS SPOC 2-min + FFI light curves (QLP, TESS-SPOC, TGLC) | `lightkurve`, `astroquery.mast` |
| TIC v8.2 | Stellar radius, Teff, magnitude, contamination | MAST Catalogs |
| Gaia DR3 | Parallax, RUWE (binarity), neighbors | `astroquery.gaia` |
| NASA Exoplanet Archive | Confirmed planets, `toi` table | TAP |
| ExoFOP-TESS | TOI dispositions (training labels) | CSV |
| Villanova EB catalogs | Known eclipsing binaries (false positives) | Download |
| Kepler DR24/DR25 TCEs | Labeled data for pre-training | Exoplanet Archive |

**Pipeline:** ingest sector → detrend (`wotan`) → search (`transitleastsquares` / BLS) →
vet (odd/even, secondary eclipse, V-shape, centroid, radius sanity + 1D CNN on
global/local views) → cross-match (TOIs, EBs, Gaia RUWE, contamination) →
`TRICERATOPS` false-positive probability → web explorer + CTOI export.

**Milestones:** recover known TOIs on one SPOC sector (>90 % recall at SNR>10) →
vetting + CNN → FFI faint stars at scale → explorer UI → first CTOI submissions.

---

## 3. Rubin / ZTF transient anomaly feed

Consume public alert-broker streams (Fink, ALeRCE, ANTARES, Lasair) from the Vera C.
Rubin Observatory LSST and ZTF, run anomaly detection on light-curve features, and
publish a "weird things in the sky tonight" feed with plain-language explanations
(LLM-generated summaries of classifier outputs + cross-matches).

- **Data:** broker REST/Kafka APIs, TNS (Transient Name Server), Gaia/PS1 cross-matches
- **Hard parts:** no clean ground truth for "interesting"; alert volume
- **Hook:** Rubin is the biggest new data firehose in astronomy right now

---

## 4. Personal aurora forecaster

NOAA SWPC real-time solar-wind (Bz, speed, density) + NASA DONKI CME/flare events →
ML model predicting Kp 1–3 h ahead → combined with local cloud cover and darkness for
the user's location → push notification "go outside now".

- **Data:** NOAA SWPC JSON feeds, DONKI API (`api.nasa.gov`), OVATION aurora model, Open-Meteo clouds
- **Shape:** small, product-friendly, mobile/PWA candidate

---

## 5. Satellite-streak impact tracker

Estimate how much mega-constellations (Starlink, Kuiper…) contaminate astronomical
images: propagate CelesTrak TLEs (SGP4), intersect with observatory pointings / survey
footprints, and report predicted streak rates per field and per night.

- **Data:** CelesTrak / Space-Track TLEs, observatory schedules, Rubin/ZTF footprints
- **Value:** advocacy + observation planning (pick fields with fewer passes)

---

## Other quick ideas

- **Sky tonight, personalized** – visible planets, ISS passes (Open Notify / TLEs), meteor showers, Moon phase for your location.
- **APOD explorer** – semantic search over 30 years of Astronomy Picture of the Day (NASA APOD API + embeddings).
- **JWST image story maps** – annotated deep-zoom JWST images with catalog overlays (MAST + Aladin Lite).
- **Gaia DR4 neighborhood explorer** – 3D map of stars within 100 pc, filters for binaries/exoplanet hosts (DR4 expected Dec 2026).
