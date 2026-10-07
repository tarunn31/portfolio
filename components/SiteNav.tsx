import { navLinks, site } from "@/content/site";
import { PaletteButton } from "./palette/PaletteButton";
import { ThemeToggle } from "./ThemeToggle";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-10 bg-nav backdrop-blur-[10px]">
      <div className="mx-auto box-content flex max-w-[640px] items-center justify-between gap-4 px-6 py-3.5">
        <a href="#top" className="shrink-0 font-medium whitespace-nowrap">
          {site.shortName}
        </a>
        <nav aria-label="Sections" className="flex items-center gap-1 text-[14px] text-muted">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="px-2 py-2.5">
              {l.label}
            </a>
          ))}
          <PaletteButton />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
