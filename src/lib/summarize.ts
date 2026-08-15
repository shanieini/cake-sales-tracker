import { CAKE_CURRENCY } from "./strings";
import type { CakeExpense, CakeSale, ExpenseCategory } from "./types";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Formats an amount with the shekel sign prefixed (e.g. "₪12.50"). Not
 * `Intl.NumberFormat` currency formatting — there's no locale/currency
 * switching here, the symbol is always ₪. */
export function formatCakeAmount(amount: number): string {
  return `${CAKE_CURRENCY}${amount.toFixed(2)}`;
}

export function saleTotal(
  sale: Pick<CakeSale, "quantity" | "pricePerUnit">,
): number {
  return round2(sale.quantity * sale.pricePerUnit);
}

/** `YYYY-MM-DD` for a `Date`, in local time — matches what a native
 * `<input type="date">` produces, which is what sale dates are stored as. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Whole calendar days between two `YYYY-MM-DD` strings, `to - from`.
 * Parsed as UTC midnight on both sides purely as a stable epoch to diff —
 * these are calendar days, not instants, so this stays correct across DST. */
function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.UTC(...parseIsoParts(fromIso));
  const to = Date.UTC(...parseIsoParts(toIso));
  return Math.round((to - from) / 86_400_000);
}

function parseIsoParts(iso: string): [number, number, number] {
  const [year, month, day] = iso.split("-").map(Number);
  return [year, (month || 1) - 1, day || 1];
}

export type TopSeller = { cakeType: string; quantity: number };

/** The cake type with the most units in a `cakeType → quantity` tally, ties
 * broken by whichever was tallied first. Shared by the all-time summary and
 * the per-month/per-year rollups below, so "best seller" means the same
 * thing (most units, not most revenue) everywhere it's shown. */
function topSellerFrom(quantityByType: Map<string, number>): TopSeller | null {
  let topSeller: TopSeller | null = null;
  for (const [cakeType, quantity] of quantityByType) {
    if (!topSeller || quantity > topSeller.quantity) {
      topSeller = { cakeType, quantity };
    }
  }
  return topSeller;
}

export type CakeSummary = {
  todayRevenue: number;
  todayCount: number;
  weekRevenue: number;
  monthRevenue: number;
  allTimeRevenue: number;
  allTimeCount: number;
  topSeller: TopSeller | null;
};

/**
 * Rolls sales up into the headline numbers the dashboard shows.
 * "This week" is a trailing 7-day window ending today (not Mon–Sun), since a
 * baker checking Tuesday cares about the last 7 days of business, not a
 * partial week. "This month" is the calendar month `today` falls in.
 */
export function summarizeCakeSales(
  sales: CakeSale[],
  today: Date = new Date(),
): CakeSummary {
  const todayIso = toIsoDate(today);
  const [todayYear, todayMonth] = parseIsoParts(todayIso);

  let todayRevenue = 0;
  let todayCount = 0;
  let weekRevenue = 0;
  let monthRevenue = 0;
  let allTimeRevenue = 0;
  let allTimeCount = 0;
  const quantityByType = new Map<string, number>();

  for (const sale of sales) {
    const total = saleTotal(sale);
    allTimeRevenue += total;
    allTimeCount += sale.quantity;
    quantityByType.set(
      sale.cakeType,
      (quantityByType.get(sale.cakeType) ?? 0) + sale.quantity,
    );

    if (sale.date === todayIso) {
      todayRevenue += total;
      todayCount += sale.quantity;
    }

    const daysAgo = daysBetween(sale.date, todayIso);
    if (daysAgo >= 0 && daysAgo < 7) {
      weekRevenue += total;
    }

    const [saleYear, saleMonth] = parseIsoParts(sale.date);
    if (saleYear === todayYear && saleMonth === todayMonth) {
      monthRevenue += total;
    }
  }

  return {
    todayRevenue: round2(todayRevenue),
    todayCount,
    weekRevenue: round2(weekRevenue),
    monthRevenue: round2(monthRevenue),
    allTimeRevenue: round2(allTimeRevenue),
    allTimeCount,
    topSeller: topSellerFrom(quantityByType),
  };
}

/** Groups anything date-stamped by day, most recent day first; within a day,
 * most recently logged first. Shared by sales and expenses below — both are
 * just "a list of dated rows", so one generic covers the grouping/sorting
 * for each instead of duplicating it. */
function groupByDay<T extends { date: string; createdAt: string }>(
  items: T[],
): { date: string; items: T[] }[] {
  const byDate = new Map<string, T[]>();
  for (const item of items) {
    const existing = byDate.get(item.date);
    if (existing) existing.push(item);
    else byDate.set(item.date, [item]);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, dayItems]) => ({
      date,
      items: [...dayItems].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }));
}

