import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBeats } from "../lib/useBeats";
import { useSceneNav } from "../lib/useSceneNav";
import { SceneChrome } from "../components/SceneChrome";
import { useTheme, inkHex, inkRgba, inkTextRgba, toneText, diagramTextHex } from "../lib/theme";

// STAGES' "#e5e7eb" is a near-white neutral — fine on the dark wave backdrop, invisible
// on light mist, so it swaps for the dark-slate equivalent. The violet/green stage colors
// are vivid enough to read fine on wave (4.3-6.8:1) but drop to ~1.5-2.4:1 on light mist —
// diagramTextHex has the measured, darkened replacements for those.
function resolveStageColor(hex: string, isLight: boolean): string {
  if (hex === "#e5e7eb") return inkHex(isLight);
  return diagramTextHex(hex, isLight);
}

// The real ai-workflows 6-phase pipeline (ai-dev-workflow.md) instead of one generic
// "agent performs task" step — ANALYZE/BLUEPRINT are the Guides half (steer before code
// exists), RED/GREEN/REFACTOR/REVIEW are the Sensors half (a pass/fail verdict gates every
// phase). One story runs the whole thing once; both feedback loops occur inside it.
type StageId = "analyze" | "blueprint" | "red" | "green" | "refactor" | "review" | "outcome";
type LoopKind = "none" | "confirm-wait" | "confirm-resume" | "gap-loop";
type Verdict = "pass" | "fail";

const STAGES: { id: StageId; label: string; agent: string; color: string }[] = [
  { id: "analyze", label: "Analyze", agent: "Story Analysis", color: "#a78bfa" },
  { id: "blueprint", label: "Blueprint", agent: "Architect", color: "#a78bfa" },
  { id: "red", label: "Red", agent: "/quality", color: "#4ade80" },
  { id: "green", label: "Green", agent: "/implementer", color: "#4ade80" },
  { id: "refactor", label: "Refactor", agent: "/refactor-cleaner", color: "#4ade80" },
  { id: "review", label: "Review", agent: "/quality verify", color: "#4ade80" },
  { id: "outcome", label: "Outcome", agent: "", color: "#e5e7eb" },
];
const STAGE_ORDER: StageId[] = STAGES.map((s) => s.id);

interface RepoRow {
  repo: string;
  role: string;
}

interface Beat {
  request: string | null;
  active: StageId | null;
  pass?: 2;
  verdict?: Verdict;
  guideDetail?: string[];
  repoTable?: RepoRow[];
  confirmState?: "draft" | "waiting" | "approved";
  filesLabel?: string;
  files?: string[];
  note?: string;
  gapFile?: string;
  gapNote?: string;
  outcomeLines?: [string, string];
  loop: LoopKind;
  loopNote?: string;
  caption: string;
}

const REQUEST = "Let customers save a card and reuse it at checkout";

const REPO_TABLE: RepoRow[] = [
  { repo: "storefront-web", role: "UI" },
  { repo: "checkout-bff", role: "BFF" },
  { repo: "payments-service", role: "Domain" },
];

