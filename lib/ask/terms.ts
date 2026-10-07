// Technology vocabulary, taken from the site's own stack lists and the resume skills. Used to catch an
// answer that attaches a tool to something no cited source ties it to. Server and scripts only.
import { caseStudies } from "@/content/case-studies";
import { projects } from "@/content/projects";
import { resumeSections } from "@/content/resume";

// Generic words that appear in stack lists but are not tools on their own.
const SKIP = new Set(["auth", "storage", "plain", "data", "models"]);

let cached: { term: string; re: RegExp }[] | null = null;

function collect(): string[] {
  const raw: string[] = [];
  for (const p of projects) raw.push(...p.stack);
  for (const c of caseStudies) {
    const stack = c.meta.find((m) => m.label === "Stack");
    if (stack) raw.push(...stack.value.split(","));
  }
  const skills = resumeSections.find((s) => s.id === "resume-skills");
  if (skills) {
    for (const line of skills.text.split("\n").slice(1)) {
      raw.push(...line.slice(line.indexOf(":") + 1).replace(/[()]/g, ",").split(","));
    }
  }
  return raw.map((t) => t.trim()).filter((t) => t.length >= 3 && !SKIP.has(t.toLowerCase()));
}

/** Longest terms first, so "React Native" is consumed before a bare "React" can match inside it. */
function vocabulary() {
  if (!cached) {
    const unique = [...new Map(collect().map((t) => [t.toLowerCase(), t])).values()];
    unique.sort((a, b) => b.length - a.length);
    cached = unique.map((term) => ({
      term,
      re: new RegExp(`(?<![\\w-])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w-])`, "gi"),
    }));
  }
  return cached;
}

/** The set of known tools a piece of text mentions. */
export function termsIn(text: string): Set<string> {
  const found = new Set<string>();
  let rest = text;
  for (const { term, re } of vocabulary()) {
    re.lastIndex = 0;
    if (re.test(rest)) {
      found.add(term.toLowerCase());
      re.lastIndex = 0;
      rest = rest.replace(re, " ");
    }
  }
  return found;
}
