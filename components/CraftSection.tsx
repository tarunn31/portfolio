import { craft } from "@/content/craft";
import { site } from "@/content/site";
import { ConsentTile } from "./craft/ConsentTile";
import { HealTile } from "./craft/HealTile";
import { PatternTile } from "./craft/PatternTile";
import { RetrievalTile } from "./craft/RetrievalTile";

function Caption({ title, description, file }: { title: string; description: string; file: string }) {
  return (
    <div className="flex flex-col">
      <h3 className="m-0 text-[15px] font-medium">{title}</h3>
      <span className="text-[14px] text-muted">{description}</span>
      {/* Only once the repo is public (NEXT_PUBLIC_REPO_URL): never a link to nothing. */}
      {site.repo && (
        <a
          href={`${site.repo}/blob/main/components/craft/${file}`}
          className="mt-0.5 self-start font-mono text-[12px] text-faint underline decoration-underline underline-offset-[3px]"
        >
          View source<span className="sr-only"> for {title}</span>
        </a>
      )}
    </div>
  );
}

export function CraftSection() {
  const tiles = [
    { meta: craft.heal, tile: <HealTile />, file: "HealTile.tsx" },
    { meta: craft.consent, tile: <ConsentTile />, file: "ConsentTile.tsx" },
    { meta: craft.pattern, tile: <PatternTile />, file: "PatternTile.tsx" },
  ];
  return (
    <>
      <div className="flex flex-col">
        <h2 className="m-0 text-[15px] font-medium text-muted">{craft.heading}</h2>
        <span className="text-[14px] text-muted">{craft.sub}</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-5">
        <RetrievalTile
          caption={
            <Caption
              title={craft.retrieval.title}
              description={craft.retrieval.description}
              file="RetrievalTile.tsx"
            />
          }
        />
        {tiles.map(({ meta, tile, file }) => (
          <div key={meta.title} className="flex flex-col gap-2.5">
            {tile}
            <Caption title={meta.title} description={meta.description} file={file} />
          </div>
        ))}
      </div>
    </>
  );
}
