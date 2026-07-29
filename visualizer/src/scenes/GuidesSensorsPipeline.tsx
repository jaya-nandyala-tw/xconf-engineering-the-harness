import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBeats } from "../lib/useBeats";
import { SceneChrome } from "../components/SceneChrome";

type StageId = "guides" | "agent" | "sensors" | "outcome";
type SensorState = "pending" | "pass" | "fail";
type LoopKind = "none" | "autofix" | "confirm-wait" | "confirm-resume";

const STAGES: { id: StageId; label: string; color: string }[] = [
  { id: "guides", label: "Guides", color: "#60a5fa" },
  { id: "agent", label: "Perform Task", color: "#e5e7eb" },
  { id: "sensors", label: "Sensors", color: "#34d399" },
  { id: "outcome", label: "Outcome", color: "#e5e7eb" },
];
const STAGE_ORDER: StageId[] = ["guides", "agent", "sensors", "outcome"];

// type check -> lint -> test -> architecture rule, straight from the talk's own
// mini feedback-loop diagram: Guides -> agent generates code -> Sensors -> pass/fail.
const SENSOR_LABELS = ["type check", "lint", "test", "arch rule"];

const GUIDE_DETAIL = ["scoped instructions loaded", "least-privilege agent selected"];

// Vertical flow geometry — hardcoded so the SVG (straight connectors + curved feedback
// loop) can line up exactly with the foreignObject stage nodes drawn inside it.
const CARD_W = 170;
const CARD_H = 80;
const STRIDE = 150; // card height + vertical gap for the connector arrow
const GUIDES_Y = 0;
const AGENT_Y = STRIDE;
const SENSORS_Y = STRIDE * 2;
const OUTCOME_Y = STRIDE * 3;
const AGENT_CENTER_Y = AGENT_Y + CARD_H / 2;
const SENSORS_CENTER_Y = SENSORS_Y + CARD_H / 2;
const WAYPOINT_X = CARD_W + 100;
const WAYPOINT_Y = (AGENT_CENTER_Y + SENSORS_CENTER_Y) / 2;
const SVG_W = WAYPOINT_X + 30;
const SVG_H = OUTCOME_Y + CARD_H;

const PATH_A = `M ${CARD_W} ${SENSORS_CENTER_Y} C ${CARD_W + 70} ${SENSORS_CENTER_Y}, ${WAYPOINT_X} ${WAYPOINT_Y + 70}, ${WAYPOINT_X} ${WAYPOINT_Y}`;
const PATH_B = `M ${WAYPOINT_X} ${WAYPOINT_Y} C ${WAYPOINT_X} ${WAYPOINT_Y - 70}, ${CARD_W + 70} ${AGENT_CENTER_Y}, ${CARD_W} ${AGENT_CENTER_Y}`;

interface Beat {
  request: string | null;
  active: StageId | null;
  showGuideDetail?: boolean;
  code?: string[];
  sensors?: SensorState[];
  errorText?: string;
  outcomePass?: boolean;
  loop: LoopKind;
  loopNote?: string;
  caption: string;
}

const REQUEST_1 = "Add pagination to the settings list";
const REQUEST_2 = "Rename userId to accountId across the billing service";
const REQUEST_3 = "Round discounts up instead of down (finance policy change)";

