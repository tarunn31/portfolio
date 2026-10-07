// Live eval for Ask: sends every test prompt through the same answerQuestion() the API route uses,
// checks the output, prints transcripts, and writes content/ask-eval.json for the site's quiet line.
// Costs a few cents of API usage. Needs ANTHROPIC_API_KEY in .env.local (never printed).
import { writeFileSync } from "node:fs";
import { ASK_MODEL, answerQuestion } from "../lib/ask/answer";
import { evalCases } from "../lib/ask/eval-cases";

try {
  process.loadEnvFile(new URL("../.env.local", import.meta.url).pathname);
} catch {
  // No .env.local: fall through to the key check below.
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set. Add it to .env.local, then run this again.");
  process.exit(1);
}

const results = [];
let cacheRead = 0;
let cacheWrite = 0;

for (const c of evalCases) {
  const out = await answerQuestion(c.prompt);
  let passed = false;
  let note = "";
  let shown = "";
  if (!out.ok) {
    note = `no answer produced (${out.reason})`;
  } else {
    cacheRead += out.usage.cacheRead;
    cacheWrite += out.usage.cacheWrite;
    const failure = c.check(out.value);
    passed = failure === null;
    note = failure ?? "";
    shown = out.value.answer.map((p) => p.text).join(" ");
    if (out.retried) shown = `(${out.degraded ? "retried, then degraded to a safe decline" : "retried once"}) ${shown}`;
    if (out.value.sources.length) shown += `  [sources: ${out.value.sources.map((s) => s.id).join(", ")}]`;
  }
  results.push({ id: c.id, category: c.category, prompt: c.prompt, passed, ...(note ? { note } : {}) });
  console.log(`\n${passed ? "PASS" : "FAIL"}  [${c.category}] ${c.prompt}`);
  if (shown) console.log(`      ${shown}`);
  if (note) console.log(`      -> ${note}`);
}

const passedCount = results.filter((r) => r.passed).length;
const record = { ranAt: new Date().toISOString(), model: ASK_MODEL, results };
writeFileSync(new URL("../content/ask-eval.json", import.meta.url), `${JSON.stringify(record, null, 2)}\n`);

console.log(`\n${passedCount} of ${results.length} passed. Cache tokens: ${cacheWrite} written, ${cacheRead} read.`);
console.log("Wrote content/ask-eval.json");
process.exit(passedCount === results.length ? 0 : 1);
