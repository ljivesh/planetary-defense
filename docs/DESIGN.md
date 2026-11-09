# DESIGN.md: Planetary Defense

The visual system for this dashboard. Read this before you change UI. Agents and humans
follow the same rules.

It was put together from public DESIGN.md references in
[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md):
SpaceX (black canvas, no decoration, tracked caps), ClickHouse (one scarce signal colour,
hairlines, depth from surface contrast), Vercel (Geist / Geist Mono split, negative display tracking)
and Sanity (mono "system readout" labels, achromatic greys). It copies none of them.

## 1. Atmosphere

**An instrument data sheet, not a SaaS dashboard.** It should feel like a JPL technical sheet or
an observatory console:
- near-black paper
- hairline rules
- figures set in mono
- one amber signal light

The data is the decoration. If a section needs an icon, a gradient or a card to look finished,
the content is wrong, not the chrome.

- Dark is the native state, and the light theme is the same sheet printed on paper.
- No shadows, glows, blurs, gradients, starfields or glassmorphism.
- Sections are separated by **1px rules**, not boxes.
- Colour carries meaning (signal, risk, Earth). It is never decoration.

## 2. Colour

### Surfaces and ink
| Token | Dark | Light | Use |
|---|---|---|---|
| `--canvas` | `#0a0a0a` | `#fafaf9` | Page floor, table background, chart surface |
| `--surface` | `#111111` | `#f2f2f0` | Inset areas: 3D viewport, row hover, inputs |
| `--hairline` | `#262626` | `#e4e4e2` | Rules, table rows, chart grid |
| `--hairline-strong` | `#3a3a3a` | `#c9c9c6` | Section top rules, input borders, axis baseline |
| `--ink` | `#ededed` | `#0a0a0a` | Headlines, primary figures, linked names |
| `--body` | `#a3a3a3` | `#525252` | Running text, secondary figures |
| `--muted` | `#6b6b6b` | `#8a8a8a` | Eyebrows, units, captions, axis ticks |

### Signal
| Token | Dark | Light | Use |
|---|---|---|---|
| `--signal` | `#ffb224` | `#b45309` | The one accent. Text and single highlights only |
| `--chart-signal` | `#c78213` | `#b45309` | Signal as a *data mark* (validated against canvas) |
| `--chart-earth` | `#3f86dc` | `#2a6fc9` | Earth: 3D orbit, Earth markers |
| `--chart-neutral` | `#8a8a8a` | `#737373` | Default marks when a series has no identity |

Signal is **scarce**. Aim for no more than three appearances per screen:
- the hero figure
- the active nav underline
- the currently selected or next object in a chart or the 3D view
- focus rings
- link hover

Signal is never used for body text or large fills.

`--chart-signal` and `--chart-earth` are a validated categorical pair. Run
`validate_palette.js` from the dataviz skill against `#0a0a0a` (dark) and `#fafaf9` (light):
- lightness band, chroma, CVD ΔE ≥ 24 and contrast all pass
- they always appear with a direct label

### Status (risk only)
`good #0ca30c` · `warning #fab219` · `serious #ec835a` · `critical #d03b3b`.
- Shown as an **8px square glyph + a mono text label**.
- Never a pill, never colour alone, never reused for a series.

## 3. Typography

| Role | Family | Size / weight | Tracking | Notes |
|---|---|---|---|---|
| Display XL | Geist | 56 / 500 | −0.035em | Hero object name |
| Display | Geist | 36 / 500 | −0.03em | Page titles |
| Heading | Geist | 20 / 500 | −0.015em | Section titles |
| Body | Geist | 14 / 400 | 0 | Text, descriptions (`--body`) |
| Eyebrow | Geist Mono | 11 / 500 | +0.08em, UPPERCASE | Section indices, labels, table headers (`--muted`) |
| Figure L | Geist Mono | 32 / 400 | −0.02em | Readout values |
| Figure | Geist Mono | 13 / 400 | 0 | Table numbers, definition values |
| Micro | Geist Mono | 10 / 500 | +0.1em, UPPERCASE | 3D labels, chart annotations |

- Every number is mono with tabular numerals (`.figure`). Units follow in `--muted` at a smaller size.
- Display weights stay at 500; the hierarchy comes from size, not weight.
- Display text is sentence case. Uppercase is reserved for mono labels.

## 4. Space and shape
- 4px base. The section rhythm is 64px (`py-16`) on desktop and 40px on mobile.
- Content is at most 1280px wide, with 16px gutters on mobile and 32px on desktop.
- Radius is **2px** on inputs and buttons and 0 everywhere else. No pills.
- Depth comes only from `canvas` → `surface` contrast and hairlines.

## 5. Components

- **Masthead:**
  - 48px row with a hairline bottom border
  - mono wordmark
  - uppercase mono nav, where the active item is `ink` with a 1px signal underline
  - search (`/` focuses it)
  - live UTC clock
  - text theme toggle
- **Section:**
  - `hairline-strong` top rule
  - eyebrow `02 / Close approaches`
  - heading and an optional one-line note in `--body`
  - text action on the right, `View all →`
  - no box
- **Readout:** eyebrow label, a Figure L value with its unit, and one line of context. Readouts sit
  in a row divided by vertical hairlines.
- **Table:**
  - no outer border
  - mono uppercase headers
  - hairline rows
  - figures right-aligned in mono
  - row hover uses `surface`
  - object names in `ink`, underlined on hover
- **Risk mark:** an 8px status square, then a signed figure, then a mono label (`−0.98 MONITOR`).
- **Buttons:** text-first, with an icon only when the action is spatial (play, pause, reset).
  The outline variant uses a `hairline-strong` border.
- **States:** empty and error states are plain text blocks with a mono eyebrow and no illustrations.
  Skeletons are hairline bars.

## 6. Data visualisation
These follow the dataviz skill:
- Single-series charts use `--chart-neutral` marks, with the selected or next item in `--chart-signal`. There is no legend.
- Grid lines are horizontal only, in `--hairline`. Axis ticks are mono 11px in `--muted`, and the baseline is `--hairline-strong`.
- Reference lines (Moon 1 LD, Hiroshima 15 kt) are dashed `--muted` with a micro label.
- Tooltips use a `canvas` background, a hairline border and no shadow. Values are mono in `ink`; labels are in `muted`.
- Text never takes a series colour.

## 7. 3D scene (orbit viewer)
- The background is `--surface`. There is no grid, only faint concentric AU rings and a ♈︎ direction tick.
- Planet orbits are thin `hairline-strong`, Earth's is `--chart-earth` and the object's is `--chart-signal`.
- Inclination is made visible:
  - the orbit segment above the ecliptic is solid and the segment below is dimmed
  - drop lines run to the plane
  - ☊/☋ mark the nodes, and q/Q mark perihelion and aphelion
- Bodies are constant pixel size. The Sun is a small core with a soft additive glow, the one
  allowed glow, because it is physically there.
- Labels are DOM, mono, 10px and uppercase. Lower-priority labels hide when they would overlap others.
- Stars are dark-theme only, sparse and dim.

## 8. Do / Don't
**Do**
- Lead each page with one real number or object, not a grid of equal tiles.
- Put units next to figures, in muted.
- Number the sections.

**Don't**
- Use rounded cards, drop shadows, gradients or glass.
- Use decorative lucide icons (corner icons on stats, icons inside badges, icons in section titles).
- Use pills or coloured badges for anything other than risk.
- Add a second accent colour.
- Set body copy in mono, or headlines in uppercase.
