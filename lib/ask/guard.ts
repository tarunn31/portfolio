// Request checks for /api/ask that run before anything costs money: who may call it, in what format, how big.

export const MAX_BODY_BYTES = 4096;

export type Guard = { ok: true } | { ok: false; status: number; reason: string };

/**
 * - JSON only. A cross-site page cannot send application/json without a CORS preflight, which this API never
 *   approves, so this alone stops other websites from making visitors' browsers call it.
 * - Same origin only, when the browser says where the request came from (Origin, Sec-Fetch-Site). Plain
 *   scripts and curl send neither and are still limited per IP.
 * - Small bodies: a question is at most 300 characters.
 */
export function checkRequest(h: Headers): Guard {
  if (!(h.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return { ok: false, status: 415, reason: "content-type" };
  }
  if (h.get("sec-fetch-site") === "cross-site") return { ok: false, status: 403, reason: "cross-site" };
  const origin = h.get("origin");
  if (origin) {
    let host = "";
    try {
      host = new URL(origin).host;
    } catch {
      return { ok: false, status: 403, reason: "bad-origin" };
    }
    if (host !== h.get("host")) return { ok: false, status: 403, reason: "origin" };
  }
  const length = Number(h.get("content-length") ?? 0);
  if (Number.isFinite(length) && length > MAX_BODY_BYTES)
    return { ok: false, status: 413, reason: "too-large" };
  return { ok: true };
}
