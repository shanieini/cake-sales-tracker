"use client";

import { useSyncExternalStore } from "react";
import type { CakeExpense, CakeSale, CakeType } from "./types";

const SALES_KEY = "cake-sales:v1";
const TYPES_KEY = "cake-sales:types:v1";
const EXPENSES_KEY = "cake-sales:expenses:v1";

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * A localStorage-backed list, exposed as a `useSyncExternalStore` store (the
 * same shape as `useIsDesktop`) so every reader anywhere in the tree
 * re-renders on any add/update/delete — no prop-drilling, no context
 * provider. Sales and cake types are both just lists of objects with an
 * `id`, so this one factory covers both instead of duplicating the
 * read/write/subscribe plumbing per list.
 */
function createListStore<T extends { id: string }>(storageKey: string) {
  let cache: T[] | null = null;
  const listeners = new Set<() => void>();

  function read(): T[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      // Corrupt JSON or localStorage unavailable (private mode) — start
      // empty instead of crashing the app.
      return [];
    }
  }

  function write(items: T[]) {
    cache = items;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // Quota exceeded or storage disabled — the in-memory cache still
      // updates for this tab, it just won't survive a reload.
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(callback: () => void) {
    listeners.add(callback);
    // Keeps multiple tabs/windows (e.g. phone + desktop open at once) in
    // sync.
    function onStorage(event: StorageEvent) {
      if (event.key === storageKey) {
        cache = null;
        callback();
      }
    }
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(callback);
      window.removeEventListener("storage", onStorage);
    };
  }

  function getSnapshot(): T[] {
    if (cache === null) cache = read();
    return cache;
  }

  // There is no server-side data here (this app has no backend), so the
  // server snapshot is always empty; the client re-renders once with the
  // real data right after mount, same as any localStorage-backed store.
  function getServerSnapshot(): T[] {
    return [];
  }

  function useItems(): T[] {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  }

  function add(input: Omit<T, "id">): T {
    const item = { ...input, id: makeId() } as T;
    write([...getSnapshot(), item]);
    return item;
  }

  function update(id: string, input: Partial<Omit<T, "id">>): void {
    write(
      getSnapshot().map((item) => (item.id === id ? { ...item, ...input } : item)),
    );
  }

  function remove(id: string): void {
    write(getSnapshot().filter((item) => item.id !== id));
  }

  return { useItems, add, update, remove };
}

export type CakeSaleInput = Omit<CakeSale, "id" | "createdAt">;

const salesStore = createListStore<CakeSale>(SALES_KEY);

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

const typesStore = createListStore<CakeType>(TYPES_KEY);

export const useCakeTypes = typesStore.useItems;
export const addCakeType = (input: CakeTypeInput) => typesStore.add(input);
export const updateCakeType = (id: string, input: CakeTypeInput) =>
  typesStore.update(id, input);
export const deleteCakeType = (id: string) => typesStore.remove(id);

export type CakeExpenseInput = Omit<CakeExpense, "id" | "createdAt">;

const expensesStore = createListStore<CakeExpense>(EXPENSES_KEY);

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
