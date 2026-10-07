import { footer } from "@/content/site";

export function Footer() {
  return (
    <footer className="flex flex-wrap justify-between gap-3 border-t border-tile-border pt-6 font-mono text-[12px] text-faint">
      <span>{footer.copyright}</span>
      <span>{footer.hint}</span>
    </footer>
  );
}
