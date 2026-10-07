import Link from "next/link";
import { site } from "@/content/site";
import { PaletteButton } from "../palette/PaletteButton";
import { ThemeToggle } from "../ThemeToggle";

export function CaseNav({ nextHref, nextLabel }: { nextHref: string; nextLabel: string }) {
  return (
    <header className="sticky top-0 z-10 bg-nav backdrop-blur-[10px]">
      <div className="mx-auto box-content flex max-w-[720px] items-center justify-between gap-4 px-6 py-3.5 text-[14px]">
        <Link href="/" className="shrink-0 font-medium whitespace-nowrap">
          {site.shortName}
        </Link>
        <nav aria-label="Case studies" className="flex items-center gap-1">
          <Link href={nextHref} className="py-2.5 text-muted">
            {nextLabel}
          </Link>
          <PaletteButton />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
