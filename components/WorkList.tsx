"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ragPipeline } from "@/content/pipeline";
import type { Project } from "@/content/projects";
import { PipelineDiagram } from "./PipelineDiagram";
import { ProjectVideo } from "./ProjectVideo";

function Media({ project }: { project: Project }) {
  const m = project.media;
  if (!m) return null;
  return (
    <div className="aspect-video overflow-hidden rounded-[10px] border border-tile-border bg-tile">
      {m.kind === "video" ? (
        <ProjectVideo src={m.src} poster={m.poster} label={m.label} />
      ) : (
        <div role="img" aria-label={m.label} className="flex size-full items-center justify-center p-4">
          <PipelineDiagram nodes={ragPipeline} perRow={4} />
        </div>
      )}
    </div>
  );
}

// py-[3px] lifts the hit area to 24px+ (WCAG 2.2 target size); the -my on the list below keeps the layout as designed.
const linkClass = "inline-block py-[3px]";
function LinkItem({ href, label }: { href: string; label: string }) {
  return href.startsWith("/") ? (
    <Link href={href} className={linkClass}>
      {label}
    </Link>
  ) : (
    <a href={href} className={linkClass}>
      {label}
    </a>
  );
}

/**
 * Expand and collapse as a CSS grid-rows transition: a critically damped, spring-like curve (no bounce), no
 * JavaScript animation library. Content is mounted while open and until the collapse finishes, so closed rows
 * cost nothing (no video, no poster). Under prefers-reduced-motion the global CSS turns transitions off, so
 * rows simply open and close.
 */
function Panel({
  open,
  id,
  labelledBy,
  children,
}: {
  open: boolean;
  id: string;
  labelledBy: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (open) {
      setMounted(true);
      if (reduced) {
        setShown(true);
        return;
      }
      // Two frames: first paint the collapsed state, then change it, so the transition has something to run from.
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }
    setShown(false);
    const t = window.setTimeout(() => setMounted(false), reduced ? 0 : 420);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!mounted) return null;
  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      className={`grid transition-[grid-template-rows,opacity] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${shown ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

export function WorkList({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState<string | null>(projects[0]?.id ?? null);
  const openRef = useRef(open);
  openRef.current = open;

  // Deep links like /#work-nita (from Ask citations and Retrieval chunks) open that row and scroll to it.
  useEffect(() => {
    let timer: number | undefined;
    const sync = () => {
      const id = window.location.hash.slice(1);
      const target = projects.find((p) => `work-${p.id}` === id);
      if (!target) return;
      // A different open row collapses first and shifts everything below it, so wait for that to settle.
      const settle = openRef.current === target.id ? 0 : 400;
      setOpen(target.id);
      window.clearTimeout(timer);
      timer = window.setTimeout(
        () => document.getElementById(id)?.scrollIntoView({ block: "start" }),
        settle,
      );
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", sync);
    };
  }, [projects]);

  return (
    <div className="flex flex-col gap-1">
      {projects.map((p) => {
        const on = open === p.id;
        return (
          <div
            key={p.id}
            id={`work-${p.id}`}
            className={`-mx-3.5 flex flex-col rounded-xl transition-colors duration-[180ms] ${on ? "bg-row-active" : "bg-transparent"}`}
          >
            <button
              type="button"
              id={`work-${p.id}-btn`}
              aria-expanded={on}
              aria-controls={`work-${p.id}-panel`}
              onClick={() => setOpen(on ? null : p.id)}
              className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border-0 bg-transparent px-3.5 py-2.5 text-left text-[15px] leading-[1.6] text-text"
            >
              <span className="flex flex-col">
                <span className="font-medium">{p.name}</span>
                <span className="text-muted">{p.line}</span>
              </span>
              <span className="pt-[3px] font-mono text-[12px] whitespace-nowrap text-faint">{p.meta}</span>
            </button>
            <Panel open={on} id={`work-${p.id}-panel`} labelledBy={`work-${p.id}-btn`}>
              <div className="flex flex-col gap-3.5 px-3.5 pt-1 pb-[18px]">
                <Media project={p} />
                <p className="m-0 text-body">{p.detail}</p>
                <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                  {p.stack.map((t) => (
                    <li
                      key={t}
                      className="rounded-md border border-tile-border px-2 py-0.5 font-mono text-[12px] text-muted"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="-my-[3px] flex flex-wrap gap-x-5 text-[14px] font-medium">
                  {p.links.map((l) => (
                    <LinkItem key={l.href} {...l} />
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        );
      })}
    </div>
  );
}
