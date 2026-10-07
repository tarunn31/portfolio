import evalData from "@/content/ask-eval.json";
import { formatDate } from "@/lib/format";

type Result = { id: string; category: string; prompt: string; passed: boolean; note?: string };

/**
 * The quiet "tested against N prompts" line. It only renders real results from `npm run eval:ask`,
 * so the count and the date can't drift from what was actually run.
 */
export function EvalPanel() {
  const { ranAt, results } = evalData as { ranAt: string | null; results: Result[] };
  if (!ranAt || results.length === 0) return null;

  const passed = results.filter((r) => r.passed).length;
  const date = formatDate(ranAt);
  const summary =
    passed === results.length
      ? `Tested against ${results.length} tricky prompts, all passed, last run ${date}`
      : `Tested against ${results.length} tricky prompts, ${passed} passed, last run ${date}`;

  return (
    <details className="group text-[13px] text-muted">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-md py-1 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="inline-block text-[10px] transition-transform group-open:rotate-90"
        >
          ▶
        </span>
        {summary}
      </summary>
      <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
        {results.map((r) => (
          <li key={r.id} className="grid grid-cols-[92px_minmax(0,1fr)_auto] items-baseline gap-x-3">
            <span className="font-mono text-[11px] text-faint">{r.category}</span>
            <span className="text-body">{r.prompt}</span>
            <span className={`font-mono text-[11px] ${r.passed ? "text-green-ink" : "text-red"}`}>
              {r.passed ? "pass" : "fail"}
            </span>
          </li>
        ))}
      </ul>
      <p className="m-0 mt-2 font-mono text-[11px] text-faint">Re-run with npm run eval:ask</p>
    </details>
  );
}
