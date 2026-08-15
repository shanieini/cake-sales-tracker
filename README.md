# Cake Sales Tracker

A Hebrew, mobile-first app for a home baker to log cake sales, track
expenses, and see a monthly/yearly sales report — built with Next.js 16 and
Tailwind. No login, no backend: everything lives in the browser's
`localStorage`, so it works the moment you open the page.

Started life as a mini-app bolted onto an unrelated trip-planner repo (a
convenient, already-set-up scaffold); this is that app pulled out into its
own project, since a cake business has nothing to do with trip planning and
never should have shared a repo with one.

## Running it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it — no
environment variables, no database to set up.

## Installing it on a phone

The app is a PWA, so it installs straight from the browser — no app store:

- **Android (Chrome):** open the site → ⋮ menu → **Add to Home screen**.
- **iPhone (Safari):** open the site → Share button → **Add to Home Screen**.

Either way it lands on the home screen with the cupcake icon and opens
full-screen, with no address bar — indistinguishable from a "real" app,
because as far as the OS is concerned it now is one.

## How it's put together

- **No login, no backend.** `src/lib/store.ts` keeps sales, cake types, and
  expenses in `localStorage` via a `useSyncExternalStore` store (the same
  shape as `useIsDesktop`), so every add/edit/delete anywhere in the tree
  re-renders every reader without prop-drilling or a context provider. One
  generic `createListStore` factory backs all three lists — sales, cake
  types, and expenses are all just "a list of objects with an id".
- **Hebrew only, on purpose.** `src/lib/strings.ts` is a plain object of
  Hebrew strings — no dictionary/locale system, no language switcher, since
  the baker only reads Hebrew. `src/app/layout.tsx` sets `dir="rtl" lang="he"`
  directly on `<html>`.
- **Its own "rich patisserie" palette** — chocolate brown, warm cream,
  antique gold — defined once in `globals.css` as the app's `:root`/`.dark`
  tokens (`--primary`, `--background`, `--border`, …). Every shared UI
  component (`src/components/ui/`, shadcn on `@base-ui/react`) reads those
  tokens rather than hardcoding colors, so buttons/cards/inputs/the chart/
  focus rings all re-theme together; dark mode follows the OS via
  `prefers-color-scheme`, no toggle built yet.
- **Its own logo and loading splash** instead of a generic icon: `CakeLogo.tsx`
  is a cupcake with a frosting swirl and a cherry, inline SVG on lucide's own
  24×24 grid so it drops into the same size classes as any lucide icon.
  `AppSplash.tsx`
  / `SplashOverlay.tsx` are the branded loader (sonar rings + a breathing
  mark + a sliding progress bar, pure CSS keyframes so it paints with the
  first HTML and needs no client JS to appear), shown on every full page
  load via the root layout and on route-level loading via `loading.tsx`.
- **Installable as a real home-screen app.** `manifest.ts` (Next's file-based
  manifest convention) plus `icon.tsx` / `apple-icon.tsx` / `icons/` cover
  every icon surface — browser tab, iOS home screen, and the two Android
  install sizes (a plain tile and a "maskable" one with extra padding so
  Android's circular/squircle crop doesn't clip the mark) — all rendered
  from one shared `AppIconTile` (`src/lib/app-icon-mark.tsx`) via
  `ImageResponse`, so the favicon and the installed-app icon are guaranteed
  to match the mark used inside the app itself.

### The three pages

- **`/`** (`CakeTracker.tsx`) — a "Log a sale" button, four revenue stat
  cards (today / last 7 days / this month / all-time, with "today" as a
  solid-fill hero tile), a best-seller callout, rows linking to the report
  and expenses pages, and the sale history grouped by day.
- **`/report`** (`SalesReportPage.tsx`) — a month↔year toggle, a
  revenue-by-period bar chart (`RevenueChart.tsx`, built on
  [Recharts](https://recharts.org) — real hover/tap tooltips, not
  hand-rolled `<div>` bars), and an exact-numbers list underneath (revenue,
  cakes sold, and that period's own best seller). The chart is
  deliberately revenue-only: cakes-sold is a second, differently-scaled
  measure, and a chart never gets a second y-axis for that — count rides
  along in the tooltip and the list instead. Kept `dir="ltr"` even on this
  RTL page, the same convention as money amounts: a chart is a widget people
  expect to read left-to-right regardless of surrounding text direction.
- **`/expenses`** (`ExpenseTracker.tsx`) — the spend-tracking counterpart:
  a "Log expense" button, the same four-stat-card shape (spend instead of
  revenue), a category breakdown (7 fixed categories — ingredients,
  packaging, equipment, delivery, marketing, rent, other — since a bakery's
  cost categories don't vary the way its menu does, so there's a picker but
  no manager UI for them), and a day-grouped history.

### The sale form (`AddSaleSheet.tsx`)

Cake type is a real dropdown (`Select`, base-ui) listing only cake types
already in the catalog (managed via `ManageCakeTypesSheet.tsx` — add a type
with a **required** price, delete one, duplicate names blocked) — not free
text, so there's no typo risk. Picking a type always fills in its price. If
the catalog is empty, the dropdown is replaced by a prompt with a button
straight to the cake-type manager, and the submit button is disabled — no
dead-end empty dropdown. Editing an old sale whose cake type was since
deleted gets a synthetic stand-in entry so it still displays and saves
correctly.

Quantity, price, and note are the shared `Input`/`Textarea`; the date field
is `DateField` — a real native `<input type="date">` (so pickers and form
submission behave normally), with the placeholder overlay trick described in
that file's own comment. No custom calendar/date-picker component: this
package has no such primitive, and a native picker is the better mobile
control anyway.

Deliberately no `required`/`min` HTML attributes anywhere in these forms —
the browser's own validation popup shows in whatever language the browser is
set to, not Hebrew. Every field is validated in the submit handler instead,
with a Hebrew `setError()` message, same pattern throughout.

## Testing

```bash
npm test        # unit tests (Vitest) — pure logic: revenue/expense totals,
                 # best-seller picking, day/month/year grouping
npm run lint
```

The business logic (`src/lib/summarize.ts`) is unit-tested; the UI layer
that consumes it isn't covered by end-to-end tests yet (no Playwright setup
here).

## Ideas for next features

- **Profit** = revenue − expenses. Not built: revenue lives per sale,
  expenses aren't linked to a sale or a cake type, and it's not obvious a
  baker wants "profit" broken down the same way as "revenue" (by month? by
  cake type, apportioning shared costs like rent somehow?) without asking
  first.
- Multiple currencies — right now everything is a fixed `₪`
  (`CAKE_CURRENCY` in `src/lib/strings.ts`).
- Sync across devices — would need real accounts and a backend (e.g.
  Supabase auth + tables for sales/cake types/expenses with row-level
  security), which this app deliberately doesn't have yet.
- Customer/order tracking: who ordered what, and a pickup date.
- Editing a cake type's default price from the manage-cakes list instead of
  only deleting and re-adding it (`updateCakeType` already exists in the
  store for this — just no UI wired to it yet).
- A monthly/yearly report for expenses too, mirroring `/report` — the
  pattern (`summarizeByPeriod`, `RevenueChart`) is already there to extend.
- An explicit light/dark/system theme toggle (currently OS-only, no
  settings page exists yet to put one on).
- Offline caching via a service worker — the app can be installed (see
  above) but a hard-offline reload before the browser has cached anything
  will still fail; a service worker would fix that.