const BEATS: Beat[] = [
  {
    request: null,
    active: null,
    loop: "none",
    caption: "Guides before, sensors after — now watch a real 6-phase pipeline run one story end to end.",
  },
  {
    request: REQUEST,
    active: null,
    loop: "none",
    caption: "One story touches three layers: storefront UI, checkout BFF, payments service.",
  },
  // --- Phase 1: ANALYZE (Guides) ---
  {
    request: REQUEST,
    active: "analyze",
    guideDetail: [
      "Input Collection Gate confirmed — Jira: yes, UI design: skipped → default recorded",
      "Cross-referenced the architecture overview — flags all 3 layers",
    ],
    verdict: "pass",
    loop: "none",
    caption: "Guides fire immediately — a structured intake before a single file is touched.",
  },
  // --- Phase 2: BLUEPRINT (Guides) — human-confirm loop ---
  {
    request: REQUEST,
    active: "blueprint",
    repoTable: REPO_TABLE,
    confirmState: "draft",
    loop: "none",
    caption: "The Architect traces the story through the codebase — and finds three repos, not one.",
  },
  {
    request: REQUEST,
    active: "blueprint",
    repoTable: REPO_TABLE,
    confirmState: "waiting",
    loop: "confirm-wait",
    loopNote: "Multi-Repo Confirmation Gate — blocking. Nothing gets written until a human answers.",
    caption: "Touching three repos at once is exactly what this gate exists to catch.",
  },
  {
    request: REQUEST,
    active: "blueprint",
    repoTable: REPO_TABLE,
    confirmState: "approved",
    loop: "confirm-resume",
    loopNote: "Confirmed — 3 repos, file plan drafted for each.",
    caption: "Confirmed. Only now does the blueprint get written.",
  },
  // --- Phase 3: RED (Sensors, pass 1) ---
  {
    request: REQUEST,
    active: "red",
    filesLabel: "Tests written — one per AC",
    files: [
      "+ storefront-web/checkout/SavedPaymentMethods.test.tsx",
      "+ checkout-bff/checkout/payment-methods.resolver.test.ts",
      "+ payments-service/payment-methods/service.test.ts",
    ],
    verdict: "pass",
    loop: "none",
    caption: "Phase gate one: tests are written before any code exists — and all of them fail. That's correct.",
  },
  // --- Phase 4: GREEN (Sensors, pass 1) ---
  {
    request: REQUEST,
    active: "green",
    filesLabel: "Production code",
    files: [
      "+ storefront-web/checkout/SavedPaymentMethods.tsx",
      "+ checkout-bff/checkout/payment-methods.resolver.ts",
      "+ payments-service/payment-methods/service.ts",
      "+ payments-service/payment-methods/migrations/002_add_payment_methods.ts",
    ],
    verdict: "pass",
    loop: "none",
    caption: "Just enough code to turn every test green. The tests themselves never change.",
  },
  // --- Phase 5: REFACTOR (Sensors) ---
  {
    request: REQUEST,
    active: "refactor",
    note: "Extracted shared card-validation helper into payments-service/payment-methods/validation.ts — no behavior change.",
    verdict: "pass",
    loop: "none",
    caption: "Structure improves, behavior doesn't — tests re-run after every small change.",
  },
  // --- Phase 6: REVIEW (Sensors, pass 1) — coverage gap, auto-fix loop ---
  {
    request: REQUEST,
    active: "review",
    gapFile: "checkout-bff/checkout/payment-methods.resolver.ts",
    gapNote: "AC-4 (graceful decline when payments-service is unreachable) has no covering test.",
    verdict: "fail",
    loop: "none",
    caption: "One more gate before a PR exists — coverage, lint, types. This time it finds a gap.",
  },
  {
    request: REQUEST,
    active: "review",
    gapFile: "checkout-bff/checkout/payment-methods.resolver.ts",
    gapNote: "AC-4 (graceful decline when payments-service is unreachable) has no covering test.",
    verdict: "fail",
    loop: "gap-loop",
    loopNote: "Coverage gap — not a bug, a missing test. Safe to close without a person.",
    caption: "This doesn't need a human — it's still just completeness, so the loop closes itself.",
  },
  // --- Loop back: RED / GREEN, pass 2 (condensed) ---
  {
    request: REQUEST,
    active: "red",
    pass: 2,
    filesLabel: "Test added — the missing edge case",
    files: ["+ checkout-bff/checkout/payment-methods.resolver.test.ts — edge case: payments-service unreachable"],
    verdict: "pass",
    loop: "none",
    caption: "/quality adds the one missing test — just the error path.",
  },
  {
    request: REQUEST,
    active: "green",
    pass: 2,
    filesLabel: "Handling added",
    files: ["~ checkout-bff/checkout/payment-methods.resolver.ts — graceful decline on domain-service failure"],
    verdict: "pass",
    loop: "none",
    caption: "/implementer adds the missing handling — nothing else changes.",
  },
  // --- Phase 6: REVIEW, pass 2 ---
  {
    request: REQUEST,
    active: "review",
    pass: 2,
    verdict: "pass",
    loop: "none",
    caption: "Sensors run again — coverage, lint, and types all clean.",
  },
  // --- Outcome ---
  {
    request: REQUEST,
    active: "outcome",
    outcomeLines: ["PR opened — AC coverage table across all 3 repos", "ready for human review"],
    loop: "none",
    caption:
      "Two loops, closed two ways — a person confirmed the blast radius, the agent closed the coverage gap. Only then does it stop.",
  },
];

