import { buildSources, type Source } from "./sources";

/** XML-ish pack: one tagged block per source, ids exactly as the model must cite them. */
export function renderPack(sources: Source[]): string {
  return sources
    .map((s) => `<source id="${s.id}" label="${s.label}">\n${s.text}\n</source>`)
    .join("\n\n");
}

let cached: { sources: Source[]; pack: string } | null = null;

/** Built once per server instance and byte-stable, so the prompt cache prefix never changes. */
export function getKnowledge() {
  if (!cached) {
    const sources = buildSources();
    cached = { sources, pack: renderPack(sources) };
  }
  return cached;
}
