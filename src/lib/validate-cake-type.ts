import { cakeStrings as s } from "./strings";
import type { CakeTypeInput } from "./store";
import type { CakeType } from "./types";

export type CakeTypeValidationResult =
  | { ok: true; input: CakeTypeInput }
  | { ok: false; error: string };

/**
 * Shared validation for the add-a-cake-type form, used by both
 * `ManageCakeTypesSheet` (the quick add/delete popup) and
 * `AddCakeTypeSheet` (the `/cakes` page's add/edit form) — kept in one
 * place so the two forms can't silently diverge on what counts as a valid
 * name or price.
 *
 * `excludeId` lets a form editing an existing cake type skip flagging
 * itself as a duplicate of its own (unchanged) name — `ManageCakeTypesSheet`
 * only ever adds, so it never passes one.
 */
export function validateCakeTypeInput(
  rawName: string,
  rawPrice: string,
  existingTypes: CakeType[],
  excludeId?: string,
): CakeTypeValidationResult {
  const name = rawName.trim();
  if (!name) return { ok: false, error: s.errorCakeTypeName };

  const isDuplicate = existingTypes.some(
    (type) =>
      type.id !== excludeId && type.name.toLowerCase() === name.toLowerCase(),
  );
  if (isDuplicate) return { ok: false, error: s.duplicateCakeType };

  const priceRaw = rawPrice.trim();
  const defaultPrice = Number(priceRaw);
  // Required, not optional: the sale form's price field only autofills
  // when the picked cake type actually has a price to fill it with.
  if (!priceRaw || !Number.isFinite(defaultPrice) || defaultPrice < 0) {
    return { ok: false, error: s.errorDefaultPrice };
  }

  return { ok: true, input: { name, defaultPrice } };
}