// Horizontal row of 7 stage cards — a 7-node vertical stack would run too tall for a
// wide slide, and a row also mirrors ai-dev-workflow.md's own left-to-right phase diagram.
const CARD_W = 128;
const CARD_H = 64;
const GAP_X = 34;
const STRIDE_X = CARD_W + GAP_X;
const ROW_Y = 48; // headroom for the Blueprint confirm badge above the row
const LOOP_ARC_DEPTH = 64;
const SVG_W = (STAGES.length - 1) * STRIDE_X + CARD_W;
const SVG_H = ROW_Y + CARD_H + LOOP_ARC_DEPTH + 16;

function stageX(index: number): number {
  return index * STRIDE_X;
}
function stageCenterX(index: number): number {
  return stageX(index) + CARD_W / 2;
}

const BLUEPRINT_INDEX = STAGE_ORDER.indexOf("blueprint");
const RED_INDEX = STAGE_ORDER.indexOf("red");
const REVIEW_INDEX = STAGE_ORDER.indexOf("review");

const ROW_MID_Y = ROW_Y + CARD_H / 2;
const ROW_BOTTOM_Y = ROW_Y + CARD_H;
const GAP_LOOP_PATH = `M ${stageCenterX(REVIEW_INDEX)} ${ROW_BOTTOM_Y} C ${stageCenterX(REVIEW_INDEX)} ${
  ROW_BOTTOM_Y + LOOP_ARC_DEPTH
}, ${stageCenterX(RED_INDEX)} ${ROW_BOTTOM_Y + LOOP_ARC_DEPTH}, ${stageCenterX(RED_INDEX)} ${ROW_BOTTOM_Y}`;

// Latest known verdict per stage, folded up to (and including) the current beat — so a
// phase's pass/fail dot keeps reading once the pipeline has moved on, giving the row a
// scoreboard feel by the time it reaches Outcome instead of losing history as it advances.
function computeVerdicts(uptoBeat: number): Partial<Record<StageId, Verdict>> {
  const acc: Partial<Record<StageId, Verdict>> = {};
  for (let i = 0; i <= uptoBeat; i++) {
    const b = BEATS[i];
    if (b.active && b.verdict) acc[b.active] = b.verdict;
  }
  return acc;
}

