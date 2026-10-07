import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/ask/answer";
import { checkLimit } from "@/lib/ask/ratelimit";
import { FALLBACK_MESSAGE } from "@/lib/ask/types";
import { validateQuestion } from "@/lib/ask/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fallback = (status: number, headers?: HeadersInit) =>
  NextResponse.json({ fallback: true, message: FALLBACK_MESSAGE }, { status, headers });

// Counts and outcomes only: question text is never logged.
const log = (fields: Record<string, unknown>) => console.info(JSON.stringify({ evt: "ask", ...fields }));

export async function POST(req: Request) {
  const started = Date.now();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    log({ outcome: "bad-json" });
    return fallback(400);
  }
  const q = validateQuestion((body as { question?: unknown } | null)?.question);
  if (!q.ok) {
    log({ outcome: "invalid-question" });
    return fallback(400);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const limit = await checkLimit(ip);
  if (!limit.ok) {
    log({ outcome: "rate-limited" });
    return fallback(429, { "Retry-After": String(limit.retryAfterSec) });
  }

  const result = await answerQuestion(q.value);
  const ms = Date.now() - started;

  if (!result.ok) {
    log({ outcome: "fallback", reason: result.reason, ms, ...result.usage });
    return fallback(result.reason === "no-key" ? 503 : 502);
  }

  log({
    outcome: result.degraded ? "degraded" : result.value.grounded ? "answered" : "declined",
    retried: result.retried,
    ms,
    ...result.usage,
  });
  return NextResponse.json(result.value, { headers: { "Cache-Control": "no-store" } });
}
