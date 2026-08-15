import {
  HomeIcon,
  MegaphoneIcon,
  PackageIcon,
  ShoppingBasketIcon,
  TagIcon,
  TruckIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";
import type { ExpenseCategory } from "./types";

/**
 * `{ label, Icon, color }` per expense category, rendered via the shared
 * `IconTile` component (see `ExpenseCategoryBadge.tsx`). Colors are spread
 * around the wheel and kept clear of the black `--primary`, so a badge never
 * reads as a UI accent.
 */
export const EXPENSE_CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; Icon: LucideIcon; color: string }
> = {
  ingredients: { label: "חומרי גלם", Icon: ShoppingBasketIcon, color: "#d97706" },
  packaging: { label: "אריזה", Icon: PackageIcon, color: "#7c3aed" },
  equipment: { label: "ציוד", Icon: WrenchIcon, color: "#2563eb" },
  delivery: { label: "משלוחים", Icon: TruckIcon, color: "#16a34a" },
  marketing: { label: "שיווק ופרסום", Icon: MegaphoneIcon, color: "#e11d48" },
  rent: { label: "שכירות וחשבונות", Icon: HomeIcon, color: "#64748b" },
  other: { label: "אחר", Icon: TagIcon, color: "#78716c" },
};

export const EXPENSE_CATEGORIES = Object.keys(
  EXPENSE_CATEGORY_META,
) as ExpenseCategory[];