function StageNode({
  index,
  label,
  agent,
  color,
  status,
  verdict,
  isLight,
}: {
  index: number;
  label: string;
  agent: string;
  color: string;
  status: "pending" | "active" | "done";
  verdict?: Verdict;
  isLight: boolean;
}) {
  const isActive = status === "active";
  const resolvedColor = resolveStageColor(color, isLight);
  const dotColor = verdict ? (verdict === "pass" ? "#4ade80" : "#f87171") : undefined;

  return (
    <foreignObject x={stageX(index)} y={ROW_Y} width={CARD_W} height={CARD_H}>
      <motion.div
        animate={{
          borderColor: isActive ? resolvedColor : status === "done" ? `${resolvedColor}50` : inkRgba(isLight, 0.08),
          backgroundColor: isActive ? `${resolvedColor}14` : inkRgba(isLight, 0.02),
          boxShadow: isActive ? `0 0 22px ${resolvedColor}30` : "0 0 0px rgba(0,0,0,0)",
          opacity: status === "pending" ? 0.35 : 1,
        }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
        className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-2xl border px-2 text-center"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: resolvedColor }}>
          {label}
        </span>
        {agent && <span className="font-mono text-[9px] text-ink/40">{agent}</span>}
        {dotColor && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />}
      </motion.div>
    </foreignObject>
  );
}

function MainConnector({ index, lit, isLight }: { index: number; lit: boolean; isLight: boolean }) {
  const y = ROW_MID_Y;
  const x1 = stageX(index) + CARD_W;
  const x2 = stageX(index + 1);
  return (
    <motion.path
      d={`M ${x1} ${y} L ${x2} ${y}`}
      fill="none"
      animate={{ stroke: lit ? inkRgba(isLight, 0.45) : inkRgba(isLight, 0.1) }}
      strokeWidth={2}
      markerEnd={lit ? "url(#main-arrow)" : undefined}
      transition={{ duration: 0.3 }}
    />
  );
}

function ConfirmBadge({ state }: { state: "waiting" | "approved" }) {
  const color = state === "approved" ? "#4ade80" : "#a78bfa";
  const size = 32;
  const x = stageCenterX(BLUEPRINT_INDEX) - size / 2;
  const y = ROW_Y - size - 12;
  return (
    <foreignObject x={x} y={y} width={size} height={size}>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1, borderColor: color }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
        className="flex h-full w-full items-center justify-center rounded-full border-2 text-sm"
        style={{ backgroundColor: state === "approved" ? "rgba(52,211,153,0.15)" : "rgba(96,165,250,0.12)", color }}
      >
        {state === "approved" ? "✓" : "⏸"}
      </motion.div>
    </foreignObject>
  );
}

function GapLoopArc({ visible }: { visible: boolean }) {
  const [arrowReady, setArrowReady] = useState(false);
  useEffect(() => {
    if (!visible) setArrowReady(false);
  }, [visible]);

  return (
    <motion.path
      d={GAP_LOOP_PATH}
      fill="none"
      stroke="#a78bfa"
      strokeWidth={2.5}
      markerEnd={arrowReady ? "url(#loop-arrow)" : undefined}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (visible) setArrowReady(true);
      }}
    />
  );
}

function WorkflowDiagram({
  config,
  beat,
  activeIndex,
  isLight,
}: {
  config: Beat;
  beat: number;
  activeIndex: number;
  isLight: boolean;
}) {
  const showConfirmBadge = config.loop === "confirm-wait" || config.loop === "confirm-resume";
  const showGapLoop = config.loop === "gap-loop";
  const verdicts = computeVerdicts(beat);

  return (
    <div className="relative w-full overflow-x-auto rounded-[28px] border-2 border-ink/10 bg-ink/[0.02] px-7 pb-5 pt-9">
      <span className="absolute left-7 top-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/35">
        ai-workflows — 6-Phase Pipeline
      </span>
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="mx-auto block overflow-visible">
        <defs>
          <marker id="main-arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={inkRgba(isLight, 0.45)} />
          </marker>
          <marker id="loop-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#a78bfa" />
          </marker>
        </defs>

        {STAGES.slice(0, -1).map((_, i) => (
          <MainConnector key={i} index={i} lit={activeIndex >= i + 1} isLight={isLight} />
        ))}

        <GapLoopArc visible={showGapLoop} />

        <AnimatePresence>
          {showConfirmBadge && (
            <ConfirmBadge key="confirm-badge" state={config.loop === "confirm-resume" ? "approved" : "waiting"} />
          )}
        </AnimatePresence>

        {STAGES.map((stage, i) => (
          <StageNode
            key={stage.id}
            index={i}
            label={stage.label}
            agent={stage.agent}
            color={stage.color}
            status={i === activeIndex ? "active" : i < activeIndex ? "done" : "pending"}
            verdict={verdicts[stage.id]}
            isLight={isLight}
          />
        ))}
      </svg>
    </div>
  );
}

