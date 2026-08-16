"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CalendarIcon,
  PlusIcon,
  ReceiptIcon,
  SquarePenIcon,
  SunIcon,
  Trash2Icon,
  WalletIcon,
} from "lucide-react";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToday } from "@/hooks/use-today";
import { EXPENSE_CATEGORY_META } from "@/lib/expense-categories";
import {
  addCakeExpense,
  deleteCakeExpense,
  updateCakeExpense,
  useCakeExpenses,
  type CakeExpenseInput,
} from "@/lib/store";
import {
  formatCakeAmount,
  groupExpensesByDay,
  summarizeCakeExpenses,
} from "@/lib/summarize";
import { cakeStrings as s } from "@/lib/strings";
import { formatDay } from "@/lib/format";
import type { CakeExpense } from "@/lib/types";

// Hebrew only, always — see src/lib/strings.ts.
const HEBREW_TAG = "he-IL";

function money(amount: number, tabular = false) {
  // Same dir="ltr" isolation as CakeTracker's money(): digits-then-symbol,
  // regardless of the surrounding Hebrew right-to-left layout.
  return (
    <span dir="ltr" className={tabular ? "tabular-nums" : undefined}>
      {formatCakeAmount(amount)}
    </span>
  );
}

/**
 * `/expenses` — the spend-tracking counterpart to the sale tracker:
 * what was bought, in what category, and for how much. A secondary page
 * (back-arrow header, like the sales report), not a second home — reached
 * from the tappable row on the main page.
 */
export default function ExpenseTracker() {
  const expenses = useCakeExpenses();
  const [sheet, setSheet] = useState<{
    open: boolean;
    editing: CakeExpense | null;
  }>({ open: false, editing: null });

  // Re-derived on focus/visibility, not just on `expenses` changing — see
  // useToday — so "today"/"this week"/"this month" don't stay pinned to
  // yesterday if the app was left open across midnight.
  const today = useToday();
  const summary = useMemo(
    () => summarizeCakeExpenses(expenses, today),
    [expenses, today],
  );
  const groups = useMemo(() => groupExpensesByDay(expenses), [expenses]);

  function handleSave(input: CakeExpenseInput) {
    if (sheet.editing) updateCakeExpense(sheet.editing.id, input);
    else addCakeExpense(input);
  }

  const stats = [
    { label: s.spentToday, value: summary.todayTotal, icon: SunIcon },
    { label: s.spentLast7Days, value: summary.weekTotal, icon: CalendarDaysIcon },
    { label: s.spentThisMonth, value: summary.monthTotal, icon: CalendarIcon },
    { label: s.spentAllTime, value: summary.allTimeTotal, icon: WalletIcon },
  ];

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
            {s.expensesTitle}
          </h1>
          <p className="text-xs text-muted">
            {s.spentSoFar(formatCakeAmount(summary.allTimeTotal))}
          </p>
        </div>
      </div>

      <Button
        type="button"
        onClick={() => setSheet({ open: true, editing: null })}
        className="h-12 w-full gap-2"
      >
        <PlusIcon className="size-4" />
        {s.logExpense}
      </Button>

      <AddExpenseSheet
        open={sheet.open}
        editing={sheet.editing}
        onOpenChange={(open) => setSheet((prev) => ({ ...prev, open }))}
        onSave={handleSave}
      />

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          // Same hero treatment as the sales page: "today" is the number
          // worth checking mid-shift, so it gets a solid-fill tile among
          // three quieter ones.
          const isHero = index === 0;
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
                <div className="mt-1 text-2xl font-bold tracking-tight">
                  {money(stat.value)}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {summary.byCategory.length > 0 && (
        <Card className="p-4 shadow-sm">
          <div className="text-xs font-medium tracking-wide text-muted uppercase">
            {s.expensesByCategory}
          </div>
          <ul className="mt-3 flex flex-col gap-2.5">
            {summary.byCategory.map(({ category, total }) => {
              const pct =
                summary.allTimeTotal > 0
                  ? (total / summary.allTimeTotal) * 100
                  : 0;
              return (
                <li key={category} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-foreground/80">
                      <ExpenseCategoryBadge category={category} size="sm" />
                      {EXPENSE_CATEGORY_META[category].label}
                    </span>
                    <span className="font-medium">{money(total, true)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/70">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: EXPENSE_CATEGORY_META[category].color,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {groups.length === 0 ? (
        <Card className="flex-col items-center gap-2 px-4 py-8 text-center shadow-sm">
          <ReceiptIcon className="size-7 text-muted" aria-hidden />
          <p className="text-sm text-muted">{s.expensesEmptyBody}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.date} className="flex flex-col gap-2">
              <h2 className="px-1 text-xs font-medium tracking-wide text-muted uppercase">
                {formatDay(group.date, HEBREW_TAG)}
              </h2>
              <ul className="flex flex-col gap-2">
                {group.expenses.map((expense) => (
                  <li key={expense.id}>
                    <Card className="flex-row items-start justify-between gap-2 p-3 shadow-sm">
                      <div className="flex min-w-0 gap-2">
                        <ExpenseCategoryBadge
                          category={expense.category}
                          className="mt-0.5"
                        />
                        <div className="min-w-0">
                          <div className="font-medium">{expense.description}</div>
                          <div className="mt-0.5 text-xs tracking-wide text-muted">
                            {EXPENSE_CATEGORY_META[expense.category].label}
                          </div>
                          {expense.note && (
                            <p className="mt-1.5 truncate text-sm text-foreground/80">
                              {expense.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-semibold">
                          {money(expense.amount, true)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label={s.editExpenseAria}
                            onClick={() =>
                              setSheet({ open: true, editing: expense })
                            }
                          >
                            <SquarePenIcon className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            aria-label={s.deleteExpenseAria}
                            onClick={() => deleteCakeExpense(expense.id)}
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
