"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, BarChart3Icon, TrophyIcon } from "lucide-react";
import RevenueChart from "@/components/RevenueChart";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCakeSales } from "@/lib/store";
import { cakeStrings as s } from "@/lib/strings";
import {
  formatCakeAmount,
  summarizeByCakeType,
  summarizeByMonth,
  summarizeByYear,
  type CakeTypeSummary,
  type PeriodSummary,
} from "@/lib/summarize";
import { cn } from "@/lib/utils";

type View = "month" | "year";

/**
 * The full sales-report page (`/report`) — its own route rather than a
 * card on the main page, so the chart and the numbers underneath it get real
 * room instead of competing with the KPI row and the sale history for space.
 */
export default function SalesReportPage() {
  const sales = useCakeSales();
  const [view, setView] = useState<View>("month");
  const monthly = useMemo(() => summarizeByMonth(sales), [sales]);
  const yearly = useMemo(() => summarizeByYear(sales), [sales]);
  const periods = view === "month" ? monthly : yearly;

  // Which single period (a specific month or year key, matching `periods`
  // above) the cake-type ranking is scoped to — "all" for every sale ever
  // logged. Resets to "all" on every view switch since a month key
  // ("2026-08") and a year key ("2026") aren't the same namespace, so a
  // stale one would silently match nothing.
  const [cakeTypePeriod, setCakeTypePeriod] = useState("all");
  // Falls back to "all" if the stored key no longer names a real period —
  // e.g. every sale in the selected month got deleted (possible from
  // another tab: store.ts explicitly syncs across tabs) since it was
  // picked. Without this, the picker would render the raw, untranslated
  // key ("2026-07") instead of a label, and the breakdown below would go
  // silently empty instead of falling back to the full picture.
  const effectiveCakeTypePeriod = useMemo(
    () =>
      cakeTypePeriod === "all" ||
      periods.some((period) => period.key === cakeTypePeriod)
        ? cakeTypePeriod
        : "all",
    [cakeTypePeriod, periods],
  );
  const cakeTypeSales = useMemo(() => {
    if (effectiveCakeTypePeriod === "all") return sales;
    const keyLength = view === "month" ? 7 : 4;
    return sales.filter(
      (sale) => sale.date.slice(0, keyLength) === effectiveCakeTypePeriod,
    );
  }, [sales, effectiveCakeTypePeriod, view]);
  const byCakeType = useMemo(
    () => summarizeByCakeType(cakeTypeSales),
    [cakeTypeSales],
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label={s.backAria}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowRightIcon className="size-5" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            {s.reportTitle}
          </h1>
          <p className="text-xs text-muted">{s.reportSubtitle}</p>
        </div>
      </div>

      {sales.length === 0 ? (
        <Card className="flex-col items-center gap-2 px-4 py-10 text-center shadow-sm">
          <BarChart3Icon className="size-7 text-muted" aria-hidden />
          <p className="font-medium">{s.reportEmptyTitle}</p>
          <p className="text-sm text-muted">{s.reportEmptyBody}</p>
        </Card>
      ) : (
        <>
          {/* Which cake to keep making — the whole menu ranked by units
              sold, not just the single winner the header/homepage badge
              names. Defaults to all-time; the picker scopes it to one
              specific month or year instead, reusing whichever granularity
              the toggle below is currently set to. */}
          <Card className="p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-medium tracking-wide text-muted uppercase">
                {s.reportByCakeType}
              </div>
              <Select
                value={effectiveCakeTypePeriod}
                onValueChange={(value) => setCakeTypePeriod(value ?? "all")}
              >
                <SelectTrigger size="sm" className="h-7 text-xs">
                  {/* SelectValue renders the raw `value` by default; since
                      "all" isn't itself a label (unlike the cake-type
                      Select elsewhere, where value === label), it needs an
                      explicit value→label lookup. */}
                  <SelectValue>
                    {(value: string) =>
                      value === "all"
                        ? s.allTime
                        : (periods.find((period) => period.key === value)
                            ?.label ?? value)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{s.allTime}</SelectItem>
                  {[...periods].reverse().map((period) => (
                    <SelectItem key={period.key} value={period.key}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ul className="mt-3 flex flex-col gap-2.5">
              {byCakeType.map((entry, index) => (
                <CakeTypeRow
                  key={entry.cakeType}
                  entry={entry}
                  rank={index}
                  maxQuantity={byCakeType[0].quantity}
                />
              ))}
            </ul>
          </Card>

          <Card className="flex-col gap-4 p-4 shadow-sm">
            <div className="flex items-center gap-0.5 self-start rounded-lg border border-input p-0.5">
              {(["month", "year"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={view === option}
                  onClick={() => {
                    setView(option);
                    setCakeTypePeriod("all");
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    view === option
                      ? "bg-primary text-primary-foreground"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {option === "month" ? s.reportMonthly : s.reportYearly}
                </button>
              ))}
            </div>

            <RevenueChart periods={periods} />

            {/* Exact figures for both measures — the chart itself is
                revenue-only (see RevenueChart) and doesn't print a value on
                every bar, so this is where cakes-sold and precise revenue
                both live at a glance without needing to tap each bar. Most
                recent period first, matching the sale history on the main
                page. */}
            <ul className="flex flex-col gap-2 border-t border-border/70 pt-3">
              {[...periods].reverse().map((period) => (
                <PeriodRow key={period.key} period={period} />
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

function CakeTypeRow({
  entry,
  rank,
  maxQuantity,
}: {
  entry: CakeTypeSummary;
  rank: number;
  maxQuantity: number;
}) {
  // Bar length relative to the top seller's quantity (not a percent-of-total
  // split like the expense category bars) — the question this card answers
  // is "which cake wins", so #1 reads as a full bar and everyone else
  // visibly trails it, rather than every bar summing to a whole.
  const pct = maxQuantity > 0 ? (entry.quantity / maxQuantity) * 100 : 0;
  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex min-w-0 items-center gap-1.5 text-foreground/80">
          {rank === 0 ? (
            <TrophyIcon className="size-3.5 shrink-0 text-primary" aria-hidden />
          ) : (
            <span className="w-3.5 shrink-0 text-center text-xs tabular-nums text-muted">
              {rank + 1}
            </span>
          )}
          <span className="truncate">{entry.cakeType}</span>
        </span>
        <span className="flex shrink-0 items-baseline gap-2">
          <span className="text-xs text-muted">
            {s.cakesCount(entry.quantity)}
          </span>
          <span className="font-medium tabular-nums" dir="ltr">
            {formatCakeAmount(entry.revenue)}
          </span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/70">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

function PeriodRow({ period }: { period: PeriodSummary }) {
  return (
    <li className="flex flex-col gap-1 border-b border-border/50 pb-2 text-sm last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{period.label}</span>
        <span className="flex items-baseline gap-2">
          <span className="text-xs text-muted">{s.cakesCount(period.count)}</span>
          <span className="font-semibold tabular-nums" dir="ltr">
            {formatCakeAmount(period.revenue)}
          </span>
        </span>
      </div>
      {period.topSeller && (
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <TrophyIcon className="size-3 shrink-0 text-primary" aria-hidden />
          {s.bestSeller(period.topSeller.cakeType, period.topSeller.quantity)}
        </div>
      )}
    </li>
  );
}
