/**
 * The animated emoji the "sale logged" popup picks from, one at random per
 * sale (see `pickCelebrationVariant` in `celebration.ts`), each with its own
 * entrance and its own looping motion afterwards.
 *
 * The images are Google's Noto Animated Emoji (animated WebP, 512px), copied
 * into `public/celebrations/` so the app doesn't depend on Google's servers.
 * Licensed CC BY 4.0, which asks for credit: see the README's "Credits".
 *
 * `enter` and `idle` name CSS animations in `globals.css`
 * (`.celebrate-enter-*`, `.celebrate-idle-*`).
 */

export type CelebrationEnter =
  | "slam"
  | "spin"
  | "zoom"
  | "roll"
  | "rise"
  | "stamp"
  | "slide"
  | "drop";

export type CelebrationIdle =
  | "pump"
  | "shake"
  | "jelly"
  | "spin"
  | "tilt"
  | "hop"
  | "pulse"
  | "poke"
  | "updown"
  | "stomp"
  | "float";

export type CelebrationVariant = {
  /** Stable name, unique per variant: what "never the same twice in a row"
   * compares. */
  id: string;
  /** File name under `public/celebrations/`, without `.webp`: the emoji's
   * Unicode codepoint, as Google names them. */
  image: string;
  /** Hebrew description, used as the image's alt text. */
  label: string;
  enter: CelebrationEnter;
  idle: CelebrationIdle;
  /** Two copies of the image side by side, mirrored, jabbing in turn. */
  double?: boolean;
  /** The whole popup jolts when the emoji lands. */
  screenShake?: boolean;
  /** The screen pulses red. */
  flash?: boolean;
  /** Small copies of the emoji rain down along with the confetti. */
  rain?: boolean;
  /** Twice the confetti. */
  party?: boolean;
};

export const CELEBRATION_VARIANTS: readonly CelebrationVariant[] = [
  { id: "middle-finger", image: "1f595", label: "אצבע משולשת", enter: "slam", idle: "pump", screenShake: true },
  { id: "double-middle-finger", image: "1f595", label: "שתי אצבעות משולשות", enter: "rise", idle: "pump", double: true, screenShake: true },
  { id: "hatching-chick", image: "1f423", label: "אפרוח בוקע מביצה", enter: "drop", idle: "hop" },
  { id: "pointing-at-you", image: "1faf5", label: "מצביע עליך", enter: "zoom", idle: "poke" },
  { id: "sunglasses", image: "1f60e", label: "משקפי שמש", enter: "slide", idle: "tilt" },
  { id: "poop", image: "1f4a9", label: "קקי", enter: "drop", idle: "jelly", rain: true },
  { id: "clown", image: "1f921", label: "ליצן", enter: "rise", idle: "jelly" },
  { id: "thumbs-down", image: "1f44e", label: "לייק הפוך", enter: "stamp", idle: "stomp", screenShake: true },
  { id: "pinched-fingers", image: "1f90c", label: "רגע", enter: "spin", idle: "updown" },
  { id: "zany", image: "1f92a", label: "משוגע", enter: "spin", idle: "spin" },
  { id: "winking-tongue", image: "1f61c", label: "קורץ עם לשון", enter: "zoom", idle: "tilt" },
  { id: "smirk", image: "1f60f", label: "חיוך ממזרי", enter: "slide", idle: "pulse" },
  { id: "cursing", image: "1f92c", label: "מקלל", enter: "stamp", idle: "shake", screenShake: true, flash: true },
  { id: "partying", image: "1f973", label: "חוגג", enter: "zoom", idle: "hop", party: true },
  { id: "money-with-wings", image: "1f4b8", label: "כסף עף", enter: "spin", idle: "float", rain: true },
  { id: "skull", image: "1f480", label: "גולגולת", enter: "drop", idle: "shake" },
  { id: "rolling-laughing", image: "1f923", label: "מתגלגל מצחוק", enter: "roll", idle: "spin" },
];

export function celebrationImageSrc(variant: CelebrationVariant): string {
  return `/celebrations/${variant.image}.webp`;
}

/** Starts downloading a variant's image ahead of time (the files are a few
 * hundred KB), so the popup can open straight into the animation. Call it
 * from an event handler; a no-op where there's no `Image` (server, tests
 * that lack it). */
export function preloadCelebrationImage(variant: CelebrationVariant): void {
  if (typeof Image === "undefined") return;
  const image = new Image();
  image.src = celebrationImageSrc(variant);
}
