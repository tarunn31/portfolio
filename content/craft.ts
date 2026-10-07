// Copy and constants for the Craft tiles, from the approved home design.
export const craft = {
  heading: "Craft",
  sub: "Small working pieces of things I've shipped. Play with them.",
  retrieval: {
    title: "Retrieval",
    description:
      "Move the query. The nearest chunks get pulled in, the core of the RAG platform at Molina.",
    label: "top 3 of 32 chunks",
    count: 32,
    seed: 11,
  },
  heal: {
    title: "Self-healing code",
    description:
      "Press Run. The first try fails, the error goes back, and the model repairs it, like the Data Copilot.",
    statuses: ["Ready", "Attempt 1 failed, sending the error back", "Attempt 2 passed", "Chart ready"],
    error: "KeyError: 'revenue'",
    bars: [
      { h: 92, label: "East" },
      { h: 132, label: "West" },
      { h: 60, label: "North" },
      { h: 110, label: "South" },
    ],
  },
  consent: {
    title: "Consent gate",
    description: "Flip consent. Every AI endpoint in Nita checks it on the server, not just on screen.",
    switchLabel: "Allow AI processing",
    request: "POST /ai/chat",
    off: { result: "403 consent required", note: "nothing sent to the AI provider" },
    on: { result: "200 OK, streaming reply", note: "consent recorded, append-only" },
  },
  pattern: {
    title: "Pattern unlock",
    description: "Log days. Nita stays quiet until there's enough data to say something true.",
    needed: 10,
    start: 6,
    locked: "Not enough data yet, so Nita says nothing about this.",
    unlocked: "Your sleep and next-day mood tend to move together. An association, not a cause.",
  },
} as const;
