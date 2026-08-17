# Cake Sales Tracker

A Hebrew, mobile-first app for a home baker to log cake sales, track
expenses, and see a monthly/yearly sales report — built with Next.js 16,
Tailwind, and Supabase. Each account's data (sales, cake types, expenses) is
private to that account; there's no self-serve sign-up, an admin creates
each account directly in the Supabase dashboard (see
[Adding a user](#adding-a-user) below).

Started life as a mini-app bolted onto an unrelated trip-planner repo (a
convenient, already-set-up scaffold); this is that app pulled out into its
own project, since a cake business has nothing to do with trip planning and
never should have shared a repo with one.

## Running it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

This needs a Supabase project first — see [Setting up Supabase](#setting-up-supabase)
below. Without `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` set,
the app throws as soon as it tries to talk to Supabase (login, or any data
read/write).

## Setting up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` from this repo — it creates
   the `cake_types`/`cake_sales`/`cake_expenses` tables with row-level
   security so each account only ever sees its own rows.
3. In **Project Settings → API**, copy the **Project URL** and the
   **anon public** key.
4. Create a `.env.local` file in the repo root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Add at least one user (see below) before logging in — there's no
   sign-up screen.

### Adding a user

There's no in-app sign-up — accounts are created by the admin, directly in
Supabase:

1. Supabase dashboard → **Authentication → Users → Add user**.
2. For the **Email** field, use `<username>@cake-sales-tracker.local`
   (lowercase) — the login screen only asks for a username, so
   `src/lib/auth.ts` maps it to this fake address under the hood. It's
   never emailed, so any domain works as long as it's consistent.
3. Set a password, and turn on **Auto Confirm User** (there's no email
   flow here to confirm it another way).
4. Tell the person their username and password. They log in with those,
   exactly like before.

Each account's data is completely separate (row-level security keyed on
`auth.uid()`) — there's no shared workspace or way for one account to see
another's sales/expenses/types.

## Installing it on a phone

The app is a PWA, so it installs straight from the browser — no app store:

- **Android (Chrome):** open the site → ⋮ menu → **Add to Home screen**.
- **iPhone (Safari):** open the site → Share button → **Add to Home Screen**.

Either way it lands on the home screen with the cupcake icon and opens
full-screen, with no address bar — indistinguishable from a "real" app,
because as far as the OS is concerned it now is one.

## How it's put together

- **Real accounts, real backend, per-account data.** `src/lib/auth.ts` signs
  in against Supabase Auth (a login screen, no sign-up — see
  [Adding a user](#adding-a-user)); `src/lib/store.ts` reads/writes sales,
  cake types, and expenses straight to Supabase tables, scoped to the
  signed-in account by row-level security (`supabase/schema.sql`). Both are
  still exposed as `useSyncExternalStore` stores (the same shape as
  `useIsDesktop`), so every add/edit/delete anywhere in the tree re-renders
  every reader without prop-drilling or a context provider — writes update
  the in-memory cache immediately and only roll back if the Supabase
  request actually fails, so it still feels as instant as the old
  localStorage-only version. One generic `createListStore` factory backs
  all three lists — sales, cake types, and expenses are all just "a list of
  objects with an id" scoped to one table each.
- **Never deletes pre-Supabase local data.** This app used to be pure
  `localStorage`, with no accounts at all. `src/lib/migrate-legacy-data.ts`
  runs once on first login per browser: if the old `cake-sales:*` keys have
  anything in them, it uploads that into the newly-signed-in account and
  sets a `cake-sales:migrated:v1` flag so it doesn't re-upload on every
  login — but it never deletes or overwrites the original keys, so
  whatever was already saved in the browser stays exactly where it was.
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

### The five pages

- **`/`** (`CakeTracker.tsx`) — a "Log a sale" button, four revenue stat
  cards (today / last 7 days / this month / all-time, with "today" as a
  solid-fill hero tile), a best-seller callout, rows linking to the other
  four pages, and the sale history grouped by day.
- **`/report`** (`SalesReportPage.tsx`) — a cake-type breakdown card (every
  cake ranked by units sold, with a period picker scoping it to all time or
  one specific month/year), a month↔year toggle, a revenue-by-period bar
  chart (`RevenueChart.tsx`, built on [Recharts](https://recharts.org) —
  real hover/tap tooltips, not hand-rolled `<div>` bars), and an
  exact-numbers list underneath (revenue, cakes sold, and that period's own
  best seller). The chart is deliberately revenue-only: cakes-sold is a
  second, differently-scaled measure, and a chart never gets a second
  y-axis for that — count rides along in the tooltip and the list instead.
  Kept `dir="ltr"` even on this RTL page, the same convention as money
  amounts: a chart is a widget people expect to read left-to-right
  regardless of surrounding text direction.
- **`/expenses`** (`ExpenseTracker.tsx`) — the spend-tracking counterpart:
  a "Log expense" button, the same four-stat-card shape (spend instead of
  revenue), a category breakdown (7 fixed categories — ingredients,
  packaging, equipment, delivery, marketing, rent, other — since a bakery's
  cost categories don't vary the way its menu does, so there's a picker but
  no manager UI for them), and a day-grouped history.
- **`/cakes`** (`CakeTypesPage.tsx`) — every cake type with its price, the
  read-focused counterpart to `ManageCakeTypesSheet.tsx` (which stays as a
  quick add/delete popup reachable mid-flow, e.g. from the sale form's
  empty-catalog prompt). The only place that supports editing a price once
  set, via `AddCakeTypeSheet.tsx` and `updateCakeType` in the store.
- **`/profit`** (`ProfitPage.tsx`) — revenue minus expenses, by month/year:
  the same four-stat-card shape (net instead of revenue or spend, colored
  red when negative), a `ProfitChart.tsx` bar chart colored per bar by sign
  (the app's `--destructive` red for a losing period, `--primary` for a
  profitable one, rather than one fixed color), and a period list with the
  revenue/expenses breakdown under each net figure. Deliberately
  month/year rather than apportioned across individual cakes — splitting
  shared costs like rent per cake felt arbitrary without more product
  signal.

### The sale form (`AddSaleSheet.tsx`)

Cake type is a real dropdown (`Select`, base-ui) listing only cake types
already in the catalog (managed via `ManageCakeTypesSheet.tsx` for quick
add/delete, or the `/cakes` page for the full list plus editing a price —
both require a price, block duplicate names) — not free text, so there's
no typo risk. Picking a type always fills in its price. If
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

- Multiple currencies — right now everything is a fixed `₪`
  (`CAKE_CURRENCY` in `src/lib/strings.ts`).
- Self-serve sign-up / password reset — right now the admin creates every
  account by hand in the Supabase dashboard (see
  [Adding a user](#adding-a-user)); fine for a handful of accounts, not for
  many.
- Customer/order tracking: who ordered what, and a pickup date.
- A monthly/yearly report for expenses alone, mirroring `/report`'s
  cake-type breakdown but by expense category — `/profit` covers the
  combined revenue-vs-expenses view, not a category-over-time chart.
- An explicit light/dark/system theme toggle (currently OS-only, no
  settings page exists yet to put one on).
- Offline caching via a service worker — the app can be installed (see
  above) but a hard-offline reload before the browser has cached anything
  will still fail; a service worker would fix that.