export function groupSalesByDay(
  sales: CakeSale[],
): { date: string; sales: CakeSale[] }[] {
  return groupByDay(sales).map(({ date, items }) => ({ date, sales: items }));
}

export function groupExpensesByDay(
  expenses: CakeExpense[],
): { date: string; expenses: CakeExpense[] }[] {
  return groupByDay(expenses).map(({ date, items }) => ({
    date,
    expenses: items,
  }));
}

export type PeriodSummary = {
  /** `"2026-08"` for a month, `"2026"` for a year — sorts correctly as a
   * plain string, which is also why it doubles as the React key. */
  key: string;
  label: string;
  revenue: number;
  count: number;
  topSeller: TopSeller | null;
};

function summarizeByPeriod(
  sales: CakeSale[],
  keyOf: (isoDate: string) => string,
  labelOf: (key: string) => string,
): PeriodSummary[] {
  const byKey = new Map<
    string,
    { revenue: number; count: number; quantityByType: Map<string, number> }
  >();
  for (const sale of sales) {
    const key = keyOf(sale.date);
    const entry = byKey.get(key) ?? {
      revenue: 0,
      count: 0,
      quantityByType: new Map<string, number>(),
    };
    entry.revenue += saleTotal(sale);
    entry.count += sale.quantity;
    entry.quantityByType.set(
      sale.cakeType,
      (entry.quantityByType.get(sale.cakeType) ?? 0) + sale.quantity,
    );
    byKey.set(key, entry);
  }

  return [...byKey.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { revenue, count, quantityByType }]) => ({
      key,
      label: labelOf(key),
      revenue: round2(revenue),
      count,
      topSeller: topSellerFrom(quantityByType),
    }));
}

/** `"2026-08"` → "אוג׳ 2026" (or the equivalent for `localeTag`). Parsed as
 * UTC noon on the 1st, same reasoning as `formatDay`: a calendar month, not
 * an instant. */
export function formatMonthLabel(monthKey: string, localeTag = "he-IL"): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year || 1970, (month || 1) - 1, 1));
  try {
    return new Intl.DateTimeFormat(localeTag, {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return monthKey;
  }
}

/** Revenue and cakes sold, one entry per calendar month that has at least
 * one sale, oldest first. */
export function summarizeByMonth(sales: CakeSale[]): PeriodSummary[] {
  return summarizeByPeriod(
    sales,
    (isoDate) => isoDate.slice(0, 7),
    (key) => formatMonthLabel(key),
  );
}

/** Revenue and cakes sold, one entry per calendar year that has at least one
 * sale, oldest first. */
export function summarizeByYear(sales: CakeSale[]): PeriodSummary[] {
  return summarizeByPeriod(
    sales,
    (isoDate) => isoDate.slice(0, 4),
    (key) => key,
  );
}

export type ExpenseSummary = {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  allTimeTotal: number;
  /** Largest first. Only categories with at least one expense appear. */
  byCategory: { category: ExpenseCategory; total: number }[];
};

/** Same today/last-7-days/this-month/all-time rollup as
 * `summarizeCakeSales`, for spend instead of revenue, plus a category
 * breakdown (all-time) — expense categories are fixed, so there's no "top
 * category" concept to compute the way there's a top *seller*; the reader
 * just wants to see where the money went, largest first. */
export function summarizeCakeExpenses(
  expenses: CakeExpense[],
  today: Date = new Date(),
): ExpenseSummary {
  const todayIso = toIsoDate(today);
  const [todayYear, todayMonth] = parseIsoParts(todayIso);

  let todayTotal = 0;
  let weekTotal = 0;
  let monthTotal = 0;
  let allTimeTotal = 0;
  const totalByCategory = new Map<ExpenseCategory, number>();

  for (const expense of expenses) {
    allTimeTotal += expense.amount;
    totalByCategory.set(
      expense.category,
      (totalByCategory.get(expense.category) ?? 0) + expense.amount,
    );

    if (expense.date === todayIso) todayTotal += expense.amount;

    const daysAgo = daysBetween(expense.date, todayIso);
    if (daysAgo >= 0 && daysAgo < 7) weekTotal += expense.amount;

    const [expenseYear, expenseMonth] = parseIsoParts(expense.date);
    if (expenseYear === todayYear && expenseMonth === todayMonth) {
      monthTotal += expense.amount;
    }
  }

  const byCategory = [...totalByCategory.entries()]
    .map(([category, total]) => ({ category, total: round2(total) }))
    .sort((a, b) => b.total - a.total);

  return {
    todayTotal: round2(todayTotal),
    weekTotal: round2(weekTotal),
    monthTotal: round2(monthTotal),
    allTimeTotal: round2(allTimeTotal),
    byCategory,
  };
}
