import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { site } from "@/content/site";
import { OG_SIZE, renderCard } from "../../_og/render";

export const alt = "Case study";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const cs = getCaseStudy((await params).slug);
  return renderCard({
    eyebrow: "Case study",
    title: cs?.title ?? site.name,
    subtitle: cs?.subtitle,
    meta: cs?.meta[0] ? `${cs.meta[0].label}: ${cs.meta[0].value}` : undefined,
    footer: `${site.name}  |  ${new URL(site.url).host}`,
  });
}
