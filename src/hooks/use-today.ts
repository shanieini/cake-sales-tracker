"use client";

import { useMemo, useSyncExternalStore } from "react";
import { toIsoDate } from "@/lib/summarize";

/**
 * A `Date` for "today", re-read whenever the tab/installed PWA regains
 * focus or visibility — not a precise midnight timer, but it covers the
 * realistic staleness case for this app: left open (backgrounded, not
 * closed) overnight, then reopened the next morning.
 *
 * Without this, the "today"/"this week"/"this month" stat cards
 * (`CakeTracker`, `ExpenseTracker`, `ProfitPage`) stay pinned to whatever
 * day it was when the page last loaded — their `summarizeCakeSales`/
 * `summarizeCakeExpenses` calls default `today` to `new Date()`, but are
 * wrapped in `useMemo(..., [sales])`/`[expenses]`, so the memo never
 * reruns just because the wall clock rolled over with no store write in
 * between.
 *
 * Returns a stable `Date` (only a new object once the calendar day
 * actually changes, not every render) so passing it into those `useMemo`
 * dependency arrays doesn't defeat their own memoization. Same
 * `useSyncExternalStore` shape as `useIsDesktop`.
 */
function subscribe(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  window.addEventListener("focus", callback);
  return () => {
    document.removeEventListener("visibilitychange", callback);
    window.removeEventListener("focus", callback);
  };
}

function getSnapshot() {
  return toIsoDate(new Date());
}

export function useToday(): Date {
  const todayIso = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  // Local midnight, not UTC: a date-time string without a zone offset
  // parses as local time, matching toIsoDate's own local getFullYear/
  // getMonth/getDate reasoning (see its doc comment) — this round-trips
  // back through toIsoDate to the same todayIso it was built from.
  return useMemo(() => new Date(`${todayIso}T00:00:00`), [todayIso]);
}
