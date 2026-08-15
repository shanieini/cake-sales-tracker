# SVG Icon & Logo Craft

General design principles for hand-built SVG marks — apply these whenever you're drawing new geometry, not just picking an existing icon.

## Build on a grid

Pick one square grid for the whole set and stick to it — don't mix. Two grids cover almost everything:

- **24×24** for functional UI icons (this matches `lucide-react`, already used throughout this repo — reuse the same grid so a hand-drawn icon sits next to a lucide one without looking a different size).
- **512×512** (or any large round number) for a logo mark meant to scale up, where fine detail at small sizes doesn't matter.

Within the grid, keep a consistent live area — e.g. lucide icons draw within roughly a 20×20 area centered in the 24×24 box, leaving a ~2px margin on each side so icons don't visually touch their bounding box or crowd neighboring icons.

## Stroke weight is a system property, not a per-icon choice

Pick one stroke width for an entire icon set (lucide uses `stroke-width: 2` at the 24×24 grid) and never vary it icon-to-icon — inconsistent stroke weight is the single most common thing that makes a hand-mixed icon set look sloppy next to a library like lucide. If a shape needs to *look* bolder or lighter, adjust the shape, not the stroke.

Use `stroke-linecap="round"` and `stroke-linejoin="round"` for a friendly, modern feel (matches lucide); use `"butt"`/`"miter"` only if you're deliberately going for a sharper, technical look — and then apply that choice to the whole set, not one icon.

## Optical alignment beats mathematical alignment

Shapes with different geometry read as different sizes even when their bounding boxes match:
- A circle needs to be drawn slightly *larger* than a square of the "same" size to look equally sized, because a circle's mass is concentrated toward its center.
- A triangle (e.g. a "play" glyph) needs to be nudged a few percent larger still, for the same reason.
- Vertically, round shapes often need to sit ~1–2% higher than their mathematical center to look centered, because the eye weighs the bottom of a shape more than the top.

When something "looks" slightly off-center despite the numbers being correct, trust your eye and nudge it — don't fight the math.

## Negative space and simplicity

- Favor a single closed silhouette over multiple disconnected shapes where possible — it survives shrinking better and reads faster as a glyph.
- Use negative space deliberately (a shape cut *out* of a solid mass) rather than as an accident of overlapping strokes.
- If you can remove a detail without losing recognizability, remove it. The test that matters is the 16px test below, not how it looks at 512px in your editor.

## The small-size test

Any icon meant to render at 16–32px (favicons, toolbar icons, list glyphs) must be legible there — that's the actual product surface, not the size you're editing it at. Verify this by actually rendering it, not by reasoning about the SVG coordinates: run `scripts/render_preview.js` (see `SKILL.md` → "Rendering & exporting") and look at the contact-sheet PNG it produces. Judging legibility from markup alone misses real failures — gradients, anti-aliasing, and stroke rendering all behave slightly differently once actually rasterized than they look in the abstract.

Concretely, what to check for once you're looking at the real render:
- Avoid thin details thinner than the stroke width — they'll disappear or alias at small sizes.
- Avoid text inside an icon glyph (it becomes an unreadable smudge below ~24px); text belongs in a wordmark meant to be read at larger sizes, not in an icon.
- Prefer 1–2 colors over gradients/many colors for anything under 24px — subtlety is invisible at that size and just costs contrast.

## Color

- Design the glyph in a single color (or as a stroke-only outline) first, then decide if color adds anything — a shape that only works because of color usually doesn't actually read as a shape.
- For a mark that needs to work on both light and dark backgrounds (favicons, app icons, anything outside your own app chrome where you don't control the background), either use a background container with fixed contrast (a colored tile behind a white/black glyph — see this repo's `IconTile`/app-icon gradient pattern) or provide the mark as a currentColor-driven outline so the consuming context can theme it.
- Check contrast, not just aesthetics — a glyph and its background should meet at least ~3:1 contrast so it doesn't wash out on a phone screen in sunlight.

## Accessibility

- Purely decorative icons (next to a text label that already says the same thing) should carry `aria-hidden="true"` so screen readers don't announce them redundantly.
- An icon that *is* the only label (an icon-only button) needs an accessible name from the surrounding element (`aria-label` on the button, not buried inside the SVG) — don't rely on an SVG `<title>` alone, support for it is inconsistent.

## Exporting to raster (PNG/ICO)

SVG is the source of truth; only rasterize when a format genuinely requires it (favicon `.ico`, some app-store/OS icon slots that reject SVG). When you do:
- Rasterize at the target's native pixel size, not by scaling a smaller raster up — scaling up after the fact reintroduces the blur SVG was chosen to avoid. `scripts/render_preview.js` does this correctly (renders each requested size independently through a real browser rather than resizing one bitmap).
- A `.ico` file is a multi-resolution container (commonly 16×16 + 32×32, sometimes 48×48), not a renamed PNG. `scripts/build_ico.js` packs already-rendered PNGs into a real one. If both scripts genuinely fail in the current environment (no Node, no Playwright browser installed), say so rather than writing a same-named file with the wrong internal format.
- Check whether the project already has a rasterization path before reaching for a new one — e.g. this repo renders PNGs at request time via Next's `ImageResponse` (`next/og`) rather than shipping pre-rasterized static files (see `references/repo-icon-system.md`).
