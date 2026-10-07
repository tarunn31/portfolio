// Client-safe types and constants for Ask about my work.
import { site } from "@/content/site";

export type AskPart = { text: string; cite: string[] };
export type AskSourceRef = { id: string; label: string; href: string };
export type AskAnswer = { grounded: boolean; answer: AskPart[]; sources: AskSourceRef[] };

export const ASK_LIMITS = {
  maxQuestionChars: 300,
  perMinute: 5,
  perDay: 30,
  maxTokens: 400,
  /** Soft target in the prompt is about 120 words; this is the hard ceiling the validator enforces. */
  maxAnswerWords: 180,
} as const;

export const FALLBACK_MESSAGE = `I can't answer right now. Email Tarun at ${site.email}.`;

/** Hand-off from the command palette: the question is parked here, then Ask picks it up and sends it. */
export const ASK_PREFILL_KEY = "ask-prefill";
export const ASK_PREFILL_EVENT = "ask-prefill";
