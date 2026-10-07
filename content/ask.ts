import type { AskAnswer } from "@/lib/ask/types";

export const ask = {
  heading: "Ask about my work",
  sub: "An assistant that only answers from this site, and cites where each answer comes from.",
  inputLabel: "Ask a question about Tarun's work",
} as const;

// The three suggested questions and their answers, copied from the approved home design. They render instantly with
// no API call. Citations point at the exact section each claim comes from; `npm run test:ask` checks
// every id, label and link against the real sources.
export const suggestions: { q: string; answer: AskAnswer }[] = [
  {
    q: "What's Tarun's strongest AI project?",
    answer: {
      grounded: true,
      answer: [
        {
          text: "Nita is his strongest end-to-end product. He built it alone, and its stats engine computes every number so the AI never invents one.",
          cite: ["highlights", "work-nita"],
        },
        {
          text: " For scale, his RAG platform at Molina is his largest-scale production work, serving 500+ people over 50K+ documents.",
          cite: ["highlights", "work-clinical-rag"],
        },
      ],
      sources: [
        { id: "highlights", label: "Highlights", href: "/#highlights" },
        { id: "work-nita", label: "Nita", href: "/#work-nita" },
        { id: "work-clinical-rag", label: "Clinical RAG", href: "/#work-clinical-rag" },
      ],
    },
  },
  {
    q: "What has he built with RAG?",
    answer: {
      grounded: true,
      answer: [
        {
          text: "At Molina Healthcare, retrieval over 50K+ clinical and policy documents with Pinecone and pgvector, gated on 200+ eval cases. Measured hallucinations dropped 30%.",
          cite: ["work-clinical-rag", "clinical-rag-impact"],
        },
      ],
      sources: [
        { id: "work-clinical-rag", label: "Clinical RAG", href: "/#work-clinical-rag" },
        { id: "clinical-rag-impact", label: "Clinical RAG: Impact", href: "/work/clinical-rag#impact" },
      ],
    },
  },
  {
    q: "Which project shows backend depth?",
    answer: {
      grounded: true,
      answer: [
        {
          text: "Nita's backend: FastAPI on Railway, Postgres with pgvector, and consent checks on every AI endpoint.",
          cite: ["resume-experience", "nita-privacy-by-design"],
        },
        {
          text: " Earlier, Python services and REST APIs for 5+ enterprise apps at NTT DATA.",
          cite: ["resume-experience"],
        },
      ],
      sources: [
        { id: "resume-experience", label: "Resume: Experience", href: "/resume.pdf" },
        { id: "nita-privacy-by-design", label: "Nita: Privacy by design", href: "/work/nita#privacy-by-design" },
      ],
    },
  },
];
