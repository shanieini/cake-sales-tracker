"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CalendarIcon,
  PiggyBankIcon,
  SunIcon,
  TrendingUpIcon,
} from "lucide-react";
import ProfitChart from "@/components/ProfitChart";
import { Card } from "@/components/ui/card";
import { useToday } from "@/hooks/use-today";
import { useCakeExpenses, useCakeSales } from "@/lib/store";
import { cakeStrings as s } from "@/lib/strings";
import {
  formatCakeAmount,
  summarizeCakeExpenses,
  summarizeCakeSales,
  summarizeProfitByMonth,
  summarizeProfitByYear,
  type ProfitPeriodSummary,
} from "@/lib/summarize";
import { cn } from "@/lib/utils";

type View = "month" | "year";

/**
 * `/profit` — revenue minus expenses, by month/year. The feature the
 * README flagged as deliberately unbuilt ("not obvious a baker wants
 * profit broken down... without asking first") — the month/year split
 * answers that: net per period, no apportioning shared costs across
 * individual cakes.
 */
export default function ProfitPage() {
  const sales = useCakeSales();
  const expenses = useCakeExpenses();
  const [view, setView] = useState<View>("month");

  // Re-derived on focus/visibility, not just on sales/expenses changing —
  // see useToday — so the today/week/month KPI cards don't stay pinned to
  // yesterday if the app was left open across midnight. Doesn't affect
  // monthly/yearly below: those aggregate every period there is, with no
  // "today" concept to go stale.
  const today = useToday();
  const salesSummary = useMemo(
    () => summarizeCakeSales(sales, today),
    [sales, today],
  );
  const expensesSummary = useMemo(
    () => summarizeCakeExpenses(expenses, today),
    [expenses, today],
  );
  const monthly = useMemo(
    () => summarizeProfitByMonth(sales, expenses),
    [sales, expenses],
  );
  const yearly = useMemo(
    () => summarizeProfitByYear(sales, expenses),
    [sales, expenses],
  );
  const periods = view === "month" ? monthly : yearly;

  const stats = [
    {
      label: s.today,
      value: salesSummary.todayRevenue - expensesSummary.todayTotal,
      icon: SunIcon,
    },
    {
      label: s.last7Days,
      value: salesSummary.weekRevenue - expensesSummary.weekTotal,
      icon: CalendarDaysIcon,
    },
    {
      label: s.thisMonth,
      value: salesSummary.monthRevenue - expensesSummary.monthTotal,
      icon: CalendarIcon,
    },
    {
      label: s.allTime,
      value: salesSummary.allTimeRevenue - expensesSummary.allTimeTotal,
      icon: TrendingUpIcon,
    },
  ];

  const hasData = sales.length > 0 || expenses.length > 0;

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
            {s.profitPageTitle}
          </h1>
          <p className="text-xs text-muted">{s.profitPageSubtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const isHero = index === 0;
          const isNegative = stat.value < 0;
          return (
            <Card
              key={stat.label}
              className={
                isHero
                  ? "relative overflow-hidden bg-gradient-to-br from-primary to-primary-hover p-4 text-primary-foreground shadow-md"
                  : "relative overflow-hidden p-4 shadow-sm"
              }
            >
              {!isHero && (
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,var(--primary-tint),transparent_65%)]" />
              )}
              <div className="relative">
                <div
                  className={
                    isHero
                      ? "flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase opacity-85"
                      : "flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted uppercase"
                  }
                >
                  <stat.icon className="size-3.5 shrink-0" aria-hidden />
                  {stat.label}
                </div>
                <div
                  className={cn(
                    "mt-1 text-2xl font-bold tracking-tight",
                    isNegative && "text-destructive",
                  )}
                  dir="ltr"
                >
                  {formatCakeAmount(stat.value)}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {!hasData ? (
        <Card className="flex-col items-center gap-2 px-4 py-10 text-center shadow-sm">
          <PiggyBankIcon className="size-7 text-muted" aria-hidden />
          <p className="font-medium">{s.reportEmptyTitle}</p>
          <p className="text-sm text-muted">{s.profitEmptyBody}</p>
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

          <ProfitChart periods={periods} />

          <ul className="flex flex-col gap-2 border-t border-border/70 pt-3">
            {[...periods].reverse().map((period) => (
              <ProfitPeriodRow key={period.key} period={period} />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function ProfitPeriodRow({ period }: { period: ProfitPeriodSummary }) {
  const isNegative = period.net < 0;
  return (
    <li className="flex flex-col gap-1 border-b border-border/50 pb-2 text-sm last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{period.label}</span>
        <span
          className={cn(
            "font-semibold tabular-nums",
            isNegative && "text-destructive",
          )}
          dir="ltr"
        >
          {formatCakeAmount(period.net)}
        </span>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted">
        <span>{s.revenueLabel}</span>
        <span dir="ltr">{formatCakeAmount(period.revenue)}</span>
        <span>·</span>
        <span>{s.expensesTitle}</span>
        <span dir="ltr">{formatCakeAmount(period.expenses)}</span>
      </div>
    </li>
  );
}
