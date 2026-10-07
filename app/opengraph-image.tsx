import { site } from "@/content/site";
import { OG_SIZE, renderCard } from "./_og/render";

export const alt = `${site.name}, ${site.role}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderCard({
    title: site.name,
    subtitle: site.role,
    footer: new URL(site.url).host,
  });
}
