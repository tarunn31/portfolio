// Builds the citable sources behind Ask. Every source maps to a real, linkable place a visitor can
// read: a home section, a case study section, or the resume PDF. Server and scripts only.
import { caseStudies } from "@/content/case-studies";
import type { Block } from "@/content/case-studies/types";
import { education, roles } from "@/content/experience";
import type { FlowItem } from "@/content/pipeline";
import { projects } from "@/content/projects";
import { resumeSections } from "@/content/resume";
import { about } from "@/content/about";
import { highlights } from "@/content/highlights";
import { intro, outsideWork, site } from "@/content/site";
import { slug } from "@/lib/slug";

export type Source = { id: string; label: string; href: string; text: string };

const flowLabels = (flow: FlowItem[]) =>
  flow.map((n) => ("stack" in n ? n.stack.map((s) => s.label).join(" / ") : n.label)).join(" -> ");

export function blockText(b: Block): string {
  switch (b.type) {
    case "prose":
      return b.text;
    case "idea":
      return [b.statement, `Flow: ${flowLabels(b.flow)}`, ...b.notes].join("\n");
    case "rows":
      return [
        b.intro,
        ...b.rows.map((r) => `${r.label}: ${r.text}`),
        b.code && `Code:\n${b.code.text}\n${b.code.caption}`,
        b.callout && `${b.callout.heading}: ${b.callout.text}`,
      ]
        .filter(Boolean)
        .join("\n");
    case "cards":
      return [b.intro, ...b.items.map((c) => `${c.title}: ${c.text}`)].filter(Boolean).join("\n");
    case "callout":
      return `${b.heading}: ${b.text}`;
    case "stats":
      return [b.intro, ...b.items.map((s) => `${s.value} ${s.label}: ${s.text}`)].join("\n");
    case "list":
      return b.items.map((i) => `${i.title}: ${i.text}`).join("\n");
  }
}

const blockTitle = (b: Block) => (b.type === "idea" ? "The idea" : b.title);

export function buildSources(): Source[] {
  const out: Source[] = [];

  out.push({
    id: "intro",
    label: "Intro",
    href: "/#top",
    text: [intro.heading, intro.role, ...intro.paragraphs, intro.status].join("\n"),
  });

  out.push({
    id: "highlights",
    label: "Highlights",
    href: "/#highlights",
    text: `Highlights, in Tarun's own words: ${highlights.text}`,
  });

  for (const p of projects) {
    out.push({
      id: `work-${p.id}`,
      label: p.name,
      href: `/#work-${p.id}`,
      text: [`${p.name} (${p.meta})`, p.line, p.detail, `Stack: ${p.stack.join(", ")}`].join("\n"),
    });
  }

  out.push({
    id: "experience",
    label: "Experience",
    href: "/#experience",
    text: [
      ...roles.map((r) => `${r.company}, ${r.title}, ${r.years}`),
      `${education.school}, ${education.degree}, ${education.year}`,
    ].join("\n"),
  });

  out.push({
    id: "outside-work",
    label: "Outside work",
    href: "/#outside-work",
    text: outsideWork,
  });

  out.push({
    id: "about",
    label: "About",
    href: "/#about",
    text: `Certifications: ${about.certifications.map((c) => `${c.issuer} ${c.title}`).join("; ")}`,
  });

  out.push({
    id: "contact",
    label: "Contact",
    href: "/#contact",
    text: `Email: ${site.email}\nGitHub: ${site.github}\nLinkedIn: ${site.linkedin}\nResume: ${site.resumePath}`,
  });

  for (const cs of caseStudies) {
    out.push({
      id: `${cs.slug}-overview`,
      label: `${cs.shortName}: Overview`,
      href: `/work/${cs.slug}`,
      text: [cs.title, cs.subtitle, ...cs.meta.map((m) => `${m.label}: ${m.value}`)].join("\n"),
    });
    for (const b of cs.blocks) {
      const title = blockTitle(b);
      out.push({
        id: `${cs.slug}-${slug(title)}`,
        label: `${cs.shortName}: ${title}`,
        href: `/work/${cs.slug}#${slug(title)}`,
        text: `${title}\n${blockText(b)}`,
      });
    }
  }

  for (const r of resumeSections) {
    out.push({ id: r.id, label: r.label, href: site.resumePath, text: r.text });
  }

  return out;
}
