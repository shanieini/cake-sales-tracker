import { describe, expect, it } from "vitest";
import { pickCelebrationTitle } from "./celebration";
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
