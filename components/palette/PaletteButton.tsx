"use client";

import { useCommandPalette } from "./PaletteProvider";

export function PaletteButton() {
  const { open, preload } = useCommandPalette();
  return (
    <button
      type="button"
      onClick={open}
      onPointerEnter={preload}
      onFocus={preload}
      aria-keyshortcuts="Meta+K Control+K"
      className="ml-1.5 cursor-pointer rounded-md border border-btn-border bg-transparent px-[7px] py-0.5 font-mono text-[12px] text-muted"
    >
      <span>⌘K</span>
      <span className="sr-only"> Open command palette</span>
    </button>
  );
}
