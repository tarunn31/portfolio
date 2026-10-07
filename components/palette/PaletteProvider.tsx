"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
// The palette (and the case study text it lists) is a separate chunk, fetched on first use.
const loadPalette = () => import("./CommandPalette");
const CommandPalette = dynamic(() => loadPalette().then((m) => m.CommandPalette), { ssr: false });

type Ctx = { open: () => void; preload: () => void };
const PaletteContext = createContext<Ctx>({ open: () => {}, preload: () => {} });
export const useCommandPalette = () => useContext(PaletteContext);

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  const open = useCallback(() => setOpen(true), []);
  const preload = useCallback(() => void loadPalette(), []);

  // Cmd+K on Mac, Ctrl+K elsewhere, from anywhere on the site (including inside inputs).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Fetch the palette as soon as the shortcut's modifier goes down, so it opens instantly.
      if (e.key === "Meta" || e.key === "Control") preload();
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preload]);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  }, []);

  const value = useMemo(() => ({ open, preload }), [open, preload]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      {isOpen && <CommandPalette onClose={() => setOpen(false)} notify={notify} />}
      {/* Polite live region so "Email copied" is announced; visible as a small pill. */}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center">
        {toast && (
          <span className="rounded-full border border-tile-border bg-tile px-3.5 py-1.5 font-mono text-[12px] text-text shadow-sm">
            {toast}
          </span>
        )}
      </div>
    </PaletteContext.Provider>
  );
}