function RequestBubble({ text }: { text: string | null }) {
  return (
    <div className="flex min-h-[44px] items-center">
      <AnimatePresence mode="wait">
        {text && (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-ink/10 bg-ink/[0.04] px-4 py-2 text-base text-ink/80"
          >
            <span className="mr-2 font-mono text-xs uppercase tracking-wide text-ink/40">request</span>
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfirmStateBadge({ state, isLight }: { state: "draft" | "waiting" | "approved"; isLight: boolean }) {
  const tone =
    state === "approved"
      ? { bg: "rgba(52,211,153,0.16)", border: "rgba(52,211,153,0.6)", text: isLight ? "#0f766e" : "#86efac" }
      : state === "waiting"
        ? { bg: "rgba(167,139,250,0.16)", border: "rgba(167,139,250,0.6)", text: isLight ? "#5b21b6" : "#c4b5fd" }
        : { bg: inkRgba(isLight, 0.03), border: inkRgba(isLight, 0.1), text: inkTextRgba(isLight, 0.45) };
  const labelText = state === "approved" ? "confirmed ✓" : state === "waiting" ? "awaiting confirmation" : "drafting…";
  return (
    <span
      className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs"
      style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.text }}
    >
      {labelText}
    </span>
  );
}

function VerdictBadge({ verdict, label, isLight }: { verdict: Verdict; label: string; isLight: boolean }) {
  const tone =
    verdict === "pass"
      ? { bg: "rgba(52,211,153,0.16)", border: "rgba(52,211,153,0.6)", text: isLight ? "#0f766e" : "#86efac" }
      : { bg: "rgba(248,113,113,0.16)", border: "rgba(248,113,113,0.65)", text: isLight ? "#b91c1c" : "#fca5a5" };
  return (
    <span
      className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs"
      style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.text }}
    >
      {verdict === "pass" ? "✓" : "✗"} {label}
    </span>
  );
}

