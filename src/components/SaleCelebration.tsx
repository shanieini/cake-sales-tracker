"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import EggLogo from "@/components/EggLogo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { cakeStrings as s } from "@/lib/strings";
import { formatCakeAmount, saleTotal } from "@/lib/summarize";
import type { CakeSale } from "@/lib/types";

type Props = {
  open: boolean;
  /** The sale that was just logged. Kept by the caller after `open` turns
   * false so the popup still has its text while it animates out. */
  sale: CakeSale | null;
  /** The phrase heading the popup, picked by the caller per sale (see
   * `pickCelebrationTitle`) so it stays put while the popup is open. */
  title: string;
  onOpenChange: (open: boolean) => void;
};

type ConfettiPiece = {
  left: string;
  width: number;
  height: number;
  radius: string;
  color: string;
  fall: "confetti-fall-a" | "confetti-fall-b";
  duration: string;
  delay: string;
  sway: string;
};

const CONFETTI_COLORS = [
  "#FDE94C",
  "#EA5A46",
  "#F2A7B4",
  "#7CC4B5",
  "#FFFBEF",
  "#F59E3B",
];
const CONFETTI_COUNT = 56;

/**
 * The same confetti every time, worked out once at load from a fixed seed.
 * Nobody compares two popups closely enough to notice, and it keeps random
 * numbers out of rendering. Negative delays start most pieces part-way down
 * the screen, so the popup opens into confetti that's already falling.
 */
const CONFETTI: ConfettiPiece[] = (() => {
  let seed = 20261121;
  function random() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return Array.from({ length: CONFETTI_COUNT }, () => {
    const round = random() < 0.3;
    return {
      left: `${(random() * 104 - 2).toFixed(1)}%`,
      width: round ? 9 : 6 + Math.round(random() * 4),
      height: round ? 9 : 12 + Math.round(random() * 7),
      radius: round ? "50%" : "2px",
      color: CONFETTI_COLORS[Math.floor(random() * CONFETTI_COLORS.length)],
      fall: random() < 0.5 ? "confetti-fall-a" : "confetti-fall-b",
      duration: `${(2.8 + random() * 2.4).toFixed(2)}s`,
      delay: `${(-random() * 4 + 0.4).toFixed(2)}s`,
      sway: `${(0.9 + random() * 1.4).toFixed(2)}s`,
    };
  });
})();

/**
 * The joke popup shown right after a new sale is logged: an egg, a random
 * phrase from `cakeStrings.celebrationTitles`, what was sold, and confetti
 * over the whole screen until it's dismissed. Built from the dialog
 * primitives rather than `DialogContent`,
 * because the confetti has to cover the whole viewport and so can't live
 * inside the (transformed) popup box. People who ask their device for less
 * motion get the popup without the confetti or the wobble (see
 * `globals.css`).
 */
export default function SaleCelebration({
  open,
  sale,
  title,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/55" />
        <div
          aria-hidden
          data-testid="confetti"
          className="confetti-layer pointer-events-none fixed inset-0 z-[1001] overflow-hidden"
        >
          {CONFETTI.map((piece, index) => (
            <div
              key={index}
              className="confetti-sway absolute top-0"
              style={{ left: piece.left, animationDuration: piece.sway }}
            >
              <div
                className={piece.fall}
                style={{
                  width: piece.width,
                  height: piece.height,
                  borderRadius: piece.radius,
                  background: piece.color,
                  animationDuration: piece.duration,
                  animationDelay: piece.delay,
                }}
              />
            </div>
          ))}
        </div>
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className="fixed top-1/2 left-1/2 z-[1000] flex w-[calc(100%-4rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3.5 rounded-[1.75rem] bg-popover px-6 pt-16 pb-6 text-center text-popover-foreground shadow-2xl ring-1 ring-foreground/10 duration-200 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-90 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
        >
          <div className="egg-wobble absolute -top-12 left-1/2 flex size-24 -translate-x-1/2 items-center justify-center rounded-[1.9rem] bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-[0_18px_36px_-14px_color-mix(in_srgb,var(--primary)_70%,transparent)]">
            <EggLogo className="size-16" />
          </div>
          <DialogPrimitive.Title className="text-4xl leading-tight font-extrabold tracking-tight text-balance">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-sm text-muted">
            {s.celebrationBody}
          </DialogPrimitive.Description>
          {sale && (
            <p className="flex flex-wrap items-center justify-center gap-x-2 rounded-full bg-primary-tint px-4 py-2 text-sm">
              <span>
                {sale.cakeType} × {sale.quantity}
              </span>
              <span aria-hidden className="text-muted">
                ·
              </span>
              <span dir="ltr" className="font-bold">
                {formatCakeAmount(saleTotal(sale))}
              </span>
            </p>
          )}
          <DialogPrimitive.Close
            render={<Button className="mt-2 h-12 w-full text-base" />}
          >
            {s.celebrationDismiss}
          </DialogPrimitive.Close>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
