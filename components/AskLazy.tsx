"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ASK_PREFILL_EVENT, ASK_PREFILL_KEY } from "@/lib/ask/types";
import type { AskHandoff } from "./AskSection";

// The interactive Ask code is a separate chunk, fetched only when it is needed.
const Ask = lazy(() => import("./AskSection").then((m) => ({ default: m.AskSection })));

/**
 * Shows the server-rendered facade, and loads the interactive Ask when the section is within a screen or
 * so of the viewport, when someone touches the facade, or when the command palette sends it a question.
 */
export function AskLazy({ facade }: { facade: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const handoff = useRef<AskHandoff>({});

  useEffect(() => {
    try {
      if (sessionStorage.getItem(ASK_PREFILL_KEY)) setReady(true);
    } catch {
      // Storage can be blocked; Ask still loads on scroll or touch.
    }
    const load = () => setReady(true);
    window.addEventListener(ASK_PREFILL_EVENT, load);
    const el = box.current;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && load(), {
      rootMargin: "800px 0px",
    });
    if (el) io.observe(el);
    return () => {
      window.removeEventListener(ASK_PREFILL_EVENT, load);
      io.disconnect();
    };
  }, []);

  // A touch on the facade starts the load and is remembered, so the first click is not lost in the swap.
  function touch(e: React.SyntheticEvent) {
    if (ready) return;
    const t = e.target as HTMLElement;
    if (t.closest("input")) handoff.current.focusInput = true;
    const chip = t.closest<HTMLElement>("[data-ask-chip]");
    if (chip) handoff.current.pick = Number(chip.dataset.askChip);
    setReady(true);
  }

  return (
    <div ref={box} className="flex flex-col gap-4" onPointerDownCapture={touch} onFocusCapture={touch}>
      <Suspense fallback={facade}>{ready ? <Ask handoff={handoff.current} /> : facade}</Suspense>
    </div>
  );
}
