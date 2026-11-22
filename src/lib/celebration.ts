import {
  CELEBRATION_VARIANTS,
  type CelebrationVariant,
} from "./celebration-variants";
import { cakeStrings as s } from "./strings";

/** A random item, never one `isPrevious` matches unless it's the only one.
 * `random` is injectable for tests. */
function pickFresh<T>(
  items: readonly T[],
  isPrevious: (item: T) => boolean,
  random: () => number,
): T {
  const fresh = items.filter((item) => !isPrevious(item));
  const options = fresh.length > 0 ? fresh : items;
  return options[Math.min(Math.floor(random() * options.length), options.length - 1)];
}

/**
 * A random phrase for the "sale logged" popup, never the same one as last
 * time (`previous`), so two sales in a row always get different phrases.
 * `random` is injectable for tests; it defaults to `Math.random`.
 */
export function pickCelebrationTitle(
  previous: string | null,
  random: () => number = Math.random,
): string {
  return pickFresh(s.celebrationTitles, (title) => title === previous, random);
}

/**
 * A random animated emoji for the "sale logged" popup, never the same one
 * as last time (`previousId`). Picked independently of the phrase.
 */
export function pickCelebrationVariant(
  previousId: string | null,
  random: () => number = Math.random,
): CelebrationVariant {
  return pickFresh(
    CELEBRATION_VARIANTS,
    (variant) => variant.id === previousId,
    random,
  );
}
