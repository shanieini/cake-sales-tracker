"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  type TooltipContentProps,
} from "recharts";
import { TrophyIcon } from "lucide-react";
import { cakeStrings as s } from "@/lib/strings";
import { formatCakeAmount } from "@/lib/summarize";
import type { PeriodSummary } from "@/lib/summarize";

type Props = { periods: PeriodSummary[] };

/**
 * Revenue-by-period bars, via Recharts. Deliberately revenue-only: cakes
 * sold is a second, differently-scaled measure, and a chart never gets a
 * second y-axis for that (dual-axis charts invent a correlation that isn't
 * there) — count rides along in the tooltip and the list underneath instead.
 *
 * Kept `dir="ltr"` on purpose even on this Hebrew, right-to-left page: a
 * chart is a widget most readers — including Hebrew ones — expect to read
 * time left-to-right, the same convention this app already uses for money
 * amounts. Only the plot goes ltr; the Hebrew period labels and tooltip text
 * inside it render correctly regardless, same as Hebrew words read fine
 * inside an English sentence.
 */
export default function RevenueChart({ periods }: Props) {
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
            content={ChartTooltip}
          />
          <Bar
            dataKey="revenue"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const period = payload[0].payload as PeriodSummary;
  return (
    <div
      dir="rtl"
      className="rounded-lg bg-popover px-3 py-2 text-xs shadow-lg ring-1 ring-foreground/10"
    >
      <div className="font-semibold">{period.label}</div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-muted">{s.cakesCount(period.count)}</span>
        <span dir="ltr" className="font-semibold tabular-nums">
          {formatCakeAmount(period.revenue)}
        </span>
      </div>
      {period.topSeller && (
        <div className="mt-1 flex items-center gap-1 border-t border-border/70 pt-1 text-muted">
          <TrophyIcon className="size-3 shrink-0 text-primary" aria-hidden />
          {period.topSeller.cakeType}
        </div>
      )}
    </div>
  );
}