function DetailPanel({ config, beat, isLight }: { config: Beat; beat: number; isLight: boolean }) {
  const stage = STAGES.find((s) => s.id === config.active);

  return (
    <div className="flex w-full flex-col gap-3 text-left">
      <RequestBubble text={config.request} />

      <AnimatePresence mode="wait">
        {stage && (
          <motion.div
            key={beat}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-[152px] flex-col gap-3 rounded-2xl border border-ink/10 bg-ink/[0.02] p-5"
          >
            <span
              className="text-xs font-semibold uppercase tracking-[0.15em]"
              style={{ color: resolveStageColor(stage.color, isLight) }}
            >
              {stage.label}
              {stage.agent && <span className="ml-2 font-mono text-ink/40">· {stage.agent}</span>}
              {config.pass === 2 && <span className="ml-2 text-ink/40">· 2nd pass</span>}
            </span>

            {config.active === "analyze" && config.guideDetail && (
              <>
                <ul className="flex flex-col gap-1 text-sm text-ink/70">
                  {config.guideDetail.map((d) => (
                    <li key={d} className="flex items-center gap-2">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-blue-300" />
                      {d}
                    </li>
                  ))}
                </ul>
                {config.verdict && <VerdictBadge verdict={config.verdict} label="READY" isLight={isLight} />}
              </>
            )}

            {config.active === "blueprint" && config.repoTable && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {config.repoTable.map((r) => (
                    <span
                      key={r.repo}
                      className="rounded-full border border-ink/15 bg-ink/[0.03] px-3 py-1 font-mono text-xs text-ink/75"
                    >
                      {r.repo} <span className="text-ink/40">· {r.role}</span>
                    </span>
                  ))}
                </div>
                {config.confirmState && <ConfirmStateBadge state={config.confirmState} isLight={isLight} />}
                {config.loopNote && (
                  <p
                    className="text-sm leading-snug"
                    style={{
                      color:
                        config.loop === "confirm-resume" ? (isLight ? "#0f766e" : "#86efac") : isLight ? "#5b21b6" : "#c4b5fd",
                    }}
                  >
                    {config.loopNote}
                  </p>
                )}
              </div>
            )}

            {(config.active === "red" || config.active === "green") && config.files && (
              <div className="flex flex-col gap-2">
                {config.filesLabel && (
                  <span className="text-xs uppercase tracking-wide text-ink/40">{config.filesLabel}</span>
                )}
                <ul
                  className={`flex flex-col gap-1 font-mono text-xs leading-snug ${
                    config.active === "red"
                      ? isLight
                        ? "text-red-800/80"
                        : "text-red-300/80"
                      : isLight
                        ? "text-emerald-800/90"
                        : "text-emerald-300/85"
                  }`}
                >
                  {config.files.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                {config.verdict && (
                  <VerdictBadge
                    verdict={config.verdict}
                    label={
                      config.active === "red"
                        ? `PASS — all ${config.files.length} failing, as expected`
                        : "tests green, build passes, lint clean"
                    }
                    isLight={isLight}
                  />
                )}
              </div>
            )}

            {config.active === "refactor" && (
              <div className="flex flex-col gap-2">
                {config.note && <p className="text-sm leading-snug text-ink/70">{config.note}</p>}
                {config.verdict && (
                  <VerdictBadge verdict={config.verdict} label="tests still green, no behavior change" isLight={isLight} />
                )}
              </div>
            )}

            {config.active === "review" && (
              <div className="flex flex-col gap-2">
                {config.gapFile ? (
                  <>
                    <p className={`text-sm leading-snug ${isLight ? "text-red-800/90" : "text-red-300/85"}`}>
                      {config.gapFile} — {config.gapNote}
                    </p>
                    {config.verdict && <VerdictBadge verdict={config.verdict} label="coverage gap found" isLight={isLight} />}
                    {config.loopNote && (
                      <p className="text-sm leading-snug" style={{ color: isLight ? "#5b21b6" : "#c4b5fd" }}>
                        {config.loopNote}
                      </p>
                    )}
                  </>
                ) : (
                  config.verdict && (
                    <VerdictBadge verdict={config.verdict} label="coverage, lint, and types clean" isLight={isLight} />
                  )
                )}
              </div>
            )}

            {config.active === "outcome" && config.outcomeLines && (
              <div className="flex items-center gap-3">
                <span className={`text-2xl ${toneText(isLight, "emerald")}`}>✓</span>
                <div className={`text-base leading-snug ${isLight ? "text-emerald-800/90" : "text-emerald-300/85"}`}>
                  <div>{config.outcomeLines[0]}</div>
                  <div className="text-ink/50">{config.outcomeLines[1]}</div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GuidesSensorsPipeline() {
  const { initialBeat, onPastEnd, onPastStart, nextHref, nextLabel } = useSceneNav("guides-sensors", BEATS.length);
  const { beat } = useBeats({ total: BEATS.length, initialBeat, onPastEnd, onPastStart });
  const { isLight } = useTheme();
  const config = BEATS[beat];
  const activeIndex = config.active ? STAGE_ORDER.indexOf(config.active) : -1;

  return (
    <SceneChrome
      label="Guides → Sensors — the 6-Phase Pipeline"
      totalBeats={BEATS.length}
      currentBeat={beat}
      caption={config.caption}
      nextHref={nextHref}
      nextLabel={nextLabel}
    >
      <div className="flex w-full max-w-[1180px] flex-col items-center gap-6">
        <WorkflowDiagram config={config} beat={beat} activeIndex={activeIndex} isLight={isLight} />
        <DetailPanel config={config} beat={beat} isLight={isLight} />
      </div>
    </SceneChrome>
  );
}