const BEATS: Beat[] = [
  {
    request: null,
    active: null,
    loop: "none",
    caption: "Guides steer before. Sensors check after. Not every failure gets fixed the same way.",
  },
  // --- Run 1: simple, single-file, silent pass ---
  { request: REQUEST_1, active: null, loop: "none", caption: "A request comes in." },
  {
    request: REQUEST_1,
    active: "guides",
    showGuideDetail: true,
    loop: "none",
    caption: "Guides fire first — before a token of code exists.",
  },
  {
    request: REQUEST_1,
    active: "agent",
    code: ["~ settings/list.tsx"],
    loop: "none",
    caption: "The agent performs the task, working inside whatever the guides allowed.",
  },
  {
    request: REQUEST_1,
    active: "sensors",
    sensors: ["pass", "pass", "pass", "pass"],
    loop: "none",
    caption: "Sensors check after — type check, lint, test, architecture rule.",
  },
  {
    request: REQUEST_1,
    active: "outcome",
    outcomePass: true,
    loop: "none",
    caption: "Silent success — nothing left to manually steer before it reaches review.",
  },
  // --- Run 2: multi-file change, a real cross-file bug, auto-fix loop ---
  {
    request: REQUEST_2,
    active: null,
    loop: "none",
    caption: "A bigger change: 3 files, one rename, rippling outward.",
  },
  {
    request: REQUEST_2,
    active: "guides",
    showGuideDetail: true,
    loop: "none",
    caption: "Same guides, every time — the change being bigger doesn't skip them.",
  },
  {
    request: REQUEST_2,
    active: "agent",
    code: ["~ billing/handler.ts", "~ billing/serializer.ts", "~ billing/types.ts"],
    loop: "none",
    caption: "Three files touched. A field renamed everywhere the agent could see it.",
  },
  {
    request: REQUEST_2,
    active: "sensors",
    sensors: ["pass", "pass", "fail", "pending"],
    errorText:
      "invoicing/invoice-builder.test.ts — Cannot read 'userId': billing payload renamed, downstream consumer wasn't updated",
    loop: "none",
    caption: "A test fails — but not one of the 3 files the agent touched.",
  },
  {
    request: REQUEST_2,
    active: "sensors",
    sensors: ["pass", "pass", "fail", "pending"],
    errorText:
      "invoicing/invoice-builder.test.ts — Cannot read 'userId': billing payload renamed, downstream consumer wasn't updated",
    loop: "autofix",
    loopNote: "Auto-fix — same bug class, safe to self-correct.",
    caption: "This is still just code consistency, not a judgment call — the agent can close this loop itself.",
  },
  {
    request: REQUEST_2,
    active: "agent",
    code: ["~ billing/handler.ts", "~ billing/serializer.ts", "~ billing/types.ts", "+ invoicing/invoice-builder.ts"],
    loop: "none",
    caption: "The agent finds the downstream file it missed and updates it too.",
  },
  {
    request: REQUEST_2,
    active: "sensors",
    sensors: ["pass", "pass", "pass", "pass"],
    loop: "none",
    caption: "Sensors run again — the rename is now consistent everywhere.",
  },
  {
    request: REQUEST_2,
    active: "outcome",
    outcomePass: true,
    loop: "none",
    caption: "Closed on its own. No policy decision was needed, just completeness.",
  },
  // --- Run 3: multi-file change, an outdated test, human-confirm loop ---
  {
    request: REQUEST_3,
    active: null,
    loop: "none",
    caption: "A different kind of change: not a bug fix, a policy change.",
  },
  {
    request: REQUEST_3,
    active: "guides",
    showGuideDetail: true,
    loop: "none",
    caption: "Guides fire the same way, regardless of what kind of change this is.",
  },
  {
    request: REQUEST_3,
    active: "agent",
    code: ["~ pricing/discount.ts", "~ pricing/calculator.ts", "~ pricing/constants.ts"],
    loop: "none",
    caption: "Three files touched again — this time, implementing a real finance requirement.",
  },
  {
    request: REQUEST_3,
    active: "sensors",
    sensors: ["pass", "pass", "fail", "pending"],
    errorText: "checkout/checkout.test.ts — expected 18.00, got 17.99: assertion still encodes the old rounding rule",
    loop: "none",
    caption: "A test fails again — but read the error. The code isn't wrong. The test is stale.",
  },
  {
    request: REQUEST_3,
    active: "sensors",
    sensors: ["pass", "pass", "fail", "pending"],
    errorText: "checkout/checkout.test.ts — expected 18.00, got 17.99: assertion still encodes the old rounding rule",
    loop: "confirm-wait",
    loopNote: "Human confirm — awaiting sign-off. Overriding what a test expects changes what \"correct\" means.",
    caption: "That doesn't get to auto-fix — a person has to look at this one.",
  },
  {
    request: REQUEST_3,
    active: "sensors",
    sensors: ["pass", "pass", "fail", "pending"],
    errorText: "checkout/checkout.test.ts — expected 18.00, got 17.99: assertion still encodes the old rounding rule",
    loop: "confirm-resume",
    loopNote: "Human confirm — approved, resuming. The test was outdated, not the code.",
    caption: "A person confirms it. Only then does the agent touch the test.",
  },
  {
    request: REQUEST_3,
    active: "agent",
    code: ["~ pricing/discount.ts", "~ pricing/calculator.ts", "~ pricing/constants.ts", "~ checkout/checkout.test.ts"],
    loop: "none",
    caption: "With sign-off in hand, the agent updates the test to match the new, approved rule.",
  },
  {
    request: REQUEST_3,
    active: "sensors",
    sensors: ["pass", "pass", "pass", "pass"],
    loop: "none",
    caption: "Sensors run again — clean, and nothing was overridden without a person saying so.",
  },
  {
    request: REQUEST_3,
    active: "outcome",
    outcomePass: true,
    loop: "none",
    caption: "Two failures, two different loops. One closed itself. One waited for a person — on purpose.",
  },
];

