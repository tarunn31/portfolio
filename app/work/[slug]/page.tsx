import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseBlock } from "@/components/case/CaseBlocks";
import { CaseNav } from "@/components/case/CaseNav";
import { DotGrid } from "@/components/DotGrid";
import { caseStudies, getCaseStudy } from "@/content/case-studies";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const cs = getCaseStudy((await params).slug);
  if (!cs) return {};
  return {
    title: `${cs.shortName}, case study`,
    description: cs.subtitle,
    alternates: { canonical: `/work/${cs.slug}` },
    openGraph: {
      type: "article",
      title: `${cs.shortName}, case study`,
      description: cs.subtitle,
      url: `/work/${cs.slug}`,
    },
    twitter: { card: "summary_large_image", title: `${cs.shortName}, case study`, description: cs.subtitle },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const cs = getCaseStudy((await params).slug);
  if (!cs) notFound();
  const next = getCaseStudy(cs.nextSlug)!;
  const nextHref = `/work/${next.slug}`;
  const nextLabel = `Next: ${next.shortName}`;

  return (
    <div className="relative min-h-screen">
      <DotGrid variant="static" />
      <CaseNav nextHref={nextHref} nextLabel={nextLabel} />
      <main className="relative z-[1] mx-auto box-content flex max-w-[720px] flex-col gap-14 px-6 pt-[72px] pb-20">
        <section className="fade-up flex flex-col gap-4">
          <span className="font-mono text-[12px] text-faint">Case study</span>
          <h1 className="m-0 text-[36px] leading-[1.15] font-semibold tracking-[-0.02em]">{cs.title}</h1>
          <p className="m-0 max-w-[56ch] text-[18px] leading-[1.6] text-body">{cs.subtitle}</p>
          <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-4 pt-3">
            {cs.meta.map((m) => (
              <div key={m.label} className="flex flex-col">
                <dt className="text-[13px] text-muted">{m.label}</dt>
                <dd className="m-0">{m.value}</dd>
              </div>
            ))}
          </dl>
          {cs.links && (
            <div className="flex flex-wrap gap-5 text-[14px] font-medium">
              {cs.links.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </section>

        {cs.video && (
          <div
            style={{ "--i": 1 } as React.CSSProperties}
            className="fade-up aspect-video overflow-hidden rounded-2xl border border-tile-border bg-tile"
          >
            <video
              src={cs.video.src}
              poster={cs.video.poster}
              controls
              muted
              playsInline
              preload="metadata"
              aria-label={cs.video.label}
              className="block size-full object-contain"
            />
          </div>
        )}

        {cs.blocks.map((b, i) => (
          <CaseBlock key={i} block={b} />
        ))}

        <footer className="flex flex-wrap justify-between gap-3 border-t border-tile-border pt-6 text-[14px]">
          <Link href="/">Back to home</Link>
          <Link href={nextHref} className="text-muted">
            {nextLabel}
          </Link>
        </footer>
      </main>
    </div>
  );
}
