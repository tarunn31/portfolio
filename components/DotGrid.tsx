"use client";

import { useEffect, useRef } from "react";

const CELL = 22;
const PARALLAX = 0.3;

type Props = { variant?: "live" | "static" };

/**
 * Signature dot grid.
 * live:   fixed layer that drifts at 0.3x scroll speed, plus a cursor spotlight (fine pointers only).
 * static: margins-only grid that scrolls with the page, no motion (case studies).
 * Reduced motion: both render the plain static grid.
 */
export function DotGrid({ variant = "live" }: Props) {
  const layer = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "live") return;
    const el = layer.current;
    const spotEl = spot.current;
    if (!el || !spotEl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let scrollY = window.scrollY;
    let mx = -9999;
    let my = -9999;
    let frame = 0;

    const paint = () => {
      frame = 0;
      // The grid repeats every CELL px, so wrapping the shift is visually identical to the full offset.
      const shift = (scrollY * PARALLAX) % CELL;
      el.style.transform = `translate3d(0, ${-shift}px, 0)`;
      spotEl.style.setProperty("--mx", `${mx}px`);
      spotEl.style.setProperty("--my", `${my + shift}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      schedule();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      schedule();
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
      schedule();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    if (finePointer) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    paint();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, [variant]);

  if (variant === "static") {
    return <div aria-hidden="true" className="dots-base mask-case pointer-events-none absolute inset-0" />;
  }

  return (
    <div
      ref={layer}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 right-0 left-0 z-0 will-change-transform"
      style={{ height: `calc(100vh + ${CELL}px)` }}
    >
      <div className="dots-base mask-home absolute inset-0" />
      <div ref={spot} className="dots-spot absolute inset-0" />
    </div>
  );
}