function StageNode({
  id,
  label,
  color,
  status,
  beat,
}: {
  id: StageId;
  label: string;
  color: string;
  status: "pending" | "active" | "done";
  beat: Beat;
}) {
  const isActive = status === "active";
  const dotColor =
    id === "sensors" && beat.sensors
      ? beat.sensors.some((s) => s === "fail")
        ? "#f87171"
        : "#34d399"
      : undefined;

  return (
    <foreignObject x={0} y={STAGE_Y[id]} width={CARD_W} height={CARD_H}>
      <motion.div
        animate={{
          borderColor: isActive ? color : status === "done" ? `${color}50` : "rgba(255,255,255,0.08)",
          backgroundColor: isActive ? `${color}14` : "rgba(255,255,255,0.02)",
          boxShadow: isActive ? `0 0 22px ${color}30` : "0 0 0px rgba(0,0,0,0)",
          opacity: status === "pending" ? 0.35 : 1,
        }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
        className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 text-center"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.13em]" style={{ color }}>
          {label}
        </span>
        {id === "sensors" && isActive && beat.sensors && (
          <div className="flex items-center gap-1">
            {beat.sensors.map((s, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: s === "pass" ? "#34d399" : s === "fail" ? "#f87171" : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
        )}
        {id === "sensors" && !isActive && dotColor && (
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
        )}
        {id === "agent" && isActive && beat.code && (
          <span className="font-mono text-[10px] text-white/40">{beat.code.length} file{beat.code.length > 1 ? "s" : ""}</span>
        )}
        {id === "outcome" && beat.outcomePass && <span className="text-lg text-emerald-300">✓</span>}
      </motion.div>
    </foreignObject>
  );
}

const STAGE_Y: Record<StageId, number> = {
  guides: GUIDES_Y,
  agent: AGENT_Y,
  sensors: SENSORS_Y,
  outcome: OUTCOME_Y,
};

function MainConnector({ from, to, lit }: { from: number; to: number; lit: boolean }) {
  const x = CARD_W / 2;
  return (
    <motion.path
      d={`M ${x} ${from} L ${x} ${to}`}
      fill="none"
      animate={{ stroke: lit ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.1)" }}
      strokeWidth={2}
      markerEnd={lit ? "url(#main-arrow)" : undefined}
      transition={{ duration: 0.3 }}
    />
  );
}

function WaypointIcon({ state }: { state: "wait" | "approved" }) {
  const color = state === "approved" ? "#34d399" : "#60a5fa";
  return (
    <foreignObject x={WAYPOINT_X - 20} y={WAYPOINT_Y - 20} width={40} height={40}>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1, borderColor: color }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
        className="flex h-full w-full items-center justify-center rounded-full border-2 text-sm"
        style={{ backgroundColor: state === "approved" ? "rgba(52,211,153,0.15)" : "rgba(96,165,250,0.12)", color }}
      >
        {state === "approved" ? "✓" : "⏸"}
      </motion.div>
    </foreignObject>
  );
}

function FeedbackLoop({ loop }: { loop: LoopKind }) {
  const visible = loop !== "none";
  const arcColor = loop === "confirm-resume" ? "#34d399" : "#60a5fa";
  const pathBTarget = loop === "autofix" || loop === "confirm-resume" ? 1 : 0;
  const showWaypoint = loop === "confirm-wait" || loop === "confirm-resume";

  const [arrowReady, setArrowReady] = useState(false);
  useEffect(() => {
    if (pathBTarget === 0) setArrowReady(false);
  }, [pathBTarget]);

  return (
    <>
      <motion.path
        d={PATH_A}
        fill="none"
        stroke={arcColor}
        strokeWidth={2.5}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
      <motion.path
        d={PATH_B}
        fill="none"
        stroke={arcColor}
        strokeWidth={2.5}
        markerEnd={arrowReady ? "url(#loop-arrow)" : undefined}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: pathBTarget, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.7, ease: "easeInOut", delay: loop === "confirm-resume" ? 0.15 : 0 }}
        onAnimationComplete={() => {
          if (pathBTarget === 1) setArrowReady(true);
        }}
      />
      <AnimatePresence>
        {showWaypoint && <WaypointIcon key="waypoint" state={loop === "confirm-resume" ? "approved" : "wait"} />}
      </AnimatePresence>
    </>
  );
}

function WorkflowDiagram({ config, activeIndex }: { config: Beat; activeIndex: number }) {
  const arcColor = config.loop === "confirm-resume" ? "#34d399" : "#60a5fa";
  return (
    <div className="relative rounded-[28px] border-2 border-white/10 bg-white/[0.02] px-7 pb-7 pt-11">
      <span className="absolute left-7 top-4 font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
        Agentic Workflow
      </span>
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="overflow-visible">
        <defs>
          <marker id="main-arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="rgba(255,255,255,0.45)" />
          </marker>
          <marker id="loop-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={arcColor} />
          </marker>
        </defs>

        <MainConnector from={CARD_H} to={AGENT_Y} lit={activeIndex >= 1} />
        <MainConnector from={AGENT_Y + CARD_H} to={SENSORS_Y} lit={activeIndex >= 2} />
        <MainConnector from={SENSORS_Y + CARD_H} to={OUTCOME_Y} lit={activeIndex >= 3} />

        <FeedbackLoop loop={config.loop} />

        {STAGES.map((stage, i) => (
          <StageNode
            key={stage.id}
            id={stage.id}
            label={stage.label}
            color={stage.color}
            status={i === activeIndex ? "active" : i < activeIndex ? "done" : "pending"}
            beat={config}
          />
        ))}
      </svg>
    </div>
  );
}

function RequestBubble({ text }: { text: string | null }) {
  return (
    <div className="flex min-h-[52px] items-center">
      <AnimatePresence mode="wait">
        {text && (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-lg text-white/80"
          >
            <span className="mr-2 font-mono text-xs uppercase tracking-wide text-white/40">request</span>
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SensorRow({ label, state }: { label: string; state: SensorState }) {
  const tone =
    state === "pass"
      ? { bg: "rgba(52,211,153,0.16)", border: "rgba(52,211,153,0.6)", text: "#6ee7b7" }
      : state === "fail"
        ? { bg: "rgba(248,113,113,0.16)", border: "rgba(248,113,113,0.65)", text: "#fca5a5" }
        : { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.1)", text: "rgba(255,255,255,0.35)" };
  return (
    <motion.div
      animate={{ backgroundColor: tone.bg, borderColor: tone.border }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs"
    >
      <span style={{ color: tone.text }}>{state === "pass" ? "✓" : state === "fail" ? "✗" : "·"}</span>
      <span style={{ color: tone.text }}>{label}</span>
    </motion.div>
  );
}

function DetailPanel({ config }: { config: Beat }) {
  const stage = STAGES.find((s) => s.id === config.active);

  return (
    <div className="flex min-h-[420px] w-full flex-col gap-5 text-left">
      <RequestBubble text={config.request} />

      <AnimatePresence mode="wait">
        {stage && (
          <motion.div
            key={`${config.active}-${config.loop}-${config.code?.join("|")}-${config.sensors?.join("|")}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: stage.color }}>
              {stage.label}
            </span>

            {config.active === "guides" && config.showGuideDetail && (
              <ul className="flex flex-col gap-1.5 text-base text-white/70">
                {GUIDE_DETAIL.map((d) => (
                  <li key={d} className="flex items-center gap-2">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-blue-300" />
                    {d}
                  </li>
                ))}
              </ul>
            )}

            {config.active === "agent" && config.code && (
              <ul className="flex flex-col gap-1 font-mono text-sm leading-relaxed text-emerald-300/85">
                {config.code.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}

            {config.active === "sensors" && config.sensors && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {SENSOR_LABELS.map((label, i) => (
                    <SensorRow key={label} label={label} state={config.sensors![i]} />
                  ))}
                </div>
                {config.errorText && <p className="text-sm leading-snug text-red-300/85">{config.errorText}</p>}
                {config.loopNote && (
                  <p
                    className="text-sm leading-snug"
                    style={{ color: config.loop === "confirm-resume" ? "#6ee7b7" : "#93c5fd" }}
                  >
                    {config.loopNote}
                  </p>
                )}
              </div>
            )}

            {config.active === "outcome" && config.outcomePass && (
              <div className="flex items-center gap-3">
                <span className="text-3xl text-emerald-300">✓</span>
                <span className="text-lg text-emerald-300/85">silent — ready for review</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GuidesSensorsPipeline() {
  const { beat } = useBeats({ total: BEATS.length });
  const config = BEATS[beat];
  const activeIndex = config.active ? STAGE_ORDER.indexOf(config.active) : -1;

  return (
    <SceneChrome
      label="Guides → Sensors — the Feedback Loop"
      totalBeats={BEATS.length}
      currentBeat={beat}
      caption={config.caption}
    >
      <div className="flex w-full max-w-5xl items-start gap-12">
        <WorkflowDiagram config={config} activeIndex={activeIndex} />
        <DetailPanel config={config} />
      </div>
    </SceneChrome>
  );
}
