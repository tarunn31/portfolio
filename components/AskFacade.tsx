import { ask, suggestions } from "@/content/ask";
import { AnswerBody, AskHeader, cardClass, chipClass, enterClass, inputClass } from "./AskAnswer";

/**
 * Server-rendered Ask in its opening state: first suggested question, its prewritten answer, and the chips.
 * It has no client JavaScript. AskLazy swaps in the interactive version when it scrolls near or is used.
 */
export function AskFacade() {
  const first = suggestions[0]!;
  return (
    <>
      <AskHeader />
      <div className={cardClass}>
        <div className="flex min-h-[52px] items-center gap-3 border-b border-tile-border px-4">
          <input
            type="text"
            readOnly
            defaultValue={first.q}
            aria-label={ask.inputLabel}
            autoComplete="off"
            className={inputClass}
          />
          <span aria-hidden="true" className={enterClass}>
            Enter
          </span>
        </div>
        <div className="flex flex-col gap-3.5 p-4">
          <AnswerBody answer={first.answer} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={s.q}
            type="button"
            data-ask-chip={i}
            aria-pressed={i === 0}
            className={chipClass(i === 0)}
          >
            {s.q}
          </button>
        ))}
      </div>
    </>
  );
}
