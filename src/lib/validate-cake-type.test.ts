import { describe, expect, it } from "vitest";
import { validateCakeTypeInput } from "./validate-cake-type";
import type { CakeType } from "./types";

function makeType(overrides: Partial<CakeType> = {}): CakeType {
  return { id: "1", name: "Chocolate cake", defaultPrice: 20, ...overrides };
}

describe("validateCakeTypeInput", () => {
  it("returns the trimmed name and parsed price when valid", () => {
    const result = validateCakeTypeInput("  Lemon cake  ", "15.5", []);
    expect(result).toEqual({
      ok: true,
      input: { name: "Lemon cake", defaultPrice: 15.5 },
    });
  });

  it("errors on an empty name", () => {
    const result = validateCakeTypeInput("   ", "10", []);
    expect(result.ok).toBe(false);
  });

  it("errors on a duplicate name, case-insensitive", () => {
    const existing = [makeType({ name: "Chocolate cake" })];
    const result = validateCakeTypeInput("CHOCOLATE CAKE", "10", existing);
    expect(result.ok).toBe(false);
  });

  it("excludes the row being edited from the duplicate check", () => {
    const existing = [makeType({ id: "1", name: "Chocolate cake" })];
    const result = validateCakeTypeInput("Chocolate cake", "25", existing, "1");
    expect(result).toEqual({
      ok: true,
      input: { name: "Chocolate cake", defaultPrice: 25 },
    });
  });

  it("still flags a duplicate against a different row when editing", () => {
    const existing = [
      makeType({ id: "1", name: "Chocolate cake" }),
      makeType({ id: "2", name: "Lemon cake" }),
    ];
    const result = validateCakeTypeInput("Lemon cake", "25", existing, "1");
    expect(result.ok).toBe(false);
  });

  it("errors on a missing price", () => {
    const result = validateCakeTypeInput("Lemon cake", "", []);
    expect(result.ok).toBe(false);
  });

  it("errors on a negative price", () => {
    const result = validateCakeTypeInput("Lemon cake", "-5", []);
    expect(result.ok).toBe(false);
  });

  it("accepts a price of exactly 0", () => {
    const result = validateCakeTypeInput("Lemon cake", "0", []);
    expect(result).toEqual({
      ok: true,
      input: { name: "Lemon cake", defaultPrice: 0 },
    });
  });
});
