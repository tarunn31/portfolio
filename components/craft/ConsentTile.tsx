"use client";

import { useState } from "react";
import { craft } from "@/content/craft";

const c = craft.consent;

export function ConsentTile() {
  const [on, setOn] = useState(false);
  const state = on ? c.on : c.off;

  return (
    <div className="box-border flex h-60 flex-col justify-between rounded-2xl border border-tile-border bg-tile p-4">
      <div className="flex items-center justify-between">
        <span id="consent-label" className="text-[14px]">
          {c.switchLabel}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-labelledby="consent-label"
          onClick={() => setOn((v) => !v)}
          className={`relative h-[26px] w-11 cursor-pointer rounded-[13px] border-0 p-0 transition-colors ${on ? "bg-green" : "bg-switch-off"}`}
        >
          <span
            aria-hidden="true"
            className="absolute top-[3px] size-5 rounded-full bg-knob transition-[left] duration-[180ms] ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{ left: on ? 21 : 3 }}
          />
        </button>
      </div>
      <div role="status" className="flex flex-col gap-1.5 font-mono text-[12px]">
        <span className="text-muted">{c.request}</span>
        <span className={on ? "text-green-ink" : "text-red"}>{state.result}</span>
        <span className="text-muted">{state.note}</span>
      </div>
    </div>
  );
}
