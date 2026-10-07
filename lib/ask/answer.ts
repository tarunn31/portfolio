import Anthropic from "@anthropic-ai/sdk";
import { getKnowledge } from "./pack";
import { RESPOND_TOOL, RULES } from "./prompt";
import { ASK_LIMITS, type AskAnswer } from "./types";
import { validateAnswer } from "./validate";

export const ASK_MODEL = "claude-haiku-4-5-20251001";

export type MessagesClient = {
  messages: { create(params: Anthropic.MessageCreateParamsNonStreaming): Promise<Anthropic.Message> };
};

export type Usage = { input: number; output: number; cacheRead: number; cacheWrite: number };
export type AskOutcome =
  | { ok: true; value: AskAnswer; usage: Usage; retried: boolean; degraded?: boolean }
  | { ok: false; reason: string; usage?: Usage; retried?: boolean };

let client: MessagesClient | null = null;
function defaultClient(): MessagesClient | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic({ maxRetries: 1, timeout: 20_000 });
  return client;
}

const add = (a: Usage, b: Usage): Usage => ({
  input: a.input + b.input,
  output: a.output + b.output,
  cacheRead: a.cacheRead + b.cacheRead,
  cacheWrite: a.cacheWrite + b.cacheWrite,
});

/**
 * One grounded answer. The knowledge pack is the cached system block; only the question varies,
 * so everything before it stays an identical prefix across requests. If the first answer claims
 * something its sources don't support, the model gets one corrective retry before we give up.
 */
export async function answerQuestion(
  question: string,
  opts: { client?: MessagesClient } = {},
): Promise<AskOutcome> {
  const api = opts.client ?? defaultClient();
  if (!api) return { ok: false, reason: "no-key" };

  const { sources, pack } = getKnowledge();
  const index = new Map(sources.map((s) => [s.id, { id: s.id, label: s.label, href: s.href }]));
  const texts = new Map(sources.map((s) => [s.id, s.text]));
  // Angle brackets could close the <question> wrapper, so they never reach the model.
  const safeQuestion = question.replace(/[<>]/g, "");

  const attempt = async (note?: string): Promise<AskOutcome & { detail?: string }> => {
    let res: Anthropic.Message;
    try {
      res = await api.messages.create({
        model: ASK_MODEL,
        max_tokens: ASK_LIMITS.maxTokens,
        temperature: 0,
        system: [
          { type: "text", text: RULES },
          {
            type: "text",
            text: `<knowledge_pack>\n${pack}\n</knowledge_pack>`,
            cache_control: { type: "ephemeral" },
          },
        ],
        tools: [RESPOND_TOOL],
        tool_choice: { type: "tool", name: "respond" },
        messages: [
          { role: "user", content: `<question>${safeQuestion}</question>${note ? `\n\n${note}` : ""}` },
        ],
      });
    } catch (e) {
      return { ok: false, reason: e instanceof Anthropic.APIError ? `api-${e.status}` : "api-error" };
    }

    const usage: Usage = {
      input: res.usage.input_tokens,
      output: res.usage.output_tokens,
      cacheRead: res.usage.cache_read_input_tokens ?? 0,
      cacheWrite: res.usage.cache_creation_input_tokens ?? 0,
    };

    if (res.stop_reason !== "tool_use") return { ok: false, reason: `stop-${res.stop_reason}`, usage };
    const block = res.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (!block) return { ok: false, reason: "no-tool-use", usage };

    const checked = validateAnswer(block.input, index, texts);
    return checked.ok
      ? { ok: true, value: checked.value, usage, retried: false }
      : { ok: false, reason: `invalid-${checked.reason}`, detail: checked.detail, usage };
  };

  const first = await attempt();
  if (first.ok || !first.reason.startsWith("invalid-unsupported-") || !first.detail) return first;

  // Unsupported claim: say exactly what was wrong and ask again, once. Only our own vocabulary
  // (a tool name or a superlative) is echoed back, never visitor text.
  const second = await attempt(
    `Your previous answer was rejected because it mentioned "${first.detail}" without support from the sources it cited. Answer again using only what the cited sources state. If they do not cover it, say the site does not list it.`,
  );
  const usage = (
    first.usage && second.usage ? add(first.usage, second.usage) : (second.usage ?? first.usage)
  )!;
  if (second.ok) return { ok: true, value: second.value, usage, retried: true };

  // Still unsupported after the retry: give an honest, specific "can't say" with a link to read,
  // instead of a generic error. Which section to point at follows from what went wrong.
  if (second.reason.startsWith("invalid-unsupported-")) {
    const checked = validateAnswer(
      {
        grounded: false,
        closest: second.reason.endsWith("superlative") ? "highlights" : "resume-skills",
        answer: [{ text: "I can't give a reliable answer to that from the content on this site.", cite: [] }],
      },
      index,
      texts,
    );
    if (checked.ok) return { ok: true, value: checked.value, usage, retried: true, degraded: true };
  }
  return { ok: false, reason: second.reason, usage, retried: true };
}
