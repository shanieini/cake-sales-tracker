"use client";

import { useSyncExternalStore } from "react";
import { getSupabaseClient } from "./supabase/client";
import type { CakeExpense, CakeSale, CakeType } from "./types";

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * A Supabase-backed list, exposed as a `useSyncExternalStore` store (the
 * same shape every store in this app uses) so every reader anywhere in the
 * tree re-renders on any add/update/delete — no prop-drilling, no context
 * provider. Sales, cake types, and expenses are all just "a list of
 * objects with an id" scoped to one Supabase table each, so this one
 * factory covers all three instead of duplicating the fetch/write/
 * subscribe plumbing per list.
 *
 * Row-level security (see `supabase/schema.sql`) scopes every query to the
 * signed-in user, but writes still update the in-memory cache immediately
 * and only roll back if the request actually fails — same "feels instant"
 * behavior the old localStorage-only version had, just with a network
 * round-trip (and a possible rollback) happening behind it now.
 */
function createListStore<T extends { id: string }>(
  table: string,
  toRow: (item: T, userId: string) => Record<string, unknown>,
  fromRow: (row: Record<string, unknown>) => T,
) {
  let cache: T[] = [];
  let userId: string | null = null;
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function write(items: T[]) {
    cache = items;
    notify();
  }

  async function refresh() {
    const uid = userId;
    if (!uid) {
      write([]);
      return;
    }
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: true });
    // The user may have signed out (or switched accounts) while this was
    // in flight — don't clobber the current cache with a stale response.
    if (userId !== uid) return;
    if (error) {
      console.error(`Failed to load ${table}`, error);
      return;
    }
    write((data ?? []).map(fromRow));
  }

  /** Called from `auth.ts` (via `setStoresUser`) on every sign-in/out. */
  function setUser(nextUserId: string | null) {
    userId = nextUserId;
    if (nextUserId) void refresh();
    else write([]);
  }

  function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }

  function getSnapshot(): T[] {
    return cache;
  }

  // No server-rendered data here (every read goes through the browser
  // Supabase client), so the server snapshot is always empty; the client
  // re-renders once with the real data right after the initial fetch.
  function getServerSnapshot(): T[] {
    return [];
  }

  function useItems(): T[] {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  }

  function add(input: Omit<T, "id">): T {
    const item = { ...input, id: makeId() } as T;
    write([...cache, item]);
    const uid = userId;
    if (uid) {
      const supabase = getSupabaseClient();
      void supabase
        .from(table)
        .insert(toRow(item, uid))
        .then(({ error }) => {
          if (!error) return;
          console.error(`Failed to save to ${table}`, error);
          write(cache.filter((existing) => existing.id !== item.id));
        });
    }
    return item;
  }

  function update(id: string, input: Partial<Omit<T, "id">>): void {
    const previous = cache;
    const next = cache.map((item) =>
      item.id === id ? { ...item, ...input } : item,
    );
    write(next);
    const uid = userId;
    const updated = next.find((item) => item.id === id);
    if (uid && updated) {
      const supabase = getSupabaseClient();
      void supabase
        .from(table)
        .update(toRow(updated, uid))
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(`Failed to update ${table}`, error);
          write(previous);
        });
    }
  }

  function remove(id: string): void {
    const previous = cache;
    write(cache.filter((item) => item.id !== id));
    const uid = userId;
    if (uid) {
      const supabase = getSupabaseClient();
      void supabase
        .from(table)
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(`Failed to delete from ${table}`, error);
          write(previous);
        });
    }
  }

  return { useItems, add, update, remove, setUser };
}

export type CakeSaleInput = Omit<CakeSale, "id" | "createdAt">;

function saleToRow(sale: CakeSale, userId: string): Record<string, unknown> {
  return {
    id: sale.id,
    user_id: userId,
    cake_type: sale.cakeType,
    quantity: sale.quantity,
    price_per_unit: sale.pricePerUnit,
    sale_date: sale.date,
    payment_method: sale.paymentMethod ?? null,
    note: sale.note ?? null,
    created_at: sale.createdAt,
  };
}

