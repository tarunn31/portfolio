import { ragPipeline } from "../pipeline";
import type { CaseStudy } from "./types";

export const clinicalRag: CaseStudy = {
  slug: "clinical-rag",
  shortName: "Clinical RAG",
  title: "Clinical RAG platform",
  subtitle:
    "Grounded answers over 50,000+ clinical and policy documents for healthcare authorization teams, with every release gated by evaluations.",
  meta: [
    { label: "Role", value: "AI Software Engineer, contract" },
    { label: "Company", value: "Molina Healthcare" },
    { label: "Timeline", value: "Jun 2025 to Mar 2026" },
    { label: "Stack", value: "FastAPI, LangGraph, Pinecone, pgvector" },
  ],
  nextSlug: "nita",
  blocks: [
    {
      type: "prose",
      title: "The problem",
      text: "Authorization reviewers had to dig through thousands of clinical and policy documents to find the criteria behind each request. It was slow, and in healthcare a confident wrong answer is worse than no answer at all.",
    },
    {
      type: "idea",
      statement: "Treat retrieval, grounding and evaluation as the product, not the LLM call.",
      perRow: 4,
      flow: ragPipeline,
      notes: [
        "Chunks follow document structure, not fixed lengths.",
        "Metadata like document type and effective date narrows every search.",
        "Answers must be supported by the retrieved evidence.",
      ],
    },
    {
      type: "rows",
      title: "What I built",
      labelWidth: 160,
      rows: [
        {
          label: "Ingestion",
          text: "Parsing, semantic chunking and metadata enrichment for 50K+ clinical and policy documents, then embeddings into Pinecone and pgvector.",
        },
        {
          label: "Services",
          text: "FastAPI microservices for document processing, retrieval and LLM inference, reused across 4 authorization and policy workflows by 500+ people.",
        },
        {
          label: "Agents",
          text: "LangGraph workflows that plan, call retrieval tools, analyze evidence and summarize authorization packets, built with clinical SMEs and product managers.",
        },
        {
          label: "Generation",
          text: "OpenAI and Claude behind one interface, with function calling and structured outputs instead of free-form text.",
        },
        {
          label: "Grounding",
          text: "Validation logic that checks generated answers against the retrieved evidence.",
        },
      ],
    },
    {
      type: "cards",
      title: "Safety for HIPAA workflows",
      items: [
        {
          title: "PHI redaction",
          text: "Protected health information is redacted before it reaches downstream processing and logs.",
        },
        { title: "Token-based auth", text: "Every service call is authenticated." },
        { title: "Audit logging", text: "Who did what, when, in which workflow." },
        {
          title: "Release gates",
          text: "RAGAS and LangSmith evaluations over 200+ curated cases had to pass before every release.",
        },
      ],
    },
    {
      type: "stats",
      title: "Impact",
      intro: "Each number compares the new system with the previous manual workflow on the same set of tasks.",
      items: [
        {
          value: "40%",
          label: "faster document lookup",
          text: "Median time to find the evidence needed for an authorization question.",
        },
        { value: "35%", label: "less manual review", text: "Reviewer time per authorization packet." },
        {
          value: "30%",
          label: "lower hallucination rate",
          text: "Relative drop in answer claims not supported by retrieved evidence, across 200+ curated cases.",
        },
        {
          value: "Weekly",
          label: "releases",
          text: "Down from every two weeks, with Docker and GitHub Actions CI/CD.",
        },
      ],
    },
    {
      type: "callout",
      title: "The hardest part",
      heading: "Retrieval quality, not the model",
      text: "If the wrong policy section came back, even a strong model produced a bad answer. Most of the work went into chunking, metadata, retrieval filters and the evaluation set, so every change could be measured instead of guessed.",
    },
  ],
};
