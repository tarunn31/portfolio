import askEval from "@/content/ask-eval.json";
import lighthouse from "@/content/lighthouse.json";
import { site } from "@/content/site";
import { formatDate } from "@/lib/format";

type Eval = { ranAt: string | null; results: { passed: boolean }[] };
type Lighthouse = {
  ranAt: string | null;
  lowest?: { performance: number; accessibility: number; bestPractices: number; seo: number };
};

/**
 * "How this site was built". Everything measured is read from the files the scripts write
 * (`npm run eval:ask`, `npm run audit:lighthouse`), so a number or date can never be typed in by hand,
 * and a line simply does not appear until its measurement exists.
 */
export function Colophon() {
  const ev = askEval as Eval;
  const lh = lighthouse as Lighthouse;
  const passed = ev.results.filter((r) => r.passed).length;

  return (
    <section aria-labelledby="colophon" className="flex flex-col gap-2 pt-2">
      <h2 id="colophon" className="m-0 font-mono text-[12px] font-normal text-faint">
        How this site was built
      </h2>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px] leading-[1.6] text-muted">
        <li>Next.js 15, React 19, TypeScript and Tailwind CSS v4, set in Geist.</li>
        <li>
          Ask runs on Claude Haiku 4.5. It answers only from this site&apos;s own content, cites the section
          behind each claim, checks every answer before showing it, and rate limits by IP.
        </li>
        {ev.ranAt && ev.results.length > 0 && (
          <li>
            Tested against {ev.results.length} prompts covering off-topic questions, prompt injection and
            invented facts: {passed === ev.results.length ? "all passed" : `${passed} passed`}, last run{" "}
            {formatDate(ev.ranAt)}.
          </li>
        )}
        {lh.ranAt && lh.lowest && (
          <li>
            Lighthouse on mobile, lowest across the home page and case studies: performance{" "}
            {lh.lowest.performance}, accessibility {lh.lowest.accessibility}, best practices{" "}
            {lh.lowest.bestPractices}, SEO {lh.lowest.seo}, measured {formatDate(lh.ranAt)}.
          </li>
        )}
        {site.repo && (
          <li>
            <a href={site.repo} className="text-text underline decoration-underline underline-offset-[3px]">
              Source code on GitHub
            </a>
          </li>
        )}
      </ul>
    </section>
  );
}
