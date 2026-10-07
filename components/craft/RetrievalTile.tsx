"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { chunks } from "@/content/chunks";
import { SourceLink } from "../SourceLink";
import { craft } from "@/content/craft";

const { count, seed: SEED, label } = craft.retrieval;
const STEP = 0.05;
const clamp = (n: number) => Math.min(1, Math.max(0, n));

// Deterministic points (same LCG as the design) so server and client agree.
function makePoints() {
  const pts: { x: number; y: number }[] = [];
  let seed = SEED;
  for (let i = 0; i < count; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const rx = seed / 233280;
    seed = (seed * 9301 + 49297) % 233280;
    const ry = seed / 233280;
    pts.push({ x: 0.08 + rx * 0.84, y: 0.08 + ry * 0.76 });
  }
  return pts;
}

export function RetrievalTile({ caption }: { caption: React.ReactNode }) {
  const points = useMemo(makePoints, []);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 300, h: 240 });
  const [q, setQ] = useState({ x: 0.55, y: 0.45 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    setSize({ w: el.offsetWidth, h: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  const qx = q.x * size.w;
  const qy = q.y * size.h;
  const placed = points.map((p, i) => {
    const x = p.x * size.w;
    const y = p.y * size.h;
    return { i, x, y, d: Math.hypot(x - qx, y - qy) };
  });
  const top = [...placed].sort((a, b) => a.d - b.d).slice(0, 3);
  const topSet = new Set(top.map((t) => t.i));
  const nearest = chunks[top[0]?.i ?? 0];

  function onPointer(e: React.PointerEvent<HTMLDivElement>) {
    if (e.type === "pointerdown") setActive(true);
    // Mouse follows hover; touch and pen only while pressed.
    if (e.pointerType !== "mouse" && e.buttons === 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    setQ({ x: clamp((e.clientX - r.left) / r.width), y: clamp((e.clientY - r.top) / r.height) });
  }

  function onKey(e: React.KeyboardEvent) {
    const move: Record<string, [number, number]> = {
      ArrowLeft: [-STEP, 0],
      ArrowRight: [STEP, 0],
      ArrowUp: [0, -STEP],
      ArrowDown: [0, STEP],
    };
    const m = move[e.key];
    if (!m) return;
    e.preventDefault();
    setQ((p) => ({ x: clamp(p.x + m[0]), y: clamp(p.y + m[1]) }));
  }

  return (
    // The wrapper owns hover and focus, so moving from the tile down to the link keeps the line visible.
    <div
      className="flex flex-col gap-2.5"
      onPointerEnter={(e) => e.pointerType === "mouse" && setActive(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setActive(false);
      }}
    >
      <div
        ref={box}
        role="group"
        tabIndex={0}
        aria-label="Retrieval demo. Use the arrow keys to move the query point. The three nearest of 32 chunks are highlighted."
        onPointerDown={onPointer}
        onPointerMove={onPointer}
        onKeyDown={onKey}
        className="group relative h-60 cursor-crosshair touch-pan-y overflow-hidden rounded-2xl border border-tile-border bg-tile"
      >
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
          {top.map((t) => (
            <line key={t.i} x1={qx} y1={qy} x2={t.x} y2={t.y} stroke="var(--line)" strokeWidth="1" />
          ))}
        </svg>
        {placed.map((p) => {
          const on = topSet.has(p.i);
          return (
            <span
              key={p.i}
              aria-hidden="true"
              className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${on ? "size-2 bg-text" : "size-[5px] bg-field-dot"}`}
              style={{ left: Math.round(p.x), top: Math.round(p.y) }}
            />
          );
        })}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-text"
          style={{ left: Math.round(qx), top: Math.round(qy) }}
        />
        <span className="absolute bottom-3 left-3.5 font-mono text-[11px] text-muted">{label}</span>
        {/* Keyboard hint: visible only for :focus-visible, so mouse users never see it. */}
        <span
          aria-hidden="true"
          className="absolute right-3.5 bottom-3 font-mono text-[11px] text-muted opacity-0 group-focus-visible:opacity-100"
        >
          Use arrow keys
        </span>
      </div>
      {caption}
      {/* Nearest chunk, one quiet line that links to the section it came from. Space is always reserved. */}
      <p aria-live="polite" className="m-0 -mt-1 h-5 truncate text-[13px] text-muted">
        {active && nearest && <SourceLink href={nearest.href}>{nearest.text}</SourceLink>}
      </p>
    </div>
  );
}
