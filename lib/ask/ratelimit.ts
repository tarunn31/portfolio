import { createHash } from "node:crypto";
import { ASK_LIMITS } from "./types";

export type LimitResult = { ok: true } | { ok: false; retryAfterSec: number };

const MINUTE = 60_000;
const DAY = 86_400_000;

/** Best-effort limiter for a single server instance. Used when Upstash is not configured. */
export function createMemoryLimiter(now: () => number = Date.now) {
  const hits = new Map<string, number[]>();
  return (key: string): LimitResult => {
    const t = now();
    const recent = (hits.get(key) ?? []).filter((x) => t - x < DAY);
    const lastMinute = recent.filter((x) => t - x < MINUTE);
    if (lastMinute.length >= ASK_LIMITS.perMinute) {
      return { ok: false, retryAfterSec: Math.ceil((MINUTE - (t - lastMinute[0]!)) / 1000) };
    }
    if (recent.length >= ASK_LIMITS.perDay) {
      return { ok: false, retryAfterSec: Math.ceil((DAY - (t - recent[0]!)) / 1000) };
    }
    recent.push(t);
    hits.set(key, recent);
    if (hits.size > 5000) hits.delete(hits.keys().next().value as string); // oldest key
    return { ok: true };
  };
}

/** The two windows the shared (Upstash) limiter checks. `reset` is a Unix time in milliseconds. */
export type RedisWindows = {
  minute: { limit(key: string): Promise<{ success: boolean; reset: number }> };
  day: { limit(key: string): Promise<{ success: boolean; reset: number }> };
};

/**
 * Shared limiter on top of Redis windows, with the in-memory limiter as the fallback: if Redis is not
 * configured or errors, the visitor is limited per instance instead of the site breaking.
 */
export function createLimiter(deps: {
  windows: () => Promise<RedisWindows | null>;
  memory: (key: string) => LimitResult;
  now?: () => number;
}) {
  const now = deps.now ?? Date.now;
  const wait = (reset: number): LimitResult => ({
    ok: false,
    retryAfterSec: Math.max(1, Math.ceil((reset - now()) / 1000)),
  });
  return async (key: string): Promise<LimitResult> => {
    try {
      const w = await deps.windows();
      if (w) {
        const m = await w.minute.limit(key);
        if (!m.success) return wait(m.reset);
        const d = await w.day.limit(key);
        if (!d.success) return wait(d.reset);
        return { ok: true };
      }
    } catch {
      // Redis unreachable: fall through to the in-memory limiter rather than breaking the site.
    }
    return deps.memory(key);
  };
}

/** Upstash's own variable names, or the KV_* names that Vercel's Redis integrations create. */
export function redisCredentials(env: Record<string, string | undefined> = process.env) {
  const url = env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

let upstash: RedisWindows | null | undefined;
async function getUpstash(): Promise<RedisWindows | null> {
  if (upstash !== undefined) return upstash;
  const creds = redisCredentials();
  if (!creds) return (upstash = null);
  const [{ Ratelimit }, { Redis }] = await Promise.all([
    import("@upstash/ratelimit"),
    import("@upstash/redis"),
  ]);
  const redis = new Redis(creds);
  upstash = {
    minute: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(ASK_LIMITS.perMinute, "1 m"),
      prefix: "ask:m",
    }),
    day: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(ASK_LIMITS.perDay, "1 d"),
      prefix: "ask:d",
    }),
  };
  return upstash;
}

/** The raw IP is never stored or logged; it is hashed before it is used as a key. */
export const clientKey = (ip: string) => createHash("sha256").update(ip).digest("hex").slice(0, 16);

const limiter = createLimiter({ windows: getUpstash, memory: createMemoryLimiter() });

export const checkLimit = (ip: string) => limiter(clientKey(ip));
