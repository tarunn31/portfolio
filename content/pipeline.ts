// Clinical RAG pipeline, copied from the approved Clinical RAG design. Shared by the home row and the case study.
export type PipelineNode = {
  label: string;
  tone: "plain" | "emphasis" | "ok" | "err" | "final";
};

/** A flow step is a single chip, or a small stack of chips sharing one slot. */
export type FlowItem = PipelineNode | { stack: PipelineNode[] };

export const ragPipeline: PipelineNode[] = [
  { label: "Documents", tone: "plain" },
  { label: "Chunk and tag", tone: "plain" },
  { label: "Embed", tone: "plain" },
  { label: "Pinecone, pgvector", tone: "plain" },
  { label: "Retrieve", tone: "emphasis" },
  { label: "OpenAI, Claude", tone: "plain" },
  { label: "Grounding check", tone: "ok" },
  { label: "Answer with sources", tone: "final" },
];
