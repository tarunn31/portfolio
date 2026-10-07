"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ask, suggestions } from "@/content/ask";
import {
  ASK_LIMITS,
  ASK_PREFILL_EVENT,
  ASK_PREFILL_KEY,
  FALLBACK_MESSAGE,
  type AskAnswer,
} from "@/lib/ask/types";
import {
  AnswerBody,
  AskHeader,
  FallbackNote,
  cardClass,
  chipClass,
  enterClass,
  inputClass,
} from "./AskAnswer";

type View =
  { status: "answer"; answer: AskAnswer } | { status: "loading" } | { status: "error"; message: string };

function isAnswer(x: unknown): x is AskAnswer {
  const a = x as AskAnswer | null;
  return (
    !!a &&
    typeof a.grounded === "boolean" &&
    Array.isArray(a.answer) &&
    a.answer.every((p) => typeof p?.text === "string" && Array.isArray(p?.cite)) &&
    Array.isArray(a.sources)
  );
}

/** What the facade learned from a touch before this code finished loading. */
export type AskHandoff = { focusInput?: boolean; pick?: number };

export function AskSection({ handoff }: { handoff?: AskHandoff }) {
  const [question, setQuestion] = useState(suggestions[0]!.q);
  const [selected, setSelected] = useState<number | null>(0);
  const [view, setView] = useState<View>({ status: "answer", answer: suggestions[0]!.answer });
  const abort = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const input = useRef<HTMLInputElement>(null);

  const pick = useCallback((i: number) => {
    abort.current?.abort();
    busy.current = false;
    const s = suggestions[i]!;
    setQuestion(s.q);
    setSelected(i);
    setView({ status: "answer", answer: s.answer });
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (!q) return;

      // A suggested question is answered instantly from content, with no API call.
      const known = suggestions.findIndex((s) => s.q.toLowerCase() === q.toLowerCase());
      if (known >= 0) return pick(known);

      abort.current?.abort();
      const ctl = new AbortController();
      abort.current = ctl;
      busy.current = true;
      setQuestion(q);
      setSelected(null);
      setView({ status: "loading" });
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
          signal: ctl.signal,
        });
        const data: unknown = await res.json().catch(() => null);
        if (res.ok && isAnswer(data)) setView({ status: "answer", answer: data });
        else setView({ status: "error", message: FALLBACK_MESSAGE });
      } catch (err) {
        if ((err as Error).name !== "AbortError") setView({ status: "error", message: FALLBACK_MESSAGE });
      } finally {
        if (abort.current === ctl) busy.current = false;
      }
    },
    [pick],
  );

  // A question parked by the command palette is sent as soon as Ask is here, or when it arrives later.
  const takePrefill = useCallback(() => {
    try {
      const q = sessionStorage.getItem(ASK_PREFILL_KEY);
      if (!q) return;
      sessionStorage.removeItem(ASK_PREFILL_KEY);
      void send(q.slice(0, ASK_LIMITS.maxQuestionChars));
    } catch {
      // Storage can be blocked: the palette then just scrolls to Ask.
    }
  }, [send]);

  useEffect(() => {
    if (handoff?.pick !== undefined) pick(handoff.pick);
    else if (handoff?.focusInput) input.current?.focus();
    takePrefill();
    window.addEventListener(ASK_PREFILL_EVENT, takePrefill);
    return () => window.removeEventListener(ASK_PREFILL_EVENT, takePrefill);
    // Runs once on mount: the handoff only describes what happened before this code loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!busy.current) void send(question);
  }

  return (
    <>
      <AskHeader />

      <div className={cardClass}>
        <form
          onSubmit={submit}
          className="flex min-h-[52px] items-center gap-3 border-b border-tile-border px-4"
        >
          <input
            ref={input}
            type="text"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              setSelected(null);
            }}
            maxLength={ASK_LIMITS.maxQuestionChars}
            aria-label={ask.inputLabel}
            autoComplete="off"
            className={inputClass}
          />
          <button type="submit" disabled={view.status === "loading"} className={enterClass}>
            Enter<span className="sr-only"> to ask</span>
          </button>
        </form>

        <div aria-live="polite" aria-busy={view.status === "loading"} className="flex flex-col gap-3.5 p-4">
          {view.status === "loading" && <p className="m-0 text-muted">Thinking</p>}
          {view.status === "error" && (
            <p className="m-0 text-body">
              <FallbackNote message={view.message} />
            </p>
          )}
          {view.status === "answer" && <AnswerBody answer={view.answer} />}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={s.q}
            type="button"
            data-ask-chip={i}
            onClick={() => pick(i)}
            aria-pressed={selected === i}
            className={chipClass(selected === i)}
          >
            {s.q}
          </button>
        ))}
      </div>
    </>
  );
}
