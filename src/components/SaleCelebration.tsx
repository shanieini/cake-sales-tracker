"use client";

import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import {
  celebrationImageSrc,
  type CelebrationVariant,
} from "@/lib/celebration-variants";
import { cakeStrings as s } from "@/lib/strings";
import { formatCakeAmount, saleTotal } from "@/lib/summarize";
import type { CakeSale } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  /** The sale that was just logged. Kept by the caller after `open` turns
   * false so the popup still has its content while it animates out. */
  sale: CakeSale | null;
  /** The phrase heading the popup, picked by the caller per sale (see
   * `pickCelebrationTitle`) so it stays put while the popup is open. */
  title: string;
  /** The animated emoji and how it moves, picked by the caller per sale
   * (see `pickCelebrationVariant`). */
  variant: CelebrationVariant | null;
  onOpenChange: (open: boolean) => void;
};

/** How long to wait for the emoji image before starting the animation
 * anyway (slow connection, or an environment that never loads images). */
const READY_FALLBACK_MS = 1500;

const CONFETTI_COLORS = [
  "#FDE94C",
  "#EA5A46",
  "#F2A7B4",
  "#7CC4B5",
  "#FFFBEF",
  "#F59E3B",
];

type FallingPiece = {
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

function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Confetti worked out once at load from a fixed seed: the same every time,
 * which nobody notices, and it keeps random numbers out of rendering.
 * Negative delays start most pieces part-way down the screen, so the popup
 * opens into confetti that's already falling.
 */
function makeConfetti(seed: number, count: number): FallingPiece[] {
  const random = seededRandom(seed);
  return Array.from({ length: count }, () => {
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
}

const CONFETTI = makeConfetti(20261121, 40);
/** Extra confetti for variants marked `party`. */
const CONFETTI_EXTRA = makeConfetti(20261122, 44);

/** Where and how the small copies of the emoji fall, for variants marked
 * `rain` (the image itself comes from the variant). */
const RAIN = (() => {
  const random = seededRandom(20261123);
  return Array.from({ length: 14 }, () => ({
    left: `${(random() * 100 - 5).toFixed(1)}%`,
    size: 40 + Math.round(random() * 26),
    fall: random() < 0.5 ? "confetti-fall-a" : "confetti-fall-b",
    duration: `${(2.4 + random() * 1.6).toFixed(2)}s`,
    delay: `${(0.6 - random() * 3.5).toFixed(2)}s`,
    sway: `${(0.9 + random() * 1.2).toFixed(2)}s`,
  }));
})();

/**
 * The joke popup shown right after a new sale is logged: one of Google's
 * animated emoji making a scene, a random phrase punching in, what was
 * sold, and confetti until it's dismissed. Which emoji, how it enters and
 * how it moves after come from the `variant` (see `celebration-variants.ts`).
 *
 * The popup is a full-screen layer rather than a centred card, so the
 * confetti and the screen shake can use the whole screen. People who ask
 * their device for less motion get it all standing still and no confetti
 * (see `globals.css`).
 */
export default function SaleCelebration({
  open,
  sale,
  title,
  variant,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-[#1c1a17]/80" />
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className="fixed inset-0 z-[1000] overflow-hidden outline-none duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        >
          {sale && variant && (
            // Keyed per sale so the stage (and its "image loaded yet" state,
            // and every animation) starts fresh each time.
            <CelebrationStage
              key={sale.id}
              sale={sale}
              title={title}
              variant={variant}
            />
          )}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}

function CelebrationStage({
  sale,
  title,
  variant,
}: {
  sale: CakeSale;
  title: string;
  variant: CelebrationVariant;
}) {
  // The animation classes go on only once the emoji has loaded (usually
  // straight away, since the caller preloads it), so the entrance never
  // plays with an empty image.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), READY_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, []);
  const animate = (className: string | false | undefined) =>
    ready ? className || undefined : undefined;

  const src = celebrationImageSrc(variant);
  const handleLoad = () => setReady(true);

  return (
    <>
      {variant.flash && (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 bg-[#E8505B] opacity-0",
            animate("celebrate-flash"),
          )}
        />
      )}

      <div
        className={cn(
          "relative flex h-full flex-col items-center justify-center gap-5 px-6",
          !ready && "invisible",
          animate(variant.screenShake && "celebrate-shake"),
        )}
      >
        <div className="relative flex h-[260px] w-full max-w-sm items-center justify-center">
          <div
            aria-hidden
            className={cn(
              "absolute size-[360px] rounded-full bg-[radial-gradient(circle,rgba(253,233,76,0.42),rgba(253,233,76,0)_64%)]",
              animate("celebrate-glow"),
            )}
          />
          <div
            data-testid="celebration-hero"
            className={cn("relative", animate(`celebrate-enter-${variant.enter}`))}
          >
            {variant.double ? (
              <div className="relative h-[200px] w-[330px]">
                <div className="absolute top-0 left-0 size-[165px] -rotate-12">
                  <div className={animate("celebrate-jab-left")}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- an animated WebP shown as-is; next/image would re-encode it and drop the animation */}
                    <img
                      src={src}
                      alt={variant.label}
                      width={165}
                      height={165}
                      onLoad={handleLoad}
                      className="size-[165px] -scale-x-100 object-contain"
                    />
                  </div>
                </div>
                <div className="absolute top-0 left-[165px] size-[165px] rotate-12">
                  <div className={animate("celebrate-jab-right")}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
                    <img
                      src={src}
                      alt=""
                      width={165}
                      height={165}
                      className="size-[165px] object-contain"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className={animate(`celebrate-idle-${variant.idle}`)}>
                {/* eslint-disable-next-line @next/next/no-img-element -- an animated WebP shown as-is; next/image would re-encode it and drop the animation */}
                <img
                  src={src}
                  alt={variant.label}
                  width={260}
                  height={260}
                  onLoad={handleLoad}
                  className="size-[260px] object-contain"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center text-[#f3ecdc]">
          <DialogPrimitive.Title
            className={cn(
              "text-4xl leading-tight font-black tracking-tight text-balance",
              animate("celebrate-punch"),
            )}
          >
            {title}
          </DialogPrimitive.Title>
          <div
            className={cn(
              "flex w-full flex-col items-center gap-3",
              animate("celebrate-appear"),
            )}
          >
            <DialogPrimitive.Description className="text-sm text-[#d8cfb8]">
              {s.celebrationBody}
            </DialogPrimitive.Description>
            <p className="flex flex-wrap items-center justify-center gap-x-2 rounded-full bg-[#f3ecdc] px-4 py-2 text-sm text-[#1c1a17]">
              <span>
                {sale.cakeType} × {sale.quantity}
              </span>
              <span aria-hidden className="text-[#6f6a5e]">
                ·
              </span>
              <span dir="ltr" className="font-bold">
                {formatCakeAmount(saleTotal(sale))}
              </span>
            </p>
            <DialogPrimitive.Close
              render={
                <Button className="mt-3 h-12 w-full bg-[#FDE94C] text-base font-bold text-[#1c1a17] hover:bg-[#f6e03c]" />
              }
            >
              {s.celebrationDismiss}
            </DialogPrimitive.Close>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        data-testid="confetti"
        className="confetti-layer pointer-events-none absolute inset-0 overflow-hidden"
      >
        {variant.rain &&
          RAIN.map((drop, index) => (
            <div
              key={`rain-${index}`}
              className="confetti-sway absolute top-0"
              style={{ left: drop.left, animationDuration: drop.sway }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
              <img
                src={src}
                alt=""
                width={drop.size}
                height={drop.size}
                className={drop.fall}
                style={{
                  display: "block",
                  animationDuration: drop.duration,
                  animationDelay: drop.delay,
                }}
              />
            </div>
          ))}
        {[...CONFETTI, ...(variant.party ? CONFETTI_EXTRA : [])].map(
          (piece, index) => (
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
          ),
        )}
      </div>
    </>
  );
}
