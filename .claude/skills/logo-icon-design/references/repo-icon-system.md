# This App's Icon System

Everything icon-shaped in cake-sales-tracker traces back to one glyph and one renderer — extend these, don't build a parallel system next to them.

## The mark

`src/components/CakeLogo.tsx` — a cupcake with a frosting swirl and a cherry, on the same 24×24 viewBox convention `lucide-react` icons use, so it drops into the same `size-*` classes. Body is `currentColor` (tints via `text-*`, like any lucide icon); the cherry is a fixed hex (`#b3524a`) that doesn't shift with light/dark, the same way a candle flame or a real cherry wouldn't.

Used directly (as a React component) in three places: the header badge (`CakeTracker.tsx`, `size-6` inside a `size-12` gradient tile), the splash (`AppSplash.tsx`, `size-10` inside a `size-20` tile), and an empty-state icon (`size-9`, no tile, `text-muted`).

## The favicon/app-icon renderer

None of the icon *surfaces* (favicon, apple-touch-icon, manifest icons) render `CakeLogo.tsx` directly — they run server-side via `next/og`'s `ImageResponse` (Satori), which doesn't see React context, Tailwind classes, or `globals.css`'s CSS custom properties. So `src/lib/app-icon-mark.tsx` exports `AppIconTile`, a from-scratch redraw of the same cupcake using plain elements and literal hex values (the gold gradient, the ink brown, the cherry) — the *shape* stays in sync with `CakeLogo.tsx` by hand (they're the same paths), the *rendering technique* has to differ because Satori requires it.

One component, four call sites, each just picking a size:
- `src/app/icon.tsx` — 32×32, the browser-tab favicon
- `src/app/apple-icon.tsx` — 180×180, iOS home-screen icon (no rounding — iOS applies its own squircle mask)
- `src/app/icons/[size]/route.tsx` — 192 and 512, `purpose: "any"` in the manifest, via `generateStaticParams`
- `src/app/icons/maskable/route.tsx` — 512, `purpose: "maskable"`, same tile but a smaller `markRatio` so Android's circular/squircle crop doesn't clip the cupcake

To change the glyph app-wide (new mark, new gradient), edit `AppIconTile` once — all four surfaces pick it up automatically. Don't hand-edit the per-size route files unless you're changing which sizes exist or their static-params list.

## The manifest

`src/app/manifest.ts` — Next's file-based Web App Manifest convention, auto-served at `/manifest.webmanifest` and auto-linked in `<head>`. Lists the three `icons/` entries above by URL/size/purpose. Any new icon surface needs an entry here too, or PWA install won't offer it.

## What doesn't exist here (yet)

No wordmark — the app name (`מכירת עוגות`) is always set as text next to the mark, never baked into an SVG/logo image. No icon library beyond `lucide-react` for UI chrome + the one hand-drawn cupcake for the brand mark itself — there's no second hand-drawn icon set to stay consistent with, just the one mark to keep in sync across its four render sites.

## The size list to actually test against

Not a general "small/medium/large" — the exact pixels this app ships, in order of how often a user sees them:

| Size | Surface | Notes |
|---|---|---|
| 48px tile / 24px glyph | Header badge | Shown on every page, every load — the one that matters most |
| 80px tile / 40px glyph | Splash | Shown once per full page load, briefly |
| 32px | Browser-tab favicon | Smallest production size |
| 180px | iOS home-screen icon | |
| 192px, 512px | Android/manifest icons | Largest — full detail can survive here |

`render_preview.js`'s size list should include at minimum 32, 48, and 80 for anything meant to become `AppIconTile` — those three, not 192/512, are where a too-detailed mark actually fails.
