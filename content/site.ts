export const site = {
  name: "Sai Tarun Reddy Lankireddy",
  shortName: "Sai Tarun",
  role: "AI Software Engineer",
  description:
    "I build Python backends and LLM systems. Right now I'm launching Nita, an AI wellness app I built on my own. Before that, I built RAG and agent workflows used by 500+ people at Molina Healthcare.",
  email: "saitarunreddylankireddy@gmail.com",
  github: "https://github.com/tarunn31",
  linkedin: "https://www.linkedin.com/in/sai-tarun-reddy-lankireddy",
  nita: "https://nita.care",
  copilotDemo: "https://ai-data-copilot.streamlit.app",
  resumePath: "/resume.pdf",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tarunlankireddy.com",
  /** Public repository URL. Unset until the repo is public, and "view source" links only appear once it is. */
  repo: process.env.NEXT_PUBLIC_REPO_URL?.replace(/\/$/, "") || undefined,
} as const;

export const intro = {
  heading: "Sai Tarun Reddy Lankireddy",
  role: "AI Software Engineer",
  paragraphs: [
    site.description,
    "I care about AI you can check: answers grounded in real data, and evaluations that gate every release.",
  ],
  status: "Open to backend and AI engineering roles",
} as const;

export const outsideWork = "Outside work: cricket, logic puzzles, and keeping up with new AI models.";

export const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Craft", href: "#craft" },
  { label: "Ask", href: "#ask" },
] as const;

export const footer = {
  copyright: "© 2026 Sai Tarun Reddy Lankireddy",
  hint: "Press ⌘K to jump anywhere",
} as const;
