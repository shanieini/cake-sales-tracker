import { cakeStrings as s } from "./strings";

/**
 * A random phrase for the "sale logged" popup, never the same one as last
 * time (`previous`), so two sales in a row always get different phrases.
 * `random` is injectable for tests; it defaults to `Math.random`.
 */
export function pickCelebrationTitle(
  previous: string | null,
  random: () => number = Math.random,
): string {
  const titles: readonly string[] = s.celebrationTitles;
  const options =
    titles.length > 1 ? titles.filter((title) => title !== previous) : titles;
  return options[Math.min(Math.floor(random() * options.length), options.length - 1)];
}
