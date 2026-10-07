"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { paletteItems, type PaletteAction, type PaletteItem } from "@/content/palette";
import { ASK_LIMITS, ASK_PREFILL_EVENT, ASK_PREFILL_KEY } from "@/lib/ask/types";
import { toggleTheme } from "@/lib/theme";

const GROUPS = ["Jump to", "Actions", "Links"] as const;

/** Async clipboard API first, then the legacy selection route for older or restricted browsers. */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    if (!ok) throw new Error("copy failed");
  }
}

function matches(item: PaletteItem, query: string) {
  const hay = `${item.label} ${item.group} ${item.keywords ?? ""}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word));
}

export function CommandPalette({ onClose, notify }: { onClose: () => void; notify: (m: string) => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  const results = useMemo(() => paletteItems.filter((i) => matches(i, query)), [query]);
  // Nothing matched: offer to send the text to Ask instead of a dead end.
  const askText = results.length === 0 ? query.trim().slice(0, ASK_LIMITS.maxQuestionChars) : "";
  const activeId = askText
    ? "palette-opt-ask"
    : results[active]
      ? `palette-opt-${results[active].id}`
      : undefined;

  // Focus moves in on open and returns to whatever opened it on close; the page behind stops scrolling.
  useEffect(() => {
    opener.current = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    input.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
  }, []);

  useEffect(() => {
    document.getElementById(activeId ?? "")?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  function run(action: PaletteAction) {
    onClose();
    switch (action.kind) {
      case "nav":
        if (action.href.startsWith("/#") && pathname === "/") window.location.hash = action.href.slice(2);
        else router.push(action.href);
        break;
      case "download": {
        const a = document.createElement("a");
        a.href = action.href;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        a.remove();
        break;
      }
      case "copy":
        copyText(action.text)
          .then(() => notify(action.done))
          // If the browser refuses, show the text itself so it can still be selected and copied by hand.
          .catch(() => notify(action.text));
        break;
      case "theme":
        notify(toggleTheme() === "dark" ? "Dark theme" : "Light theme");
        break;
      case "external":
        window.open(action.href, "_blank", "noopener,noreferrer");
        break;
      case "ask":
        // Park the question, go to Ask, and let it pick the question up and send it.
        try {
          sessionStorage.setItem(ASK_PREFILL_KEY, action.text);
        } catch {
          // Without storage the palette still takes you to Ask; the question is just not pre-filled.
        }
        if (pathname === "/") {
          history.replaceState(null, "", "#ask");
          document.getElementById("ask")?.scrollIntoView({ block: "start" });
          window.dispatchEvent(new Event(ASK_PREFILL_EVENT));
        } else router.push("/#ask");
        break;
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (results.length) setActive((a) => (a + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (results.length) setActive((a) => (a - 1 + results.length) % results.length);
        break;
      case "Home":
        if (e.ctrlKey || e.metaKey) setActive(0);
        break;
      case "Enter": {
        e.preventDefault();
        const item = results[active];
        if (item) run(item.action);
        else if (askText) run({ kind: "ask", text: askText });
        break;
      }
      case "Escape":
        e.preventDefault();
        onClose();
        break;
      case "Tab":
        // The input is the only stop inside the dialog, so Tab can never reach the page behind it.
        e.preventDefault();
        break;
    }
  }

  let flat = -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[14vh] backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="fade-up flex max-h-[min(70vh,520px)] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-tile-border bg-tile text-text shadow-2xl"
        style={{ animationDuration: "140ms" }}
      >
        <div className="flex items-center gap-3 border-b border-tile-border px-4 focus-within:border-text">
          <svg
            aria-hidden="true"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="shrink-0 text-faint"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={input}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-label="Search commands"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Jump to, copy, or open"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 border-0 bg-transparent py-3.5 text-[15px] text-text outline-none placeholder:text-faint"
          />
          <kbd className="rounded-md border border-btn-border px-1.5 py-0.5 font-mono text-[11px] text-muted">
            Esc
          </kbd>
        </div>

        <div
          ref={list}
          id="palette-list"
          role="listbox"
          aria-label="Commands"
          className="overflow-y-auto p-2"
        >
          {askText && (
            <div role="group" aria-labelledby="palette-group-Ask" className="pb-1">
              <div id="palette-group-Ask" className="px-3 pt-2 pb-1 font-mono text-[11px] text-faint">
                No commands match
              </div>
              <div
                id="palette-opt-ask"
                role="option"
                aria-selected="true"
                onClick={() => run({ kind: "ask", text: askText })}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-lg bg-row-active px-3 py-2 text-[14px]"
              >
                <span className="truncate">Ask: {askText}</span>
                <span className="shrink-0 font-mono text-[11px] text-faint">Enter</span>
              </div>
            </div>
          )}
          {GROUPS.map((group) => {
            const items = results.filter((i) => i.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} role="group" aria-labelledby={`palette-group-${group}`} className="pb-1">
                <div
                  id={`palette-group-${group}`}
                  className="px-3 pt-2 pb-1 font-mono text-[11px] text-faint"
                >
                  {group}
                </div>
                {items.map((item) => {
                  flat += 1;
                  const index = flat;
                  const on = index === active;
                  return (
                    <div
                      key={item.id}
                      id={`palette-opt-${item.id}`}
                      role="option"
                      aria-selected={on}
                      onMouseMove={() => active !== index && setActive(index)}
                      onClick={() => run(item.action)}
                      className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 text-[14px] ${on ? "bg-row-active" : ""}`}
                    >
                      <span className="shrink-0">{item.label}</span>
                      {item.hint && (
                        <span className="min-w-0 truncate font-mono text-[11px] text-faint">{item.hint}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
