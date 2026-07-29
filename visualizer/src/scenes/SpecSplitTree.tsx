import { hierarchy, tree as d3tree } from "d3-hierarchy";
import { linkVertical } from "d3-shape";
import { AnimatePresence, motion, useTransform } from "framer-motion";
import { useBeats } from "../lib/useBeats";
import { useSpringNumber } from "../lib/useSpringNumber";
import { SceneChrome } from "../components/SceneChrome";

const MONOLITH = { name: "business-workflows.md", lines: 6000 };

// ~9 tokens/line for markdown prose — same conversion the Context Rot scene uses
// for its own large-spec-file cause, so the two numbers rhyme across scenes.
const TOKENS_PER_LINE = 9;
const tokensFor = (lines: number) => lines * TOKENS_PER_LINE;
const MONOLITH_TOKENS = tokensFor(MONOLITH.lines);

interface SpecNode {
  id: string;
  name: string;
  lines: number;
  children?: SpecNode[];
}

// 6 levels deep on the traversed branch (index -> ws-approval -> escalation ->
// sla-matrix -> exception-policy -> appeals) to show progressive disclosure stopping
// exactly where a task needs it, not one hop short or one hop past. Only 3 top-level
// branches — enough to show the index fans out to more than the one traversed flow,
// without crowding the layout.
const TREE_DATA: SpecNode = {
  id: "index",
  name: "flows-index.md",
  lines: 42,
  children: [
    {
      id: "ws-approval",
      name: "workspace-approval.md",
      lines: 180,
      children: [
        {
          id: "escalation",
          name: "approval-escalation-rules.md",
          lines: 90,
          children: [
            {
              id: "sla-matrix",
              name: "escalation-sla-matrix.md",
              lines: 45,
              children: [
                {
                  id: "exception-policy",
                  name: "sla-exception-policy.md",
                  lines: 28,
                  children: [{ id: "appeals", name: "sla-exception-appeals.md", lines: 15 }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "asset-prov",
      name: "asset-provisioning.md",
      lines: 210,
      children: [
        { id: "asset-approval", name: "asset-approval-matrix.md", lines: 70 },
        { id: "asset-decommission", name: "asset-decommission.md", lines: 55 },
      ],
    },
    {
      id: "vendor-mgmt",
      name: "vendor-management.md",
      lines: 190,
      children: [
        { id: "vendor-risk", name: "vendor-risk-tiers.md", lines: 65 },
        { id: "vendor-offboard", name: "vendor-offboarding.md", lines: 40 },
      ],
    },
  ],
};

const LINES_BY_ID = new Map<string, number>();
(function indexLines(node: SpecNode) {
  LINES_BY_ID.set(node.id, node.lines);
  node.children?.forEach(indexLines);
})(TREE_DATA);

// The task traversal stops at exception-policy — "appeals" exists, deeper still, and is
// deliberately never visited, proving the tree doesn't force loading past what's needed.
const TRAVERSAL = ["index", "ws-approval", "escalation", "sla-matrix", "exception-policy"];
const cumulativeLines = (upToIndex: number) =>
  TRAVERSAL.slice(0, upToIndex + 1).reduce((sum, id) => sum + (LINES_BY_ID.get(id) ?? 0), 0);
const FULL_TRAVERSAL_LINES = cumulativeLines(TRAVERSAL.length - 1);
const FULL_TRAVERSAL_TOKENS = tokensFor(FULL_TRAVERSAL_LINES);
const SAVINGS_PCT = Math.round((1 - FULL_TRAVERSAL_LINES / MONOLITH.lines) * 100);
const TASK_QUESTION = "What's the SLA exception policy for a stuck approval?";

type Phase = "monolith" | "split" | "traverse";

interface BeatConfig {
  phase: Phase;
  activeIds: string[];
  linesLoaded: number;
  task: string | null;
  showPayoff?: boolean;
  caption: string;
}

const BEATS: BeatConfig[] = [
  {
    phase: "monolith",
    activeIds: [],
    linesLoaded: 0,
    task: null,
    caption: "One file. Every flow. Every business process the team has, in a single spec.",
  },
  {
    phase: "monolith",
    activeIds: [],
    linesLoaded: MONOLITH.lines,
    task: null,
    caption: "6,000 lines — about 54,000 tokens — to load for any single question, no matter how small.",
  },
  {
    phase: "split",
    activeIds: [],
    linesLoaded: 0,
    task: null,
    caption: "Same knowledge, broken into an index and its flows — nested where it needs to be.",
  },
  {
    phase: "traverse",
    activeIds: ["index"],
    linesLoaded: cumulativeLines(0),
    task: TASK_QUESTION,
    caption: "Every task starts at the index. Cheap to read, points to the rest.",
  },
  {
    phase: "traverse",
    activeIds: ["index", "ws-approval"],
    linesLoaded: cumulativeLines(1),
    task: TASK_QUESTION,
    caption: "The index links to exactly one flow. The other four stay closed.",
  },
  {
    phase: "traverse",
    activeIds: ["index", "ws-approval", "escalation"],
    linesLoaded: cumulativeLines(2),
    task: TASK_QUESTION,
    caption: "That flow links deeper — into its escalation rules.",
  },
  {
    phase: "traverse",
    activeIds: ["index", "ws-approval", "escalation", "sla-matrix"],
    linesLoaded: cumulativeLines(3),
    task: TASK_QUESTION,
    caption: "And deeper still — the actual SLA matrix. Nested, not flattened.",
  },
  {
    phase: "traverse",
    activeIds: ["index", "ws-approval", "escalation", "sla-matrix", "exception-policy"],
    linesLoaded: cumulativeLines(4),
    task: TASK_QUESTION,
    caption: "Four hops down, and we've found the exact policy. \"Appeals\" goes deeper still — untouched.",
  },
  {
    phase: "traverse",
    activeIds: ["index", "ws-approval", "escalation", "sla-matrix", "exception-policy"],
    linesLoaded: FULL_TRAVERSAL_LINES,
    task: TASK_QUESTION,
    showPayoff: true,
    caption: "Same answer. A fraction of the file.",
  },
];

const LAYOUT_W = 1150;
const LAYOUT_H = 420;
const NODE_W = 170;
const NODE_H = 40;
const MARGIN_X = NODE_W / 2 + 14;
const MARGIN_Y = NODE_H / 2 + 16;

// Fewer, wider nodes than before — separation is a touch more generous than the old
// 5-branch layout needed, since there's more room per node to protect.
const layoutFn = d3tree<SpecNode>()
  .size([LAYOUT_W, LAYOUT_H])
  .separation((a, b) => (a.parent === b.parent ? 1.8 : 2.6));
const root = layoutFn(hierarchy(TREE_DATA));
const LAYOUT_NODES = root.descendants();
const LAYOUT_LINKS = root.links();
const linkPath = linkVertical<
  ReturnType<typeof root.links>[number],
  ReturnType<typeof root.descendants>[number]
>()
  .x((d) => d.x)
  .y((d) => d.y);

// Tree-wide normalization for the node redesign: how big is this file relative to the
// biggest one in the tree, and how many levels deep does the hierarchy actually go.
const MAX_NODE_TOKENS = Math.max(...LAYOUT_NODES.map((n) => tokensFor(n.data.lines)));
const MAX_DEPTH = Math.max(...LAYOUT_NODES.map((n) => n.depth));

function formatTokens(tokens: number) {
  return tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}k` : String(tokens);
}

function FileIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" className="shrink-0" style={{ color }}>
      <path
        d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
      />
      <path d="M14 2v5h5" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path d="M8 13h8M8 16.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

const NODE_TONE_ACTIVE = { bg: "rgba(251, 191, 36, 0.16)", border: "rgba(251, 191, 36, 0.65)", text: "#fde68a" };

// Inactive nodes recede the deeper they sit in the tree — a depth-cueing fade that
// reinforces "this hierarchy actually goes several levels down" independent of the
// links/layout, purely through how dim a not-yet-visited node looks.
function offToneForDepth(depth: number) {
  const t = MAX_DEPTH > 0 ? depth / MAX_DEPTH : 0;
  return {
    bg: `rgba(255, 255, 255, ${(0.05 - t * 0.03).toFixed(3)})`,
    border: `rgba(255, 255, 255, ${(0.14 - t * 0.08).toFixed(3)})`,
    text: `rgba(255, 255, 255, ${(0.46 - t * 0.22).toFixed(3)})`,
  };
}

function NodeCard({
  node,
  active,
  depth,
  hasChildren,
}: {
  node: SpecNode;
  active: boolean;
  depth: number;
  hasChildren: boolean;
}) {
  const tone = active ? NODE_TONE_ACTIVE : offToneForDepth(depth);
  const tokens = tokensFor(node.lines);
  const sizeRatio = MAX_NODE_TOKENS > 0 ? tokens / MAX_NODE_TOKENS : 0;

  return (
    <motion.div
      animate={{
        backgroundColor: tone.bg,
        borderColor: tone.border,
        scale: active ? 1 : 0.94,
        boxShadow: active ? "0 0 16px rgba(251, 191, 36, 0.4)" : "0 0 0px rgba(0, 0, 0, 0)",
      }}
      transition={{ type: "spring", stiffness: 280, damping: 16 }}
      className="relative flex h-full w-full items-center gap-1.5 overflow-hidden rounded-lg border px-2.5"
    >
      <FileIcon color={tone.text} />
      <motion.span
        animate={{ color: tone.text }}
        transition={{ type: "spring", stiffness: 280, damping: 16 }}
        className="truncate font-mono text-[11.5px]"
      >
        {node.name}
      </motion.span>
      {hasChildren && (
        <motion.span
          animate={{ color: tone.text }}
          transition={{ type: "spring", stiffness: 280, damping: 16 }}
          className="shrink-0 text-[9px]"
          title="branches further"
        >
          ▸
        </motion.span>
      )}
      <motion.span
        animate={{
          backgroundColor: active ? "rgba(251, 191, 36, 0.28)" : "rgba(255, 255, 255, 0.06)",
          color: active ? "#fde68a" : "rgba(255, 255, 255, 0.4)",
        }}
        transition={{ type: "spring", stiffness: 280, damping: 16 }}
        className="ml-auto shrink-0 rounded-[4px] px-1.5 py-0.5 font-mono text-[9px] font-semibold"
      >
        {formatTokens(tokens)} tok
      </motion.span>

      {/* Size bar — this file's tokens relative to the biggest file in the tree, so
          size differences read at a glance instead of requiring the badge to be read. */}
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-black/40">
        <motion.div
          className="h-full"
          animate={{ width: `${sizeRatio * 100}%`, backgroundColor: tone.border }}
          transition={{ type: "spring", stiffness: 160, damping: 24 }}
        />
      </div>
    </motion.div>
  );
}

function SpecTree({ activeIds }: { activeIds: Set<string> }) {
  const svgW = LAYOUT_W + MARGIN_X * 2;
  const svgH = LAYOUT_H + MARGIN_Y * 2;
  return (
    <div className="overflow-visible" style={{ width: svgW, height: svgH }}>
      <svg width={svgW} height={svgH} viewBox={`${-MARGIN_X} ${-MARGIN_Y} ${svgW} ${svgH}`}
      >
        <g>
          {LAYOUT_LINKS.map((link) => {
            const isActive = activeIds.has(link.source.data.id) && activeIds.has(link.target.data.id);
            return (
              <motion.path
                key={`${link.source.data.id}-${link.target.data.id}`}
                d={linkPath(link) ?? undefined}
                fill="none"
                animate={{
                  stroke: isActive ? "rgba(251, 191, 36, 0.75)" : "rgba(255, 255, 255, 0.09)",
                  strokeWidth: isActive ? 2.5 : 1.2,
                }}
                transition={{ type: "spring", stiffness: 160, damping: 24 }}
              />
            );
          })}
        </g>
        <g>
          {LAYOUT_NODES.map((node) => (
            <foreignObject
              key={node.data.id}
              x={node.x - NODE_W / 2}
              y={node.y - NODE_H / 2}
              width={NODE_W}
              height={NODE_H}
            >
              <NodeCard
                node={node.data}
                active={activeIds.has(node.data.id)}
                depth={node.depth}
                hasChildren={!!node.data.children?.length}
              />
            </foreignObject>
          ))}
        </g>
      </svg>
    </div>
  );
}

function Monolith() {
  return (
    <motion.div
      key="monolith"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.45 }}
      className="flex w-[360px] flex-col items-center gap-3 rounded-2xl border-2 border-red-400/40 bg-red-400/[0.06] px-8 py-10"
    >
      <span className="text-xs uppercase tracking-[0.2em] text-red-300/70">one giant file</span>
      <span className="font-mono text-lg text-white/80">{MONOLITH.name}</span>
      <span className="font-mono text-5xl font-semibold text-red-300">{MONOLITH_TOKENS.toLocaleString()}</span>
      <span className="text-sm text-red-300/70">tokens — every flow, every time</span>
      <span className="text-xs text-red-300/40">{MONOLITH.lines.toLocaleString()} lines</span>
    </motion.div>
  );
}

function TokensLoadedBar({ linesLoaded }: { linesLoaded: number }) {
  const tokensLoaded = tokensFor(linesLoaded);
  const { spring, display } = useSpringNumber(tokensLoaded, { stiffness: 90, damping: 20, mass: 0.7 });
  const width = useTransform(spring, (v) => `${Math.min((v / MONOLITH_TOKENS) * 100, 100)}%`);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm uppercase tracking-wide text-white/50">tokens loaded</span>
        <span className="font-mono text-2xl text-amber-300">{display}</span>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full rounded-full bg-amber-400" style={{ width }} />
      </div>
      <p className="mt-1.5 text-sm text-white/30">
        vs. {MONOLITH_TOKENS.toLocaleString()} tokens ({MONOLITH.lines.toLocaleString()} lines) if it stayed one file
      </p>
    </div>
  );
}

export function SpecSplitTree() {
  const { beat } = useBeats({ total: BEATS.length });
  const config = BEATS[beat];
  const activeIds = new Set(config.activeIds);

  return (
    <SceneChrome
      label="Progressive Disclosure — Splitting Specs"
      totalBeats={BEATS.length}
      currentBeat={beat}
      caption={config.caption}
    >
      <div className="flex w-full max-w-[1400px] items-center gap-6">
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {config.phase === "monolith" ? <Monolith /> : <SpecTree activeIds={activeIds} />}
          </AnimatePresence>
        </div>

        <div className="flex w-60 shrink-0 flex-col gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.15em] text-white/40">Agent task</p>

          <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wide text-white/30">question</p>
            <p className="mt-1 text-base leading-snug text-white/80">
              {config.task ?? "no task yet"}
            </p>
          </div>

          <TokensLoadedBar linesLoaded={config.linesLoaded} />

          <AnimatePresence>
            {config.showPayoff && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3"
              >
                <p className="font-mono text-3xl font-semibold text-emerald-300">{SAVINGS_PCT}%</p>
                <p className="mt-1 text-sm text-emerald-300/80">less loaded for the same answer</p>
                <p className="mt-1.5 font-mono text-xs text-emerald-300/60">
                  {MONOLITH_TOKENS.toLocaleString()} → {FULL_TRAVERSAL_TOKENS.toLocaleString()} tokens
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SceneChrome>
  );
}
