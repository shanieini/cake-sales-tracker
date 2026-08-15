import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// A rounded tile rather than a flat dot: the soft gradient, inset highlight and
// tinted drop shadow give it depth at 16–28px, where a solid circle reads flat.
const SIZES = {
  sm: { box: "size-4 rounded-[5px]", icon: "size-2.5" },
  md: { box: "size-5 rounded-[7px]", icon: "size-3" },
  lg: { box: "size-7 rounded-[9px]", icon: "size-4" },
} as const;

export type IconTileSize = keyof typeof SIZES;

/**
 * The small coloured icon tile behind every expense category badge, so they
 * stay visually identical wherever they're rendered.
 */
export default function IconTile({
  Icon,
  color,
  size = "md",
  className,
}: {
  Icon: LucideIcon;
  color: string;
  size?: IconTileSize;
  className?: string;
}) {
  const { box, icon } = SIZES[size];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center ring-1 ring-white/20 ring-inset",
        box,
        className,
      )}
      style={{
        background: `linear-gradient(145deg, color-mix(in oklab, ${color} 85%, white), ${color})`,
        boxShadow: `0 1px 2.5px color-mix(in oklab, ${color} 40%, transparent)`,
      }}
    >
      <Icon className={cn("text-white", icon)} strokeWidth={2.5} aria-hidden />
    </span>
  );
}
