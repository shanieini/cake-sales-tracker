/** Fixed, like expense categories — a bakery's payment options don't vary
 * from baker to baker, so there's no manager UI for these, just a picker.
 * See `payment-methods.ts` for labels/colors/icons. */
export type PaymentMethod = "cash" | "credit" | "bit" | "paybox" | "bank_transfer";

export type CakeSale = {
  id: string;
  /** e.g. "Chocolate cake", "Lemon cupcakes" — free text, not a fixed list,
   * since every baker's menu is different. */
  cakeType: string;
  quantity: number;
  /** Price per cake, in whatever currency the baker uses — this app tracks
   * one currency at a time, no conversion. */
  pricePerUnit: number;
  /** Calendar day the sale happened, as `YYYY-MM-DD` (matches what a native
   * `<input type="date">` produces). */
  date: string;
  /** Optional, not required: added after this app already had real sales
   * logged, and those shouldn't need backfilling to stay valid. The sale
   * form defaults new and edited sales to "cash" regardless, so this only
   * stays empty for sales that predate the field. */
  paymentMethod?: PaymentMethod;
  note?: string;
  /** When the row was created, for stable ordering of same-day sales. */
  createdAt: string;
};

/**
 * An entry in the baker's own menu — maintained separately from sales so he
 * can set up "Chocolate cake" once (with an optional default price) instead
 * of retyping it on every sale. Sales still store `cakeType` as free text
 * rather than a reference to one of these, so deleting a type never orphans
 * or rewrites sale history.
 */
export type CakeType = {
  id: string;
  name: string;
  defaultPrice?: number;
};

/** Fixed, unlike cake types — a bakery's cost categories don't vary from
 * baker to baker the way its menu does, so there's no manager UI for these,
 * just a picker. See `expense-categories.ts` for labels/colors/icons. */
export type ExpenseCategory =
  | "ingredients"
  | "packaging"
  | "equipment"
  | "delivery"
  | "marketing"
  | "rent"
  | "other";

export type CakeExpense = {
  id: string;
  /** What was bought, e.g. "קמח וסוכר" — free text, since a category alone
   * ("ingredients") doesn't say what. */
  description: string;
  category: ExpenseCategory;
  amount: number;
  /** Calendar day the expense happened, as `YYYY-MM-DD`. */
  date: string;
  note?: string;
  /** When the row was created, for stable ordering of same-day expenses. */
  createdAt: string;
};
