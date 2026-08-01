import { Link } from "react-router-dom";
import { scenes, type SceneMeta } from "../lib/scenes";

const GROUP_META: Record<string, { title: string; blurb: string }> = {
  "context-rot": {
    title: "Context Rot",
    blurb: "One flow, three parts — diagnose the problem, then two independent fixes.",
  },
};

type Block = { kind: "group"; group: string; items: SceneMeta[] } | { kind: "singles"; items: SceneMeta[] };

// Consecutive scenes sharing a `group` collapse into one section block; consecutive
// ungrouped scenes collapse into one "singles" run so they can still share a 2-column
// grid instead of each claiming a full-width row. Order in `scenes` is preserved.
function buildBlocks(list: SceneMeta[]): Block[] {
  const blocks: Block[] = [];
  for (const scene of list) {
    const last = blocks[blocks.length - 1];
    if (scene.group) {
      if (last?.kind === "group" && last.group === scene.group) {
        last.items.push(scene);
      } else {
        blocks.push({ kind: "group", group: scene.group, items: [scene] });
      }
    } else if (last?.kind === "singles") {
      last.items.push(scene);
    } else {
      blocks.push({ kind: "singles", items: [scene] });
    }
  }
  return blocks;
}

function StatusBadge({ isReady }: { isReady: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
        isReady ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-white/40"
      }`}
    >
      {isReady ? "ready" : "backlog"}
    </span>
  );
}

function SceneCard({ scene }: { scene: SceneMeta }) {
  const isReady = scene.status === "ready";
  const card = (
    <div
      className={`h-full rounded-xl border p-5 transition-colors ${
        isReady
          ? "border-white/15 bg-white/[0.03] hover:border-white/40 hover:bg-white/[0.06]"
          : "border-white/5 bg-white/[0.01] opacity-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{scene.title}</h2>
        <StatusBadge isReady={isReady} />
      </div>
      <p className="mt-1 text-sm text-white/40">{scene.concept}</p>
      <p className="mt-3 text-sm text-white/60">{scene.description}</p>
    </div>
  );

  return isReady ? <Link to={`/${scene.slug}`}>{card}</Link> : <div>{card}</div>;
}

function GroupSection({ group, items }: { group: string; items: SceneMeta[] }) {
  const meta = GROUP_META[group] ?? { title: group, blurb: "" };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold uppercase tracking-[0.1em] text-white/70">{meta.title}</h2>
        <span className="text-xs uppercase tracking-wider text-white/30">{items.length}-part flow</span>
      </div>
      {meta.blurb && <p className="mt-1 text-sm text-white/40">{meta.blurb}</p>}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((scene, i) => {
          const isReady = scene.status === "ready";
          const card = (
            <div
              className={`h-full rounded-lg border p-4 transition-colors ${
                isReady
                  ? "border-white/15 bg-white/[0.03] hover:border-white/40 hover:bg-white/[0.07]"
                  : "border-white/5 bg-white/[0.01] opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-white/30">{i + 1}</span>
                <StatusBadge isReady={isReady} />
              </div>
              <h3 className="mt-1.5 text-sm font-medium">{scene.title}</h3>
              <p className="mt-1 text-xs text-white/40">{scene.concept}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/55">{scene.description}</p>
            </div>
          );
          return (
            <div key={scene.slug} className="flex items-center gap-2">
              {isReady ? (
                <Link to={`/${scene.slug}`} className="min-w-0 flex-1">
                  {card}
                </Link>
              ) : (
                <div className="min-w-0 flex-1">{card}</div>
              )}
              {i < items.length - 1 && (
                <span className="hidden shrink-0 text-white/15 sm:block">→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Visualizer() {
  const blocks = buildBlocks(scenes);

  return (
    <div>
      <p className="max-w-2xl text-white/60">
        Out-of-order practice — jump straight to any interactive concept. Open one, then use{" "}
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-sm">→</kbd> /{" "}
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-sm">space</kbd> to advance beats,{" "}
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-sm">esc</kbd> for the Gallery.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {blocks.map((block) =>
          block.kind === "group" ? (
            <GroupSection key={block.group} group={block.group} items={block.items} />
          ) : (
            <div key={block.items.map((s) => s.slug).join(",")} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {block.items.map((scene) => (
                <SceneCard key={scene.slug} scene={scene} />
              ))}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