function rowToSale(row: Record<string, unknown>): CakeSale {
  return {
    id: row.id as string,
    cakeType: row.cake_type as string,
    quantity: row.quantity as number,
    pricePerUnit: Number(row.price_per_unit),
    date: row.sale_date as string,
    paymentMethod:
      (row.payment_method as CakeSale["paymentMethod"]) ?? undefined,
    note: (row.note as string | null) ?? undefined,
    createdAt: row.created_at as string,
  };
}

const salesStore = createListStore<CakeSale>("cake_sales", saleToRow, rowToSale);

export const useCakeSales = salesStore.useItems;

export function addCakeSale(input: CakeSaleInput): CakeSale {
  return salesStore.add({ ...input, createdAt: new Date().toISOString() });
}

export function updateCakeSale(id: string, input: CakeSaleInput): void {
  // `createdAt` isn't part of `input`, so the merge in `update()` leaves the
  // original creation time in place — editing a sale doesn't bump it to the
  // top of its day's list.
  salesStore.update(id, input);
}

export function deleteCakeSale(id: string): void {
  salesStore.remove(id);
}

export type CakeTypeInput = Omit<CakeType, "id">;

function typeToRow(type: CakeType, userId: string): Record<string, unknown> {
  return {
    id: type.id,
    user_id: userId,
    name: type.name,
    default_price: type.defaultPrice ?? null,
  };
}

function rowToType(row: Record<string, unknown>): CakeType {
  return {
    id: row.id as string,
    name: row.name as string,
    defaultPrice:
      row.default_price != null ? Number(row.default_price) : undefined,
  };
}

const typesStore = createListStore<CakeType>("cake_types", typeToRow, rowToType);

export const useCakeTypes = typesStore.useItems;
export const addCakeType = (input: CakeTypeInput) => typesStore.add(input);
export const updateCakeType = (id: string, input: CakeTypeInput) =>
  typesStore.update(id, input);
export const deleteCakeType = (id: string) => typesStore.remove(id);

export type CakeExpenseInput = Omit<CakeExpense, "id" | "createdAt">;

function expenseToRow(
  expense: CakeExpense,
  userId: string,
): Record<string, unknown> {
  return {
    id: expense.id,
    user_id: userId,
    description: expense.description,
    category: expense.category,
    amount: expense.amount,
    expense_date: expense.date,
    note: expense.note ?? null,
    created_at: expense.createdAt,
  };
}

function rowToExpense(row: Record<string, unknown>): CakeExpense {
  return {
    id: row.id as string,
    description: row.description as string,
    category: row.category as CakeExpense["category"],
    amount: Number(row.amount),
    date: row.expense_date as string,
    note: (row.note as string | null) ?? undefined,
    createdAt: row.created_at as string,
  };
}

const expensesStore = createListStore<CakeExpense>(
  "cake_expenses",
  expenseToRow,
  rowToExpense,
);

export const useCakeExpenses = expensesStore.useItems;

export function addCakeExpense(input: CakeExpenseInput): CakeExpense {
  return expensesStore.add({ ...input, createdAt: new Date().toISOString() });
}

export function updateCakeExpense(id: string, input: CakeExpenseInput): void {
  // Same reasoning as updateCakeSale: createdAt isn't in `input`, so editing
  // an expense doesn't bump it to the top of its day's list.
  expensesStore.update(id, input);
}

export function deleteCakeExpense(id: string): void {
  expensesStore.remove(id);
}

/**
 * Wired up from `auth.ts` on every sign-in/sign-out so each list store
 * fetches (or clears) the right user's rows. Only `auth.ts` should call
 * this — components should use the per-store hooks/actions above.
 */
export function setStoresUser(userId: string | null): void {
  salesStore.setUser(userId);
  typesStore.setUser(userId);
  expensesStore.setUser(userId);
}
