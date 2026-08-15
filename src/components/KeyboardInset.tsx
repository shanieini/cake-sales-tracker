"use client";

import { useEffect } from "react";

/**
 * Publishes how much of the screen the on-screen keyboard is covering as
 * `--keyboard-inset` on the root element.
 *
 * iOS is the reason this exists. Android shrinks the layout viewport when the
 * keyboard opens, so `dvh` and `position: fixed` bottom anchoring both just
 * work. iOS instead leaves the layout viewport at full height and slides the
 * keyboard over the top of it, so a drawer pinned to `bottom-0` sits *behind*
 * the keyboard. When you then focus a field down there, Safari has no way to
 * scroll a fixed element into view — so it zooms and pans the visual viewport
 * to reach the caret instead, and never zooms back out. That is the "tapping an
 * input zooms the page" bug, and it happens regardless of font-size.
 *
 * `visualViewport` is the only thing that reports the keyboard on iOS. The
 * inset is the gap between the bottom of the layout viewport and the bottom of
 * the visual viewport; it is 0 whenever no keyboard is up, which keeps every
 * `var(--keyboard-inset, 0px)` consumer inert on desktop and Android.
 */
export default function KeyboardInset() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // `offsetTop` matters because iOS also shifts the visual viewport up when
      // it scrolls to a field; without it the inset reads short mid-animation.
      const covered = window.innerHeight - (vv.height + vv.offsetTop);
      // Sub-pixel noise and rubber-band scrolling both produce tiny non-zero
      // values, which would jitter the drawer. Treat anything small as closed.
      const inset = covered > 24 ? Math.round(covered) : 0;
      document.documentElement.style.setProperty(
        "--keyboard-inset",
        `${inset}px`,
      );
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    // Lifting the drawer covers fields that live in it, but not ones in a
    // popup portalled out of it — the place autocomplete's list is anchored to
    // the viewport, so it ignores the lift. Rather than chase every such layer,
    // scroll whatever actually has focus back into the visible strip once the
    // keyboard has settled. If it's already visible this does nothing.
    let raf = 0;
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.matches("input, textarea, [contenteditable='true']")) return;
      window.clearTimeout(raf);
      raf = window.setTimeout(() => {
        const bottom = vv.height + vv.offsetTop;
        const rect = target.getBoundingClientRect();
        if (rect.bottom > bottom - 8 || rect.top < vv.offsetTop + 8) {
          target.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }, 350);
    };
    document.addEventListener("focusin", onFocusIn);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      document.removeEventListener("focusin", onFocusIn);
      window.clearTimeout(raf);
      document.documentElement.style.removeProperty("--keyboard-inset");
    };
  }, []);

  return null;
}
