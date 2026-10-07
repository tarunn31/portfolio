import type { CaseStudy } from "./types";

export const nita: CaseStudy = {
  slug: "nita",
  shortName: "Nita",
  title: "Nita",
  subtitle:
    "A private wellness companion that finds the real patterns in what you log, and explains them without making anything up.",
  meta: [
    { label: "Role", value: "Solo founder and engineer" },
    { label: "Timeline", value: "Mar to Oct 2026" },
    { label: "Platforms", value: "iOS and Android" },
    { label: "Stack", value: "React Native, FastAPI, Supabase, Claude, HealthKit" },
  ],
  video: {
    src: "/media/nita-showcase.mp4",
    poster: "/media/nita-poster-900.jpg",
    label: "Nita app walkthrough",
  },
  nextSlug: "ai-data-copilot",
  blocks: [
    {
      type: "prose",
      title: "The problem",
      text: "Tracking isn't understanding. Most wellness apps show a screen full of numbers and leave you to work out why you're tired. An AI could explain it, but left alone, a language model will happily invent patterns and numbers, which is the last thing anyone wants near their health data.",
    },
    {
      type: "idea",
      statement: "Let the math find the pattern. Let the AI only explain it.",
      connector: 24,
      flow: [
        { label: "Your logs", tone: "plain" },
        { label: "Stats engine", tone: "emphasis" },
        {
          stack: [
            { label: "Passed tests", tone: "ok" },
            { label: "Failed tests", tone: "err" },
          ],
        },
        { label: "Claude explains", tone: "plain" },
        { label: "Insight", tone: "final" },
      ],
      notes: [
        "Patterns need 10 paired days before they can show up.",
        "Failed correlations are passed in so the AI never implies them.",
        "Numbers are copied from the engine, never composed.",
      ],
    },
    {
      type: "rows",
      title: "The stats engine",
      intro:
        "All pattern detection lives in one engine written with only the Python standard library. No numpy, no pandas, no trained models. Every number Nita shows can be traced back to a formula.",
      rows: [
        { label: "Sleep and mood", text: "Daily averages, trend slope, and comparison to goals." },
        {
          label: "Fitness",
          text: "Linear-regression trends, plateau detection, and heart-rate anomalies by z-score.",
        },
        {
          label: "Medications",
          text: "Adherence rate per medication, day-of-week miss patterns, and gaps.",
        },
        { label: "Cycle", text: "Average length, a regularity score, and phase prediction." },
        {
          label: "Across areas",
          text: "Pearson correlations like sleep against next-day mood, only after 10 paired days.",
        },
      ],
      code: {
        language: "python",
        text: `MIN_PAIRED_DAYS = 10

lag_dates = sorted(
    d for d in daily_mood
    if (date.fromisoformat(d) - timedelta(days=1)).isoformat() in daily_sleep
)
if len(lag_dates) >= MIN_PAIRED_DAYS:
    prev_sleep = [
        daily_sleep[(date.fromisoformat(d) - timedelta(days=1)).isoformat()]
        for d in lag_dates
    ]
    todays_mood = [daily_mood[d] for d in lag_dates]
    r_lag = _pearson(prev_sleep, todays_mood)
    if abs(r_lag) >= 0.40:
        ...`,
        caption: "Excerpt from pattern_engine.py, lightly trimmed.",
      },
    },
    {
      type: "cards",
      title: "Privacy by design",
      intro:
        "Nothing a user writes reaches an AI provider until they say yes, and that rule is enforced in code, not just on a screen.",
      items: [
        {
          title: "Consent first",
          text: "A dedicated onboarding step, stored as versioned, append-only records.",
        },
        {
          title: "Enforced on both sides",
          text: "The app fails closed, and every AI endpoint returns 403 without consent.",
        },
        {
          title: "Per-user isolation",
          text: "Identity always comes from the auth token, never from request data.",
        },
        { title: "Off cloud backups", text: "Health data on iOS is excluded from iCloud backup." },
        {
          title: "Apple Health, read-only",
          text: "Reads 8 data types, only the ones a user approves: steps, heart rate, resting heart rate, active and resting energy, walking and running distance, exercise minutes, and sleep. It never writes.",
        },
      ],
    },
    {
      type: "rows",
      title: "Getting through review",
      intro:
        "Apple and Google both pushed hard on third-party AI consent and health data. It took several rounds to get it right.",
      mono: true,
      rows: [
        { label: "Early Aug", text: "App Store review rounds begin. Several rejections worked through." },
        { label: "Aug 29", text: "Privacy policy updated with a third-party protection clause." },
        { label: "Sep 1", text: "Approved by Apple." },
        {
          label: "Mid Sep",
          text: "Android rebuilt with the same fixes, and two unused permissions removed.",
        },
        { label: "Sep 23", text: "Approved by Google Play, held for a joint release." },
        { label: "Oct 2026", text: "Public launch on iOS and Android." },
      ],
      callout: {
        heading: "The lesson",
        text: "A correct consent screen still failed review, because the reviewer's demo account had already consented and never saw it. Now the demo account's consent gets reset before every submission.",
      },
    },
    {
      type: "list",
      title: "What I'd do differently",
      items: [
        {
          title: "Build for review from day one",
          text: "I had a working consent and privacy system and still kept getting rejected, because I was thinking about what I built, not what a reviewer could actually see and verify. The fix that got me approved wasn't new code. It was treating the reviewer's experience as a feature of its own. That shift would have saved me weeks.",
        },
        {
          title: "Get it in front of people sooner",
          text: "I redesigned the experience more than once because I was polishing alone and guessing at what mattered. A handful of real users early on would have told me what to cut, and I would have rebuilt a lot less.",
        },
      ],
    },
    {
      type: "prose",
      title: "Where it stands",
      text: "Approved by Apple and Google, and launching publicly on iOS and Android in October 2026.",
    },
  ],
};
