import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/case-studies";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, priority: 1 },
    ...caseStudies.map((c) => ({ url: `${site.url}/work/${c.slug}`, lastModified: now, priority: 0.8 })),
  ];
}
