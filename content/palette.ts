import { caseStudies } from "./case-studies";
import { site } from "./site";

export type PaletteAction =
  | { kind: "nav"; href: string }
  | { kind: "download"; href: string }
  | { kind: "copy"; text: string; done: string }
  | { kind: "theme" }
  | { kind: "external"; href: string }
  /** Not a listed item: offered when a query matches nothing. */
  | { kind: "ask"; text: string };

export type PaletteItem = {
  id: string;
  group: "Jump to" | "Actions" | "Links";
  label: string;
  /** Small mono text on the right. */
  hint?: string;
  keywords?: string;
  action: PaletteAction;
};

// Spec section 7. Home sections jump with a hash, case studies are routes.
export const paletteItems: PaletteItem[] = [
  ...(
    [
      ["work", "Work"],
      ["craft", "Craft"],
      ["ask", "Ask"],
      ["experience", "Experience"],
      ["contact", "Contact"],
    ] as const
  ).map(([id, label]) => ({
    id: `jump-${id}`,
    group: "Jump to" as const,
    label,
    hint: "Section",
    action: { kind: "nav" as const, href: `/#${id}` },
  })),
  ...caseStudies.map((c) => ({
    id: `case-${c.slug}`,
    group: "Jump to" as const,
    label: c.shortName,
    hint: "Case study",
    keywords: `case study ${c.title}`,
    action: { kind: "nav" as const, href: `/work/${c.slug}` },
  })),
  {
    id: "download-resume",
    group: "Actions",
    label: "Download resume",
    hint: "PDF",
    keywords: "cv resume pdf",
    action: { kind: "download", href: site.resumePath },
  },
  {
    id: "copy-email",
    group: "Actions",
    label: "Copy email",
    hint: site.email,
    keywords: "email address contact",
    action: { kind: "copy", text: site.email, done: "Email copied" },
  },
  {
    id: "toggle-theme",
    group: "Actions",
    label: "Toggle theme",
    hint: "Light or dark",
    keywords: "dark light mode appearance",
    action: { kind: "theme" },
  },
  { id: "link-github", group: "Links", label: "GitHub", hint: "github.com/tarunn31", action: { kind: "external", href: site.github } },
  { id: "link-linkedin", group: "Links", label: "LinkedIn", hint: "linkedin.com", action: { kind: "external", href: site.linkedin } },
  { id: "link-nita", group: "Links", label: "nita.care", hint: "nita.care", keywords: "nita website app", action: { kind: "external", href: site.nita } },
  {
    id: "link-copilot",
    group: "Links",
    label: "AI Data Copilot live demo",
    hint: "streamlit.app",
    keywords: "copilot demo streamlit",
    action: { kind: "external", href: site.copilotDemo },
  },
];
