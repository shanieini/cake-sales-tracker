import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { pickCelebrationTitle, pickCelebrationVariant } from "./celebration";
import {
  CELEBRATION_VARIANTS,
  celebrationImageSrc,
} from "./celebration-variants";
import { cakeStrings as s } from "./strings";

const titles: readonly string[] = s.celebrationTitles;

describe("pickCelebrationTitle", () => {
  it("keeps the original phrase in the list, among several", () => {
    expect(titles).toContain("יא מוסס זין");
    expect(titles.length).toBeGreaterThan(1);
  });

  it("can pick any phrase for the first sale", () => {
    const picked = new Set(
      titles.map((_, index) =>
        pickCelebrationTitle(null, () => index / titles.length),
      ),
    );
    expect(picked).toEqual(new Set(titles));
  });

  it("never repeats the previous phrase, whatever the random number", () => {
    for (const previous of titles) {
      for (const r of [0, 0.25, 0.5, 0.75, 0.999999]) {
        const picked = pickCelebrationTitle(previous, () => r);
        expect(titles).toContain(picked);
        expect(picked).not.toBe(previous);
      }
    }
  });

  it("can still reach every other phrase after a given one", () => {
    const previous = titles[0];
    const others = titles.length - 1;
    const picked = new Set(
      Array.from({ length: others }, (_, index) =>
        pickCelebrationTitle(previous, () => index / others),
      ),
    );
    expect(picked).toEqual(new Set(titles.slice(1)));
  });
});

describe("CELEBRATION_VARIANTS", () => {
  it("has a unique id for each emoji", () => {
    const ids = CELEBRATION_VARIANTS.map((variant) => variant.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has every emoji's image in public/", () => {
    for (const variant of CELEBRATION_VARIANTS) {
      const file = join(process.cwd(), "public", celebrationImageSrc(variant));
      expect(existsSync(file), file).toBe(true);
    }
  });
});

describe("pickCelebrationVariant", () => {
  const ids = CELEBRATION_VARIANTS.map((variant) => variant.id);

  it("can pick any emoji for the first sale", () => {
    const picked = new Set(
      ids.map((_, index) => pickCelebrationVariant(null, () => index / ids.length).id),
    );
    expect(picked).toEqual(new Set(ids));
  });

  it("never repeats the previous emoji, whatever the random number", () => {
    for (const previous of ids) {
      for (const r of [0, 0.25, 0.5, 0.75, 0.999999]) {
        expect(pickCelebrationVariant(previous, () => r).id).not.toBe(previous);
      }
    }
  });
});
