import { About } from "@/components/About";
import { AskFacade } from "@/components/AskFacade";
import { AskLazy } from "@/components/AskLazy";
import { Colophon } from "@/components/Colophon";
import { Contact } from "@/components/Contact";
import { CraftSection } from "@/components/CraftSection";
import { DotGrid } from "@/components/DotGrid";
import { EvalPanel } from "@/components/EvalPanel";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { Intro } from "@/components/Intro";
import { SiteNav } from "@/components/SiteNav";
import { WorkList } from "@/components/WorkList";
import { highlights } from "@/content/highlights";
import { projects } from "@/content/projects";

const section = "flex flex-col";

export default function Home() {
  // No poster preload on purpose: the poster is in the HTML, so the browser finds it by itself, and
  // measured on mobile a high-priority preload only added weight to the critical path.

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <DotGrid variant="live" />
      <SiteNav />
      <main
        id="top"
        className="relative z-[1] mx-auto box-content flex max-w-[640px] flex-col gap-16 px-6 pt-[72px] pb-16"
      >
        <section className={`${section} fade-up`}>
          <Intro />
        </section>

        <section id="work" style={{ "--i": 1 } as React.CSSProperties} className={`${section} fade-up gap-1`}>
          <div className="mb-2 flex flex-col">
            <h2 className="m-0 text-[15px] font-medium text-muted">Work</h2>
            <span id="highlights" className="text-[14px] text-muted">
              {highlights.text}
            </span>
          </div>
          <WorkList projects={projects} />
        </section>

        <section id="craft" className={`${section} gap-4`}>
          <CraftSection />
        </section>

        <section id="ask" className={`${section} gap-4`}>
          <AskLazy facade={<AskFacade />} />
          <EvalPanel />
        </section>

        <section id="experience" className={`${section} gap-1`}>
          <Experience />
        </section>

        <section id="about" className={`${section} gap-1`}>
          <About />
        </section>

        <section id="contact" className={`${section} gap-3`}>
          <Contact />
        </section>

        <Footer />
        <Colophon />
      </main>
    </div>
  );
}
