"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3Icon,
  CalendarDaysIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ListIcon,
  PlusIcon,
  ReceiptIcon,
  SquarePenIcon,
  SunIcon,
  Trash2Icon,
  TrendingUpIcon,
  TrophyIcon,
} from "lucide-react";
import AddSaleSheet from "@/components/AddSaleSheet";
import CakeLogo from "@/components/CakeLogo";
import ManageCakeTypesSheet from "@/components/ManageCakeTypesSheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  addCakeSale,
  deleteCakeSale,
  updateCakeSale,
  useCakeSales,
  useCakeTypes,
  type CakeSaleInput,
} from "@/lib/store";
import {
  formatCakeAmount,
  groupSalesByDay,
  saleTotal,
  summarizeCakeSales,
} from "@/lib/summarize";
import { cakeStrings as s } from "@/lib/strings";
import { formatDay } from "@/lib/format";
import type { CakeSale } from "@/lib/types";

// Hebrew only, always — see src/lib/strings.ts.
const HEBREW_TAG = "he-IL";

export default function CakeTracker() {
  const sales = useCakeSales();
  const cakeTypes = useCakeTypes();
  const [sheet, setSheet] = useState<{
    open: boolean;
    editing: CakeSale | null;
  }>({ open: false, editing: null });
  const [manageOpen, setManageOpen] = useState(false);

  const summary = useMemo(() => summarizeCakeSales(sales), [sales]);
  const groups = useMemo(() => groupSalesByDay(sales), [sales]);

  function handleSave(input: CakeSaleInput) {
    if (sheet.editing) updateCakeSale(sheet.editing.id, input);
    else addCakeSale(input);
  }

  // Used by the sale form's empty-catalog prompt: close it and open the
  // cake-type manager instead, so adding a first cake and logging a sale
  // stays a two-tap flow rather than a dead end.
  function handleManageCakeTypes() {
    setSheet((prev) => ({ ...prev, open: false }));
    setManageOpen(true);
  }

  function money(amount: number, tabular = false) {
    // `dir="ltr"` isolates the run (the HTML UA stylesheet applies
    // `unicode-bidi: isolate` to any element with an explicit `dir`), so the
    // amount always reads left-to-right — digits then symbol — inside the
    // Hebrew right-to-left layout, instead of the bidi algorithm reordering
    // "₪12.50" around the RTL context. `tabular` is for amounts stacked in a
    // column (the sale list) so they line up; a standalone stat-card figure
    // stays proportional — equal-width digits make a big number look loose.
    return (
      <span dir="ltr" className={tabular ? "tabular-nums" : undefined}>
        {formatCakeAmount(amount)}
      </span>
    );
  }

  const stats = [
    { label: s.today, value: summary.todayRevenue, icon: SunIcon },
    { label: s.last7Days, value: summary.weekRevenue, icon: CalendarDaysIcon },
    { label: s.thisMonth, value: summary.monthRevenue, icon: CalendarIcon },
    { label: s.allTime, value: summary.allTimeRevenue, icon: TrendingUpIcon },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-[0_6px_16px_-6px_color-mix(in_srgb,var(--primary)_55%,transparent)]">
          <CakeLogo className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight">{s.title}</h1>
          <p className="text-xs text-muted">
            {s.soldSoFar(summary.allTimeCount)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={() => setSheet({ open: true, editing: null })}
          className="h-12 flex-1 gap-2"
        >
          <PlusIcon className="size-4" />
          {s.logSale}
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-label={s.manageCakes}
          onClick={() => setManageOpen(true)}
          className="h-12 gap-2 px-3"
        >
          <ListIcon className="size-4" />
          <span className="hidden sm:inline" aria-hidden>
            {s.manageCakes}
          </span>
        </Button>
      </div>

      <AddSaleSheet
        open={sheet.open}
        editing={sheet.editing}
        cakeTypes={cakeTypes}
        onOpenChange={(open) => setSheet((prev) => ({ ...prev, open }))}
        onSave={handleSave}
        onManageCakeTypes={handleManageCakeTypes}
      />

      <ManageCakeTypesSheet open={manageOpen} onOpenChange={setManageOpen} />

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          // "Today" is the number a baker actually checks mid-shift — a
          // solid-fill hero tile among three quieter ones, instead of four
          // equal boxes with nothing to look at first.
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

      {summary.topSeller && (
        <Card className="flex-row items-center gap-2.5 p-3 shadow-sm">
          <TrophyIcon className="size-4 shrink-0 text-primary" aria-hidden />
          <p className="text-sm">
            {s.bestSeller(summary.topSeller.cakeType, summary.topSeller.quantity)}
          </p>
        </Card>
      )}

      {/* Rows, not inline widgets — the report and the expense tracker each
          get their own page with real room, rather than squeezing a chart
          and a whole second form between the KPI row and the sale history
          here. */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/report" className="block">
          <Card className="flex-row items-center justify-between gap-2 p-3.5 shadow-sm transition-colors hover:bg-muted/50">
            <span className="flex min-w-0 items-center gap-2">
              <BarChart3Icon className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="truncate text-sm font-medium">{s.reportTitle}</span>
            </span>
            <ChevronLeftIcon className="size-4 shrink-0 text-muted" aria-hidden />
          </Card>
        </Link>
        <Link href="/expenses" className="block">
          <Card className="flex-row items-center justify-between gap-2 p-3.5 shadow-sm transition-colors hover:bg-muted/50">
            <span className="flex min-w-0 items-center gap-2">
              <ReceiptIcon className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="truncate text-sm font-medium">{s.expensesTitle}</span>
            </span>
            <ChevronLeftIcon className="size-4 shrink-0 text-muted" aria-hidden />
          </Card>
        </Link>
      </div>

      {groups.length === 0 ? (
        <Card className="flex-col items-center gap-2 px-4 py-8 text-center shadow-sm">
          <CakeLogo className="size-9 text-muted" />
          <p className="text-sm text-muted">{s.emptyBody}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.date} className="flex flex-col gap-2">
              <h2 className="px-1 text-xs font-medium tracking-wide text-muted uppercase">
                {formatDay(group.date, HEBREW_TAG)}
              </h2>
              <ul className="flex flex-col gap-2">
                {group.sales.map((sale) => (
                  <li key={sale.id}>
                    <Card className="flex-row items-start justify-between gap-2 p-3 shadow-sm">
                      <div className="min-w-0">
                        <div className="font-medium">{sale.cakeType}</div>
                        <div className="mt-0.5 text-xs tracking-wide text-muted">
                          {sale.quantity} × {money(sale.pricePerUnit, true)}
                        </div>
                        {sale.note && (
                          <p className="mt-1.5 truncate text-sm text-foreground/80">
                            {sale.note}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-semibold">
                          {money(saleTotal(sale), true)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label={s.editSaleAria}
                            onClick={() =>
                              setSheet({ open: true, editing: sale })
                            }
                          >
                            <SquarePenIcon className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            aria-label={s.deleteSaleAria}
                            onClick={() => deleteCakeSale(sale.id)}
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
