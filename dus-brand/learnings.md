# DUS Brand Learnings

Corrections and rules established during builds. Read this before every DUS design task.

## Corner Treatment (Established 2026-08-25, from Jenny's feedback)

**Rule: All cards, panels, and boxed elements use straight corners (border-radius: 0) with plat-sheet corner ticks (`.dus-ticks`). Never use rounded corners on cards.**

- Cards get `border-radius: 0` and the `dus-ticks` class with `<span class="tick-b"></span>` inside
- The corner ticks are the DUS brand's distinctive treatment — use them consistently on all boxed elements (cards, credstrip, usp panels, pull panels)
- Buttons keep `--r-md` (6px) — squared but not sharp
- Eyebrow pills keep `--r-pill` (999px) — that's their nature
- No other elements should use rounded corners

## No Accent Bars or Lines (Updated 2026-08-25)

**Rule: Never use short decorative bars or lines — any color, any orientation. They are a dead giveaway the design was AI-generated.**

This means:
- No `border-left` accent bars on quotes, notes, rule chips, or service rows
- No `border-top` accent bars on cards
- No vertical divider bars between stat columns
- No short horizontal rules (`.dus-rule` removed)
- No thin decorative lines used as separators between contact fields
- Color is irrelevant — green, teal, neutral, any color. The bar/line motif itself is the problem.
- The corner ticks (`.dus-ticks`) are the DUS brand's distinctive treatment for cards — not accent bars

## No Plain Black Backgrounds (Established 2026-08-25)

**Rule: Never use plain/flat black for backgrounds. Always use the teal or ink gradients (`--field-teal`, `--field-ink`) for dark surfaces.**

- No `background: #000`, `background: black`, or any flat dark solid
- Dark surfaces must always use the branded gradients with the green under-glow
- This includes footers, hero sections, dark cards, and any dark panel

## Icons (Established 2026-08-25)

**Rule: Icons must always be outlined (line) style with DUS gradient stroke. Never use filled/solid icons.**

- Source: Remix Icon (remixicon.com), always use "-line" suffix variants
- Apply DUS gradient (teal→green, left to right) as stroke color via SVG `<linearGradient>`
- Never use filled icons, never use flat single-color icons
- Use simple geometric SVG elements (rect, line, polygon, path) — NOT compound fill-variant paths with stroke applied. Compound paths create double-lined outlines. Single-line only.
- Stroke weight: `stroke-width="1.2"` for a thin, refined line. `1.5` is too heavy.

## Visual Balance (Established 2026-08-25)

- Don't stack multiple text-heavy sections without visual breaks
- Cards with icons, maps, and stat blocks should appear early in the page to break up text
- The Kudu section (4 icon cards) was moved up to position 2 (after "Your customers") for this reason

## Logo Size

- Hero logo should be at least 48px height (was 34px, felt too small)

## PDF Export Standards (Established 2026-08-25, from Jenny's feedback)

**Rule: PDFs must render consistently with no layout shifts, clipped text, or shadow artifacts.**

### CSS that breaks in PDF (never use in print contexts):
- **`background-clip: text` / `-webkit-background-clip: text`** — gradient text is the #1 cause of clipped/missing text in Chrome PDF exports. Use solid `color` instead.
- **`box-shadow`** — renders as ugly rectangular artifacts in PDF. Remove on all cards and elements via `@media print` and `.print-mode`.
- **Complex stacked gradients** — can render inconsistently. Keep backgrounds simple for print surfaces.

### Two-PDF workflow:
- **Print PDF** (`dus-soq-print.pdf`): `beforeprint` auto-fires → applies `print-mode` class → white backgrounds, solid teal headlines. Generated with standard `--print-to-pdf`.
- **Digital PDF** (`dus-soq-digital.pdf`): Create a temp HTML copy that comments out the `beforeprint` listener (so `print-mode` never activates), but keeps `@media print` layout rules intact (body block, no padding, page breaks). Then `--print-to-pdf` the temp file.

### Print-mode text rules:
- Headlines: solid `color: var(--teal-500)` — never gradient text
- Labels/micros: solid `color: var(--teal-500)` — never gradient text
- Cards: `box-shadow: none` in both `body.print-mode` and `@media print`

### Chrome headless commands:
```
# Print PDF (beforeprint auto-applies print-mode):
"...Google Chrome" --headless --no-pdf-header-footer --print-to-pdf=print.pdf file:///path/to/file.html

# Digital PDF (from temp file with beforeprint disabled):
"...Google Chrome" --headless --no-pdf-header-footer --print-to-pdf=digital.pdf file:///path/to/temp.html
```

## Previous learnings from earlier sessions

- [2026-08-06] Logo CSS pattern: constrain by height only, `width: auto; object-fit: contain; display: block;` — never set both width and height
- [2026-08-06] Stat-row dividers: removed entirely — no divider bars between stats
- [2026-08-06] Button colors: primary = Dudley Green (`--green-500`), accent = DUS Teal (`--teal-500`)
- [2026-08-06] Icons: source from Remix Icon (remixicon.com), outlined style only, DUS gradient stroke (teal→green, left to right)
- [2026-08-06] Dividers on dark surfaces: no thin decorative bars. Use spacing or layout to separate content.
- [2026-08-25] Infographic icon containers (e.g. coverage map badges): use `border-radius: var(--r-md)` (squared), never `border-radius: 50%` (circles). "No circles except checklist checkmarks" applies everywhere.
- [2026-08-25] Infographic column separators (thin vertical/horizontal lines between stat or capability columns): remove entirely. Use spacing instead. The "no decorative bars/lines" rule covers infographic layouts too.
- [2026-08-25] Photos and images: `border-radius: 0`. Only buttons keep `--r-md` and pills keep `--r-pill`.
- [2026-08-25] Never use `--teal-050` or any light blue/teal as a full section background. Keep section backgrounds to white, `--neutral-100` gray, or dark teal field gradients. Use structural 1px hairline dividers (`border-bottom: 1px solid var(--neutral-200)`) between consecutive same-background sections instead.
