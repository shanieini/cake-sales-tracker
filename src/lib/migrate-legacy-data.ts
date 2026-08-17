import { getSupabaseClient } from "./supabase/client";
import type { CakeExpense, CakeSale, CakeType } from "./types";

const LEGACY_SALES_KEY = "cake-sales:v1";
const LEGACY_TYPES_KEY = "cake-sales:types:v1";
const LEGACY_EXPENSES_KEY = "cake-sales:expenses:v1";
const MIGRATED_KEY = "cake-sales:migrated:v1";

function readLegacyList<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    // Corrupt JSON or localStorage unavailable — nothing to migrate.
    return [];
  }
}

/**
 * One-time upload of whatever this browser already had sitting in
 * `localStorage` from before the Supabase backend existed, into the
 * newly-signed-in user's account.
 *
 * This never deletes or overwrites the original `cake-sales:*` keys — it
 * only reads them, once. A `cake-sales:migrated:v1` flag (set after a
 * successful upload) stops it from running again on every future login and
 * re-uploading duplicates, and also stops a *different* account that later
 * signs in on this same browser from adopting the first account's
 * already-migrated data.
 */
export async function migrateLegacyLocalData(userId: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(MIGRATED_KEY) === "1") return;
  } catch {
    return;
  }

  const sales = readLegacyList<CakeSale>(LEGACY_SALES_KEY);
  const types = readLegacyList<CakeType>(LEGACY_TYPES_KEY);
  const expenses = readLegacyList<CakeExpense>(LEGACY_EXPENSES_KEY);

  function markDone() {
    try {
      window.localStorage.setItem(MIGRATED_KEY, "1");
    } catch {
      // Upload (if any) already happened — worst case this just retries
      // harmlessly (thanks to upsert below) on the next login.
    }
  }

  if (sales.length === 0 && types.length === 0 && expenses.length === 0) {
    markDone();
    return;
  }

  const supabase = getSupabaseClient();

  const typeRows = types.map((type) => ({
    id: type.id,
    user_id: userId,
    name: type.name,
    default_price: type.defaultPrice ?? null,
  }));
  const saleRows = sales.map((sale) => ({
    id: sale.id,
    user_id: userId,
    cake_type: sale.cakeType,
    quantity: sale.quantity,
    price_per_unit: sale.pricePerUnit,
    sale_date: sale.date,
    payment_method: sale.paymentMethod ?? null,
    note: sale.note ?? null,
    created_at: sale.createdAt,
  }));
  const expenseRows = expenses.map((expense) => ({
    id: expense.id,
    user_id: userId,
    description: expense.description,
    category: expense.category,
    amount: expense.amount,
    expense_date: expense.date,
    note: expense.note ?? null,
    created_at: expense.createdAt,
  }));

  // Upsert, not insert: if a previous attempt partially succeeded before
  // failing or the page reloading, re-running this is safe instead of
  // erroring on duplicate ids.
  const results = await Promise.all([
    typeRows.length
      ? supabase.from("cake_types").upsert(typeRows)
      : Promise.resolve({ error: null }),
    saleRows.length
      ? supabase.from("cake_sales").upsert(saleRows)
      : Promise.resolve({ error: null }),
    expenseRows.length
      ? supabase.from("cake_expenses").upsert(expenseRows)
      : Promise.resolve({ error: null }),
  ]);

  const failed = results.find((result) => result.error);
  if (failed) {
    // Leave the flag unset so this retries on the next login instead of
    // silently losing data that never made it up.
    console.error("Failed to migrate legacy local data", failed.error);
    return;
  }

  markDone();
}
