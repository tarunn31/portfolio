import { site } from "@/content/site";
import { termsIn } from "./terms";
import { ASK_LIMITS, type AskAnswer, type AskSourceRef } from "./types";

type Result = { ok: true; value: AskAnswer } | { ok: false; reason: string; detail?: string };

// A phone-shaped number (3-3-4 digits with the usual separators), or any run of 10+ digits that only
// spaces, dots, dashes or brackets break up. Generic on purpose: no real number lives in this repo.
const PHONE = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|(?:\d[\s.()-]?){10,}/;

export function looksLikePhone(text: string): boolean {
  return PHONE.test(text);
}

/** Site rule: no em dashes in visible copy. */
const cleanText = (t: string) =>
  t
    .replace(/\s*[\u2014\u2013]\s*/g, ", ")
    // Visitors never see the pack, so its name must not appear in an answer.
    .replace(/\b([Tt])he knowledge pack\b/g, (_, c: string) => (c === "T" ? "This site" : "this site"))
    .trim();

/**
 * Checks the model output against the pack. The model never supplies links: sources are rebuilt here
 * from the ids it cited, so a hallucinated or injected URL can't reach the page.
 */
// Words that rank or praise. A grounded answer may only use one if a source it cites uses it too.
const SUPERLATIVE =
  /\b(strongest|best|greatest|largest|finest|leading|most impressive|world-class|outstanding|exceptional|unmatched|unrivall?ed)\b/gi;

export function validateAnswer(
  raw: unknown,
  index: Map<string, AskSourceRef>,
  texts: Map<string, string>,
): Result {
  if (!raw || typeof raw !== "object") return { ok: false, reason: "not-object" };
  const r = raw as { grounded?: unknown; answer?: unknown; closest?: unknown };
  if (typeof r.grounded !== "boolean") return { ok: false, reason: "grounded-type" };
  if (!Array.isArray(r.answer) || r.answer.length < 1 || r.answer.length > 6) {
    return { ok: false, reason: "answer-shape" };
  }

  const parts: { text: string; cite: string[] }[] = [];
  const order: string[] = [];
  let words = 0;

  for (const p of r.answer as unknown[]) {
    if (!p || typeof p !== "object") return { ok: false, reason: "part-shape" };
    const { text, cite } = p as { text?: unknown; cite?: unknown };
    if (typeof text !== "string" || !text.trim() || text.length > 500) return { ok: false, reason: "part-text" };
    if (!Array.isArray(cite) || cite.some((c) => typeof c !== "string") || cite.length > 4) {
      return { ok: false, reason: "part-cite" };
    }
    const clean = cleanText(text);
    if (looksLikePhone(clean)) return { ok: false, reason: "phone" };
    words += clean.split(/\s+/).length;

    if (r.grounded) {
      if (cite.length === 0) return { ok: false, reason: "uncited-claim" };
      for (const id of cite as string[]) {
        if (!index.has(id)) return { ok: false, reason: "unknown-source" };
        if (!order.includes(id)) order.push(id);
      }
      const citedText = (cite as string[]).map((id) => texts.get(id)?.toLowerCase() ?? "").join(" ");
      for (const word of clean.match(SUPERLATIVE) ?? []) {
        if (!citedText.includes(word.toLowerCase())) {
          return { ok: false, reason: "unsupported-superlative", detail: word.toLowerCase() };
        }
      }
      // A tool named in the answer must be named by a source this part cites, even in a negation.
      const supported = termsIn((cite as string[]).map((id) => texts.get(id) ?? "").join("\n"));
      for (const used of termsIn(clean)) {
        if (!supported.has(used)) return { ok: false, reason: "unsupported-term", detail: used };
      }
      parts.push({ text: clean, cite: [...new Set(cite as string[])] });
    } else {
      parts.push({ text: clean, cite: [] });
    }
  }

  // A decline always points the visitor to Tarun. Enforced here so it never depends on the model remembering.
  if (!r.grounded && !parts.some((p) => p.text.includes(site.email))) {
    parts.push({ text: `Email Tarun at ${site.email}.`, cite: [] });
  }

  if (words > ASK_LIMITS.maxAnswerWords) return { ok: false, reason: "too-long" };

  // Every decline is paired with the closest real section. The model proposes the id; an unknown or
  // missing one falls back to Contact, so a decline always carries exactly one link.
  if (!r.grounded) {
    const wanted = typeof r.closest === "string" && index.has(r.closest) ? r.closest : "contact";
    const closest = index.get(wanted);
    if (closest) order.push(closest.id);
  }

  return {
    ok: true,
    value: { grounded: r.grounded, answer: parts, sources: order.map((id) => index.get(id)!) },
  };
}

export function validateQuestion(q: unknown): { ok: true; value: string } | { ok: false } {
  if (typeof q !== "string") return { ok: false };
  const value = q.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (!value || value.length > ASK_LIMITS.maxQuestionChars) return { ok: false };
  return { ok: true, value };
}
