"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, BarChart3Icon, TrophyIcon } from "lucide-react";
import RevenueChart from "@/components/RevenueChart";
import { Card } from "@/components/ui/card";
import { useCakeSales } from "@/lib/store";
import { cakeStrings as s } from "@/lib/strings";
import {
  formatCakeAmount,
  summarizeByMonth,
  summarizeByYear,
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
        <Card className="flex-col gap-4 p-4 shadow-sm">
          <div className="flex items-center gap-0.5 self-start rounded-lg border border-input p-0.5">
            {(["month", "year"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => setView(option)}
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
              every bar, so this is where cakes-sold and precise revenue both
              live at a glance without needing to tap each bar. Most recent
              period first, matching the sale history on the main page. */}
          <ul className="flex flex-col gap-2 border-t border-border/70 pt-3">
            {[...periods].reverse().map((period) => (
              <PeriodRow key={period.key} period={period} />
            ))}
          </ul>
        </Card>
      )}
    </div>
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
