import { site } from "@/content/site";
import { ask } from "@/content/ask";
import type { AskAnswer } from "@/lib/ask/types";
import { SourceLink } from "./SourceLink";

// Presentational pieces shared by the server-rendered facade and the interactive Ask section,
// so the page looks identical before and after the interactive code loads.

const mono = "font-mono";
const mailLink = "text-text underline decoration-underline underline-offset-[3px]";

export const cardClass =
  "overflow-hidden rounded-2xl border border-tile-border bg-tile focus-within:border-text";
export const inputClass =
  "min-w-0 flex-1 border-0 bg-transparent py-3 text-[15px] text-text outline-offset-8 placeholder:text-faint";
export const enterClass = `${mono} cursor-pointer rounded-md border border-btn-border bg-transparent px-1.5 py-0.5 text-[11px] text-muted disabled:cursor-default disabled:opacity-50`;
export const chipClass = (on: boolean) =>
  `min-h-9 cursor-pointer rounded-full border px-3 text-[13px] text-text ${on ? "border-text bg-row-active" : "border-btn-border bg-transparent"}`;

export function AskHeader() {
  return (
    <div className="flex flex-col">
      <h2 className="m-0 text-[15px] font-medium text-muted">{ask.heading}</h2>
      <span className="text-[14px] text-muted">{ask.sub}</span>
    </div>
  );
}

/** Turns the contact email inside a decline into a mailto link, nothing else. */
export function withEmailLink(text: string) {
  return text.split(site.email).flatMap((chunk, i, all) =>
    i < all.length - 1
      ? [
          chunk,
          <a key={i} href={`mailto:${site.email}`} className={mailLink}>
            {site.email}
          </a>,
        ]
      : [chunk],
  );
}

export function FallbackNote({ message }: { message: string }) {
  const [before] = message.split(site.email);
  return (
    <>
      {before}
      {withEmailLink(site.email)}.
    </>
  );
}

export function AnswerBody({ answer }: { answer: AskAnswer }) {
  const number = answer.sources.reduce<Record<string, number>>((acc, s, i) => ((acc[s.id] = i + 1), acc), {});
  return (
    <>
      <p className="m-0 text-body">
        {answer.answer.map((part, i) => (
          <span key={i}>
            {answer.grounded ? part.text : withEmailLink(part.text)}
            {part.cite.map((id) => {
              const s = answer.sources.find((x) => x.id === id);
              return s ? (
                <sup key={id} className={`${mono} ml-0.5 text-[11px] text-text`}>
                  <SourceLink href={s.href}>
                    [{number[id]}]<span className="sr-only"> {s.label}</span>
                  </SourceLink>
                </sup>
              ) : null;
            })}
          </span>
        ))}
      </p>
      {answer.sources.length > 0 && (
        <ul className={`${mono} m-0 flex list-none flex-wrap items-center gap-2 p-0 text-[12px]`}>
          {!answer.grounded && <li className="text-faint">Closest section</li>}
          {answer.sources.map((s, i) => (
            <li key={s.id}>
              <SourceLink
                href={s.href}
                className="block rounded-md border border-tile-border px-[9px] py-1 text-muted"
              >
                {answer.grounded ? `[${i + 1}] ` : ""}
                {s.label}
              </SourceLink>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
