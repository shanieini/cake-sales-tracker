---
name: logo-icon-design
description: Design and build SVG-based logos, brand marks, favicons, app icons, and UI icons. Use this whenever the user asks to create, redesign, or add a logo, icon, favicon, app icon, wordmark, or brand mark — including requests that just say "add an icon for X", "make a favicon", "we need a logo", or "design an icon set" without using the word "SVG" explicitly. Covers three distinct jobs: (1) a full brand logo/wordmark, (2) favicon + installable app icons (manifest, apple-touch-icon), (3) small functional UI icons used inside the product. Always check this skill before hand-rolling icon markup, since this repo already has an established icon system that new work should match rather than reinvent.
---

# Logo & Icon Design

Three genuinely different jobs share the word "icon" — figure out which one you're doing before writing any markup, because they have different constraints:

1. **A UI icon** — small, functional, sits next to text or inside a badge (this app uses `lucide-react` for these). Optimize for legibility at 16–24px and consistency with every other icon on screen.
2. **Favicon / app icons** — the same mark rendered at fixed sizes (32, 180, 192, 512...) for the browser tab, home-screen install, and PWA manifest. Optimize for a silhouette that still reads as a blob of color at the smallest size actually shipped.
3. **The brand mark** — the cupcake logo itself (`src/components/CakeLogo.tsx`), used at both large (splash tile, 80px) and small (header badge, 48px) production sizes. Optimize for both — see `references/repo-icon-system.md`.

**Before drawing anything, check `references/repo-icon-system.md`.** This app already has a working icon system — one shared glyph, one gradient-tile treatment, one `ImageResponse`-based renderer feeding every icon surface. New icon work should extend that system, not sit next to a second, inconsistent one.

For the craft itself — grids, stroke weight, optical alignment, what makes a mark hold up at small sizes — read `references/svg-craft.md`.

**Render it and actually look, don't just reason about the markup.** Writing SVG by hand means judging shapes from coordinates instead of eyes. `scripts/render_preview.js` renders a given SVG through a real headless browser at several pixel sizes and produces one labeled contact-sheet PNG; use it, then use the Read tool on the resulting `contact-sheet.png` before calling any icon or logo finished. This has already caught a real bug in this app: a richer cake mark with six drip-icing details looked great at 192/512px but washed into a plain blob by the 32px favicon and 48px header-badge sizes this app actually ships — invisible from the markup alone, obvious once actually rendered at those exact sizes. Fixed by simplifying to three bolder drips for the small-size composition rather than the same six subtle ones scaled down.

## Workflow

### 1. UI icon (job type 1)
- Check whether `lucide-react` (already a dependency) already has a fitting icon before drawing a custom one.
- If it's a small colored badge, wrap it in the existing `IconTile` component (`src/components/IconTile.tsx`) rather than styling a new container.
- Only hand-draw a new glyph when nothing in lucide fits — and hold it to the same 24×24 grid, `stroke-width: 2`, round caps/joins as every lucide icon already in the app.

### 2. Favicon / app icons (job type 2)
- Read `references/repo-icon-system.md` first — this app already has a deliberate structure (one shared `AppIconTile` renderer, per-surface Route Handlers, `manifest.ts`). Extend it, don't parallel it.
- To change the *design* (new glyph, new gradient), edit `AppIconTile` in `src/lib/app-icon-mark.tsx` — that single change propagates to the favicon, the apple-touch-icon, and both manifest icon sizes automatically.
- After adding or resizing an icon surface, check `src/app/manifest.ts` — new files need an entry there or PWA install won't pick them up.

### 3. The brand mark (job type 3)
- `src/components/CakeLogo.tsx` is the cupcake mark used throughout the app UI (header badge, splash, empty states) — same 24×24 grid as lucide, `currentColor` body + one fixed accent color (the cherry) that doesn't shift with the theme.
- Confirm with the user before finalizing a new mark's color/style — a logo is the one artifact here where getting the vibe wrong is expensive to undo, unlike a UI icon that's a one-line swap.

## Rendering & exporting

Two small scripts back the "actually look at it" and "actually rasterize it" steps above. Both are plain Node and use the Playwright + Chromium already available in this environment:

```bash
# Render a master SVG at several sizes + one labeled contact-sheet PNG for eyeballing.
node .claude/skills/logo-icon-design/scripts/render_preview.js path/to/mark.svg /tmp/preview 32,48,80,192,512
# then: Read /tmp/preview/contact-sheet.png

# Pack specific rendered sizes into a real multi-resolution favicon.ico, if one is ever needed
# (this app currently uses ImageResponse for its favicon instead — see repo-icon-system.md).
node .claude/skills/logo-icon-design/scripts/build_ico.js favicon.ico /tmp/preview/preview-32.png
```

If `node`/Playwright genuinely isn't available in the current environment, both scripts fail loudly rather than silently — say so explicitly rather than skipping the step quietly or describing an unverified file as if it were rendered.

## Sanity checks before calling any of this done
- **Small-size test**: render at the exact sizes this app ships (32 favicon, 48 header badge, 80 splash, 192/512 manifest — see `repo-icon-system.md`) and look at the contact sheet. Does the silhouette still read, or does it turn to mud? A mark that only reads well above ~80px needs a *simplified* version for the smaller surfaces, not just the same shape scaled down — verify this by actually rendering both, the same way this skill caught the six-drip-icing case.
- **Consistency test**: does the new glyph match the cupcake's existing treatment (flat fills, one accent color, `currentColor` body) or did you just invent a second style?
- **No orphaned raster claims**: never describe a PNG as "rendered" or "verified" unless `render_preview.js` (or an equivalent real tool) actually produced it — unverified markup is not a checked design.
