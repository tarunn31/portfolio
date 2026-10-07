import type { FlowItem, PipelineNode } from "@/content/pipeline";

const tone: Record<PipelineNode["tone"], string> = {
  plain: "border border-btn-border bg-btn",
  emphasis: "border border-text",
  ok: "border border-ok-border bg-ok-bg",
  err: "border border-err-border bg-err-bg",
  final: "bg-text text-bg",
};

const itemKey = (n: FlowItem) => ("stack" in n ? n.stack.map((s) => s.label).join("+") : n.label);

function Step({ item }: { item: FlowItem }) {
  if ("stack" in item) {
    return (
      <span className="inline-flex flex-col gap-1.5">
        {item.stack.map((s) => (
          <span key={s.label} className={`rounded-lg px-2.5 py-1.5 text-[13px] ${tone[s.tone]}`}>
            {s.label}
          </span>
        ))}
      </span>
    );
  }
  return <span className={`rounded-[10px] px-3 py-2 ${tone[item.tone]}`}>{item.label}</span>;
}

function Row({ nodes, connector }: { nodes: FlowItem[]; connector: number }) {
  return (
    <ol className="m-0 flex list-none flex-wrap items-center gap-2.5 p-0 text-[14px]">
      {nodes.map((n, i) => (
        <li key={itemKey(n)} className="flex items-center gap-2.5">
          {/* Connectors only on wide screens: when chips wrap on phones they would dangle at line ends. */}
          {i > 0 && (
            <span
              aria-hidden="true"
              className="hidden h-px bg-connector sm:block"
              style={{ width: connector }}
            />
          )}
          <Step item={n} />
        </li>
      ))}
    </ol>
  );
}

/**
 * Horizontal flow of chips joined by hairlines. `perRow` splits the flow into deliberate rows
 * so a wrapped line never starts with a stray connector. Reused by the home row and the case studies.
 */
export function PipelineDiagram({
  nodes,
  perRow,
  connector = 20,
}: {
  nodes: FlowItem[];
  perRow?: number;
  connector?: number;
}) {
  if (!perRow) return <Row nodes={nodes} connector={connector} />;
  const rows: FlowItem[][] = [];
  for (let i = 0; i < nodes.length; i += perRow) rows.push(nodes.slice(i, i + perRow));
  return (
    <div className="flex flex-col gap-4">
      {rows.map((r) => (
        <Row key={itemKey(r[0]!)} nodes={r} connector={connector} />
      ))}
    </div>
  );
}
