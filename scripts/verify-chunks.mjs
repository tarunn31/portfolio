// Every Retrieval chunk must be a verbatim sentence of the section its link points at.
import { chunks } from "../content/chunks";
import { buildSources } from "../lib/ask/sources";

const byHref = new Map(buildSources().map((s) => [s.href, s]));
let bad = 0;
const fail = (m) => {
  console.error(m);
  bad++;
};

if (chunks.length !== 32) fail(`expected 32 chunks, found ${chunks.length}`);
if (new Set(chunks.map((c) => c.text)).size !== chunks.length) fail("duplicate chunks");
for (const c of chunks) {
  const src = byHref.get(c.href);
  if (!src) fail(`link points at no section: ${c.href}`);
  else if (!src.text.includes(c.text)) fail(`not in ${c.href}: ${c.text}`);
}
if (bad) process.exit(1);
console.log(`ok: ${chunks.length} chunks, each verbatim from the section it links to`);
