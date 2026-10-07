import type { CaseStudy } from "./types";

export const copilot: CaseStudy = {
  slug: "ai-data-copilot",
  shortName: "AI Data Copilot",
  title: "AI Data Copilot",
  subtitle:
    "Ask a spreadsheet anything in plain English. The AI writes the analysis code, runs it safely, and repairs it when it breaks.",
  meta: [
    { label: "Role", value: "Solo project" },
    { label: "Type", value: "Web app, live" },
    { label: "Model", value: "GPT-4.1 and 4.1-mini" },
    { label: "Stack", value: "Python, Streamlit, Pandas, Plotly" },
  ],
  links: [
    { label: "Live demo", href: "https://ai-data-copilot.streamlit.app" },
    { label: "GitHub", href: "https://github.com/tarunn31/ai-data-copilot" },
  ],
  video: {
    src: "/media/copilot-showcase.mp4",
    poster: "/media/copilot-poster-800.jpg",
    label: "AI Data Copilot product walkthrough",
  },
  nextSlug: "clinical-rag",
  blocks: [
    {
      type: "prose",
      title: "The problem",
      text: "Most people with a spreadsheet have questions, not Python or SQL. Paste the data into a chatbot and you get an answer that sounds right, with no way to check where the number came from.",
    },
    {
      type: "idea",
      statement: "Let the model write code, not answers.",
      perRow: 3,
      flow: [
        { label: "Question", tone: "plain" },
        { label: "Router", tone: "plain" },
        { label: "GPT-4.1 writes pandas", tone: "emphasis" },
        { label: "Sandbox", tone: "plain" },
        { label: "Error? Retry, up to 3", tone: "err" },
        { label: "Chart and insights", tone: "final" },
      ],
      notes: [
        "Every number comes from pandas running on the real data.",
        "The generated code and every attempt are shown to the user.",
        "Descriptive questions skip code entirely.",
      ],
    },
    {
      type: "rows",
      title: "How it works",
      labelWidth: 160,
      rows: [
        {
          label: "Profiling",
          text: "The file is read, duplicate column names are cleaned up, and a profile of types, missing values and unique counts is built.",
        },
        {
          label: "Routing",
          text: "GPT-4.1-mini decides whether a question needs analysis or just a written answer, so simple questions stay fast and cheap.",
        },
        {
          label: "Code",
          text: "GPT-4.1 writes pandas code against the dataset profile, returning a result table and, when useful, a chart.",
        },
        {
          label: "Sandbox",
          text: "Code runs with a minimal set of Python builtins. Anything touching files, the network, the OS or imports is blocked before it runs.",
        },
        {
          label: "Self-repair",
          text: "If the code fails, the error goes back to the model as context for a fix, up to three times.",
        },
        {
          label: "Explaining",
          text: "GPT-4.1-mini turns the result into three insights, one recommendation and one caveat.",
        },
        {
          label: "Dashboards",
          text: "Schema detection finds date, revenue, profit, cost, discount, quantity and category columns, then builds a sales, classification or general dashboard.",
        },
        {
          label: "Reports",
          text: "Any analysis can be downloaded as a Markdown report, and every run is kept in a session history.",
        },
      ],
    },
    {
      type: "callout",
      title: "The hardest part",
      heading: "Letting an AI run code without letting it run anything",
      text: "Executing model-written code is the riskiest thing the app does. The answer was layers: screen every snippet before it runs, execute it with almost no builtins, and treat failures as information instead of crashes. A typo in a column name becomes a quiet retry with the error attached, not a stack trace in front of the user.",
    },
    {
      type: "rows",
      title: "What I'd build next",
      labelWidth: 160,
      rows: [
        {
          label: "Isolation",
          text: "Move execution into a short-lived container per request. A blocklist is a good first layer, but not a true sandbox.",
        },
        {
          label: "Evaluation",
          text: "A set of questions with known answers, run on every change, so prompt edits cannot quietly break the numbers.",
        },
        {
          label: "Bigger data",
          text: "Multi-file and SQL sources, so it can work across related tables.",
        },
      ],
    },
  ],
};
