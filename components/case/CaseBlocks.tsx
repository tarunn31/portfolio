import type { Block } from "@/content/case-studies/types";
import { slug } from "@/lib/slug";
import { PipelineDiagram } from "../PipelineDiagram";
import { CodeBlock } from "./CodeBlock";

const h2 = "m-0 text-[15px] font-medium text-muted";

function Section({ title, children, gap = "gap-3" }: { title: string; children: React.ReactNode; gap?: string }) {
  return (
    <section id={slug(title)} className={`flex flex-col ${gap}`}>
      <h2 className={h2}>{title}</h2>
      {children}
    </section>
  );
}

function Callout({ heading, text }: { heading: string; text: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-row-active px-[18px] py-4">
      <span className="font-medium">{heading}</span>
      <span className="text-body">{text}</span>
    </div>
  );
}

export function CaseBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "prose":
      return (
        <Section title={block.title}>
          <p className="m-0 text-body">{block.text}</p>
        </Section>
      );

    case "idea":
      return (
        <Section title="The idea" gap="gap-4">
          <p className="m-0 text-[22px] leading-[1.4] font-medium tracking-[-0.01em]">{block.statement}</p>
          <div className="flex flex-col gap-[18px] rounded-2xl border border-tile-border bg-tile p-6">
            <PipelineDiagram nodes={block.flow} perRow={block.perRow} connector={block.connector} />
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-3 p-0 font-mono text-[12px] text-muted">
              {block.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        </Section>
      );

    case "rows": {
      const lw = block.labelWidth ?? 140;
      return (
        <Section title={block.title}>
          {block.intro && <p className="m-0 text-body">{block.intro}</p>}
          <dl className="m-0 flex flex-col">
            {block.rows.map((r) => (
              <div
                key={r.label}
                style={{ "--lw": `${lw}px` } as React.CSSProperties}
                className="grid grid-cols-[104px_minmax(0,1fr)] gap-4 border-b border-tile-border py-2.5 sm:grid-cols-[var(--lw)_minmax(0,1fr)]"
              >
                <dt className={block.mono ? "pt-0.5 font-mono text-[13px] text-muted" : "font-medium"}>
                  {r.label}
                </dt>
                <dd className={`m-0 ${block.mono ? "" : "text-body"}`}>{r.text}</dd>
              </div>
            ))}
          </dl>
          {block.code && <CodeBlock {...block.code} />}
          {block.callout && <Callout {...block.callout} />}
        </Section>
      );
    }

    case "cards":
      return (
        <Section title={block.title}>
          {block.intro && <p className="m-0 text-body">{block.intro}</p>}
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-3 p-0">
            {block.items.map((c) => (
              <li
                key={c.title}
                className="flex flex-col gap-1 rounded-xl border border-tile-border bg-tile p-4"
              >
                <span className="font-medium">{c.title}</span>
                <span className="text-[14px] text-muted">{c.text}</span>
              </li>
            ))}
          </ul>
        </Section>
      );

    case "callout":
      return (
        <Section title={block.title}>
          <Callout heading={block.heading} text={block.text} />
        </Section>
      );

    case "stats":
      return (
        <Section title={block.title}>
          <p className="m-0 text-body">{block.intro}</p>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-3 p-0">
            {block.items.map((s) => (
              <li
                key={s.label}
                className="flex flex-col gap-1.5 rounded-xl border border-tile-border bg-tile p-4"
              >
                <span className="text-[30px] leading-[1.1] font-semibold tracking-[-0.02em]">{s.value}</span>
                <span className="font-medium">{s.label}</span>
                <span className="text-[13px] leading-[1.55] text-muted">{s.text}</span>
              </li>
            ))}
          </ul>
        </Section>
      );

    case "list":
      return (
        <Section title={block.title}>
          <div className="flex flex-col gap-4">
            {block.items.map((i) => (
              <div key={i.title} className="flex flex-col gap-1">
                <h3 className="m-0 text-[15px] font-medium">{i.title}</h3>
                <span className="text-body">{i.text}</span>
              </div>
            ))}
          </div>
        </Section>
      );
  }
}
