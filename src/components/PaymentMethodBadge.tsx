import IconTile, { type IconTileSize } from "@/components/IconTile";
import { PAYMENT_METHOD_META } from "@/lib/payment-methods";
import type { PaymentMethod } from "@/lib/types";

/** A small colored tile per payment method, via the shared `IconTile` —
 * same treatment as `ExpenseCategoryBadge`. */
export default function PaymentMethodBadge({
  method,
  size = "md",
  className,
}: {
  method: PaymentMethod;
  size?: IconTileSize;
  className?: string;
}) {
  const { Icon, color } = PAYMENT_METHOD_META[method];
  return <IconTile Icon={Icon} color={color} size={size} className={className} />;
}
