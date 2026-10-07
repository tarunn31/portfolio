"use client";

import { useState } from "react";
import { craft } from "@/content/craft";
import { TileButton } from "./TileButton";

const p = craft.pattern;

export function PatternTile() {
  const [days, setDays] = useState<number>(p.start);
  const unlocked = days >= p.needed;

  return (
    <div className="box-border flex h-60 flex-col justify-between rounded-2xl border border-tile-border bg-tile p-4">
      <div aria-hidden="true" className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: p.needed }, (_, i) => (
          <span
            key={i}
            className={`h-7 rounded-md border ${i < days ? "border-text bg-text" : "border-btn-border bg-transparent"}`}
          />
        ))}
      </div>
      <p
        role="status"
        className={`m-0 text-[14px] leading-[1.55] ${unlocked ? "text-text" : "text-muted"}`}
      >
        {unlocked ? p.unlocked : p.locked}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-muted">
          {Math.min(days, p.needed)} of {p.needed} paired days
        </span>
        <TileButton onClick={() => setDays(unlocked ? 0 : days + 1)}>{unlocked ? "Reset" : "Log a day"}</TileButton>
      </div>
    </div>
  );
}
