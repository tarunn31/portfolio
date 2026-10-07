import type { PipelineNode } from "./pipeline";

export type ProjectLink = { label: string; href: string };

export type ProjectMedia =
  | { kind: "video"; src: string; poster: string; label: string }
  | { kind: "diagram"; label: string }
  | null;

export type Project = {
  id: string;
  name: string;
  line: string;
  meta: string;
  detail: string;
  stack: string[];
  links: ProjectLink[];
  media: ProjectMedia;
};

export type { PipelineNode };

export const projects: Project[] = [
  {
    id: "nita",
    name: "Nita",
    line: "AI wellness companion. The math finds the pattern, the AI explains it.",
    meta: "iOS, Android",
    detail:
      "Solo-built from first commit to App Store approval. A pure-Python stats engine computes every number, and Claude is only allowed to explain them. Launching October 2026.",
    stack: ["React Native", "FastAPI", "Supabase", "pgvector", "Claude"],
    links: [
      { label: "Read the case study", href: "/work/nita" },
      { label: "nita.care", href: "https://nita.care" },
    ],
    media: {
      kind: "video",
      src: "/media/nita-preview.mp4",
      poster: "/media/nita-poster-900.jpg",
      label: "Nita app preview",
    },
  },
  {
    id: "ai-data-copilot",
    name: "AI Data Copilot",
    line: "Ask a spreadsheet anything. The code fixes itself when it breaks.",
    meta: "Live",
    detail:
      "Upload a CSV or Excel file and ask in plain English. GPT-4.1 writes pandas code that runs in a sandbox, and failed code goes back to the model for up to 3 repairs.",
    stack: ["Python", "GPT-4.1", "Streamlit", "Pandas"],
    links: [
      { label: "Read the case study", href: "/work/ai-data-copilot" },
      { label: "Live demo", href: "https://ai-data-copilot.streamlit.app" },
      { label: "GitHub", href: "https://github.com/tarunn31/ai-data-copilot" },
    ],
    media: {
      kind: "video",
      src: "/media/copilot-preview.mp4",
      poster: "/media/copilot-poster-800.jpg",
      label: "AI Data Copilot demo recording",
    },
  },
  {
    id: "clinical-rag",
    name: "Clinical RAG",
    line: "50K+ documents at Molina Healthcare, every release gated by evals.",
    meta: "Molina",
    detail:
      "Retrieval and LangGraph agents for authorization review, used by 500+ people and checked against 200+ test cases before each release. Lookup time down 40%, manual review down 35%.",
    stack: ["FastAPI", "LangGraph", "Pinecone", "pgvector", "RAGAS"],
    links: [{ label: "Read the case study", href: "/work/clinical-rag" }],
    media: { kind: "diagram", label: "Clinical RAG pipeline" },
  },
  {
    id: "sign-language-translator",
    name: "Sign Language Translator",
    line: "Teach it a new sign in seconds, then it translates live. Published research.",
    meta: "Paper, 2025",
    detail:
      "A five-person team project. Record about 30 webcam samples of a sign and a KNN classifier over deep image features learns it on the spot, no retraining run needed, then recognized words are spoken aloud. I built most of the codebase and led testing. Published in the Grenze International Journal of Engineering and Technology, indexed in Scopus.",
    stack: ["JavaScript", "deeplearn.js", "KNN", "Web Speech API", "WebRTC"],
    links: [
      {
        label: "Live demo",
        href: "https://dasarirasmitha.github.io/Dynamic-sign-language-translator/",
      },
      {
        label: "Read the paper",
        href: "https://www.scopus.com/pages/publications/105034072670",
      },
    ],
    // No video yet (spec section 5): the row simply skips media.
    media: null,
  },
];
