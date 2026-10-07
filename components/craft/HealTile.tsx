"use client";

import { useState } from "react";
import { craft } from "@/content/craft";
import { TileButton } from "./TileButton";

const { statuses, error, bars } = craft.heal;

export function HealTile() {
  const [step, setStep] = useState(0);
  const key = step >= 2 ? '"Revenue"' : '"revenue"';
  const keyColor = step === 1 ? "text-red" : step === 2 ? "text-green" : "text-body";

  return (
    <div className="box-border flex h-60 flex-col gap-2.5 rounded-2xl border border-tile-border bg-tile p-4">
      <div className="flex items-center justify-between gap-2">
        <span role="status" className="font-mono text-[11px] text-muted">
          {statuses[step]}
        </span>
        <TileButton onClick={() => setStep((s) => (s + 1) % 4)}>{step === 3 ? "Reset" : "Run"}</TileButton>
      </div>
      {step < 3 && (
        <pre className="m-0 font-mono text-[12px] leading-[1.8] whitespace-pre-wrap text-body">
          {'df.groupby("Region")['}
          <span className={keyColor}>{key}</span>
          {"].sum()"}
        </pre>
      )}
      {step === 1 && <span className="font-mono text-[12px] text-red">{error}</span>}
      {step === 3 && (
        <div
          role="img"
          aria-label="Bar chart by region: East, West, North, South"
          className="flex flex-1 items-end gap-2.5 pt-2"
        >
          {bars.map((b) => (
            <div key={b.label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="w-full rounded-t bg-text" style={{ height: b.h }} />
              <span className="font-mono text-[10px] text-muted">{b.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
