// The 32 "chunks" the Retrieval tile searches. Each is a verbatim sentence from this site's own copy,
// linked to the section it comes from. `npm run verify:chunks` fails if a sentence drifts from that
// section's text or a link points at a section that does not exist.
export type Chunk = { text: string; href: string };

const N = "/work/nita";
const C = "/work/ai-data-copilot";
const R = "/work/clinical-rag";

export const chunks: Chunk[] = [
  { text: "I build Python backends and LLM systems.", href: "/#top" },
  { text: "Right now I'm launching Nita, an AI wellness app I built on my own.", href: "/#top" },
  { text: "Before that, I built RAG and agent workflows used by 500+ people at Molina Healthcare.", href: "/#top" },
  { text: "I care about AI you can check: answers grounded in real data, and evaluations that gate every release.", href: "/#top" },
  { text: "Solo-built from first commit to App Store approval.", href: "/#work-nita" },
  { text: "A pure-Python stats engine computes every number, and Claude is only allowed to explain them.", href: "/#work-nita" },
  { text: "Upload a CSV or Excel file and ask in plain English.", href: "/#work-ai-data-copilot" },
  { text: "GPT-4.1 writes pandas code that runs in a sandbox, and failed code goes back to the model for up to 3 repairs.", href: "/#work-ai-data-copilot" },
  { text: "Retrieval and LangGraph agents for authorization review, used by 500+ people and checked against 200+ test cases before each release.", href: "/#work-clinical-rag" },
  { text: "Lookup time down 40%, manual review down 35%.", href: "/#work-clinical-rag" },
  { text: "I built most of the codebase and led testing.", href: "/#work-sign-language-translator" },
  { text: "Published in the Grenze International Journal of Engineering and Technology, indexed in Scopus.", href: "/#work-sign-language-translator" },
  { text: "Let the math find the pattern.", href: `${N}#the-idea` },
  { text: "All pattern detection lives in one engine written with only the Python standard library.", href: `${N}#the-stats-engine` },
  { text: "Every number Nita shows can be traced back to a formula.", href: `${N}#the-stats-engine` },
  { text: "Nothing a user writes reaches an AI provider until they say yes, and that rule is enforced in code, not just on a screen.", href: `${N}#privacy-by-design` },
  { text: "Patterns need 10 paired days before they can show up.", href: `${N}#the-idea` },
  { text: "Failed correlations are passed in so the AI never implies them.", href: `${N}#the-idea` },
  { text: "Numbers are copied from the engine, never composed.", href: `${N}#the-idea` },
  { text: "Health data on iOS is excluded from iCloud backup.", href: `${N}#privacy-by-design` },
  { text: "Now the demo account's consent gets reset before every submission.", href: `${N}#getting-through-review` },
  { text: "Let the model write code, not answers.", href: `${C}#the-idea` },
  { text: "Every number comes from pandas running on the real data.", href: `${C}#the-idea` },
  { text: "Anything touching files, the network, the OS or imports is blocked before it runs.", href: `${C}#how-it-works` },
  { text: "If the code fails, the error goes back to the model as context for a fix, up to three times.", href: `${C}#how-it-works` },
  { text: "Executing model-written code is the riskiest thing the app does.", href: `${C}#the-hardest-part` },
  { text: "Treat retrieval, grounding and evaluation as the product, not the LLM call.", href: `${R}#the-idea` },
  { text: "Chunks follow document structure, not fixed lengths.", href: `${R}#the-idea` },
  { text: "Answers must be supported by the retrieved evidence.", href: `${R}#the-idea` },
  { text: "RAGAS and LangSmith evaluations over 200+ curated cases had to pass before every release.", href: `${R}#safety-for-hipaa-workflows` },
  { text: "Protected health information is redacted before it reaches downstream processing and logs.", href: `${R}#safety-for-hipaa-workflows` },
  { text: "If the wrong policy section came back, even a strong model produced a bad answer.", href: `${R}#the-hardest-part` },
];
