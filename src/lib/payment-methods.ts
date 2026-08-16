import {
  BanknoteIcon,
  CreditCardIcon,
  LandmarkIcon,
  SendHorizontalIcon,
  SmartphoneIcon,
  type LucideIcon,
} from "lucide-react";
import type { PaymentMethod } from "./types";

/**
 * `{ label, Icon, color }` per payment method, rendered via the shared
 * `IconTile` component (see `PaymentMethodBadge.tsx`) — same treatment as
 * `EXPENSE_CATEGORY_META`. Colors are spread around the wheel and kept
 * clear of the black `--primary`, so a badge never reads as a UI accent.
 */
export const PAYMENT_METHOD_META: Record<
  PaymentMethod,
  { label: string; Icon: LucideIcon; color: string }
> = {
  cash: { label: "מזומן", Icon: BanknoteIcon, color: "#16a34a" },
  credit: { label: "אשראי", Icon: CreditCardIcon, color: "#2563eb" },
  bit: { label: "ביט", Icon: SmartphoneIcon, color: "#f59e0b" },
  paybox: { label: "פייבוקס", Icon: SendHorizontalIcon, color: "#7c3aed" },
  bank_transfer: { label: "העברה בנקאית", Icon: LandmarkIcon, color: "#64748b" },
};

export const PAYMENT_METHODS = Object.keys(
  PAYMENT_METHOD_META,
) as PaymentMethod[];
