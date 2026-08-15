import IconTile, { type IconTileSize } from "@/components/IconTile";
import { EXPENSE_CATEGORY_META } from "@/lib/expense-categories";
import type { ExpenseCategory } from "@/lib/types";

/** A small colored tile per expense category, via the shared `IconTile`. */
export default function ExpenseCategoryBadge({
  category,
  size = "md",
  className,
}: {
  category: ExpenseCategory;
  size?: IconTileSize;
  className?: string;
}) {
  const { Icon, color } = EXPENSE_CATEGORY_META[category];
  return <IconTile Icon={Icon} color={color} size={size} className={className} />;
}
