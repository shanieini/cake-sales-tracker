"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  type TooltipContentProps,
} from "recharts";
import { cakeStrings as s } from "@/lib/strings";
import { formatCakeAmount } from "@/lib/summarize";
import type { ProfitPeriodSummary } from "@/lib/summarize";

type Props = { periods: ProfitPeriodSummary[] };

/**
 * Net-profit-by-period bars — same Recharts setup as `RevenueChart`, but
 * each bar is colored by its own sign rather than one fixed color: a
 * losing period (spent more than it made) needs to read as a loss at a
 * glance, not just as a shorter bar a reader might misjudge against the
 * axis. Reuses the app's existing `--destructive` red rather than
 * inventing a new "loss" color, and `--primary` for a positive net, same
 * as revenue everywhere else in the app.
 *
 * Same `dir="ltr"` reasoning as `RevenueChart`: a chart reads left-to-right
 * even on this Hebrew page, matching how money amounts are always shown.
 */
export default function ProfitChart({ periods }: Props) {
  return (
    <div dir="ltr" className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={periods}
          margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
          barCategoryGap="28%"
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="0"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={0}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
          />
          <Tooltip
            cursor={{ fill: "var(--primary-tint)" }}
            content={ProfitTooltip}
          />
          <Bar dataKey="net" radius={[4, 4, 4, 4]} maxBarSize={28}>
            {periods.map((period) => (
              <Cell
                key={period.key}
                fill={period.net < 0 ? "var(--destructive)" : "var(--primary)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ProfitTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const period = payload[0].payload as ProfitPeriodSummary;
  return (
    <div
      dir="rtl"
      className="rounded-lg bg-popover px-3 py-2 text-xs shadow-lg ring-1 ring-foreground/10"
    >
      <div className="font-semibold">{period.label}</div>
      <div className="mt-1 flex items-center justify-between gap-3 text-muted">
        <span>{s.revenueLabel}</span>
        <span dir="ltr" className="tabular-nums">
          {formatCakeAmount(period.revenue)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 text-muted">
        <span>{s.expensesTitle}</span>
        <span dir="ltr" className="tabular-nums">
          {formatCakeAmount(period.expenses)}
        </span>
      </div>
      <div
        className={`mt-1 flex items-center justify-between gap-3 border-t border-border/70 pt-1 font-semibold ${
          period.net < 0 ? "text-destructive" : ""
        }`}
      >
        <span>{s.netLabel}</span>
        <span dir="ltr" className="tabular-nums">
          {formatCakeAmount(period.net)}
        </span>
      </div>
    </div>
  );
}
