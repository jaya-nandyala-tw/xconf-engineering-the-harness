import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBeats } from "../lib/useBeats";
import { useSceneNav } from "../lib/useSceneNav";
import { SceneChrome } from "../components/SceneChrome";

// Real, trimmed wording from ai-workflows' story-analysis-agent skill (Input Collection
// Gate, Step 0) — not invented dialogue. This scene is the greenfield mirror of Guides:
// a fixed intake sequence, a blocking confirmation gate, and a skipped optional input
// resolving to a visible default instead of a silent guess.
//
// The chat-log presentation (accumulating transcript, auto-scroll, latest bubble
// highlighted) intentionally mirrors ContextRotProblem.tsx's ChatLogPanel/ChatLogBubble —
// but is defined locally here, not imported from there, so that file stays untouched.

type Role = "you" | "agent";
type Step = 0 | 1 | 2;

interface Bubble {
  role: Role;
  lines: string[];
  chips?: string[];
}

interface InputsState {
  jira: string;
  techDoc: string;
  gate: string;
}

interface BeatConfig {
  bubble: Bubble;
  step: Step;
  state: InputsState;
  caption: string;
}

const STEP_LABELS = ["Structured intake", "Confirmation gate", "Sensible default"];

const BEATS: BeatConfig[] = [
  {
    bubble: { role: "you", lines: ["/story-analysis PROJ-123"] },
    step: 0,
    state: { jira: "—", techDoc: "—", gate: "—" },
    caption: "Before any fetch, before any context load — a fixed intake sequence starts.",
  },
  {
    bubble: {
      role: "agent",
      lines: ["Confirm inputs first:"],
      chips: ["Jira-only", "Jira + UI", "Jira + Tech"],
    },
    step: 0,
    state: { jira: "—", techDoc: "—", gate: "—" },
    caption: "Structured intake — a fixed order, not left to agent judgment.",
  },
  {
    bubble: { role: "you", lines: ["Jira + Tech"] },
    step: 0,
    state: { jira: "PROJ-123", techDoc: "pending", gate: "—" },
    caption: "One field at a time, in order: Jira first.",
  },
  {
    bubble: { role: "agent", lines: ["Tech Confluence page?"], chips: ["I'll paste it now", "Skip"] },
    step: 0,
    state: { jira: "PROJ-123", techDoc: "pending", gate: "—" },
    caption: "Optional fields still get asked — never silently skipped by the agent.",
  },
  {
    bubble: { role: "you", lines: ["Skip"] },
    step: 0,
    state: { jira: "PROJ-123", techDoc: "skipped", gate: "—" },
    caption: "The human skips it — that choice gets recorded, not guessed at.",
  },
  {
    bubble: {
      role: "agent",
      lines: ["Jira: PROJ-123 · Tech doc: skipped", "Confirm? (non-skippable)"],
      chips: ["Confirm", "Edit", "Restart", "Cancel"],
    },
    step: 1,
    state: { jira: "PROJ-123", techDoc: "skipped", gate: "waiting" },
    caption: "Blocking confirmation gate — presented and answered live, not assumed.",
  },
  {
    bubble: { role: "you", lines: ["Confirm"] },
    step: 1,
    state: { jira: "PROJ-123", techDoc: "skipped", gate: "confirmed" },
    caption: "Only once the human answers does anything downstream start.",
  },
  {
    bubble: {
      role: "agent",
      lines: ["Confluence cross-checked:", "None — user confirmed no technical doc"],
    },
    step: 2,
    state: { jira: "PROJ-123", techDoc: "skipped", gate: "confirmed" },
    caption: "The skipped input resolves to a visible, written-down default — not a silent guess.",
  },
];

function roleStyle(role: Role): string {
  return role === "you" ? "border-ink/15 bg-ink/[0.04] text-ink/85" : "border-flamingo/30 bg-flamingo/10 text-flamingo";
}

function buildChatLog(beats: BeatConfig[], uptoBeat: number): Bubble[] {
  return beats.slice(0, uptoBeat + 1).map((b) => b.bubble);
}

function ChatLogBubble({ bubble, isLatest }: { bubble: Bubble; isLatest: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border px-3 py-2 text-[15px] leading-snug ${roleStyle(bubble.role)} ${
        isLatest ? "ring-1 ring-inset ring-ink/25" : ""
      }`}
    >
      <span className="mr-1.5 font-mono text-[10px] uppercase tracking-wide opacity-50">{bubble.role}</span>
      {bubble.lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
      {bubble.chips && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {bubble.chips.map((chip) => (
            <span key={chip} className="rounded-full border border-ink/20 px-2 py-0.5 text-xs text-ink/60">
              {chip}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ChatLogPanel({ log }: { log: Bubble[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log.length]);

  return (
    <div className="flex h-full w-full flex-col gap-2 rounded-xl border border-ink/10 bg-ink/[0.03] p-4">
      <p className="text-sm uppercase tracking-[0.15em] text-ink/40 shrink-0">Chat — story-analysis-agent</p>
      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {log.map((b, i) => (
            <ChatLogBubble key={i} bubble={b} isLatest={i === log.length - 1} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stepper({ activeStep }: { activeStep: Step }) {
  return (
    <div className="flex w-full items-center gap-2">
      {STEP_LABELS.map((label, i) => (
        <div
          key={label}
          className={`flex-1 rounded-full border px-4 py-2 text-center text-sm font-medium transition-colors ${
            i === activeStep
              ? "border-flamingo bg-flamingo text-white"
              : i < activeStep
                ? "border-jade/40 bg-jade/10 text-jade"
                : "border-ink/15 text-ink/35"
          }`}
        >
          {i + 1} · {label}
        </div>
      ))}
    </div>
  );
}

function StateRow({ label, value }: { label: string; value: string }) {
  const isUnset = value === "—";
  return (
    <div className="flex items-center justify-between border-b border-ink/10 py-2.5 last:border-0">
      <span className="text-sm text-ink/50">{label}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.25 }}
          className={`font-mono text-sm ${isUnset ? "text-ink/25" : "text-ink/90"}`}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function CollectedInputsPanel({ state }: { state: InputsState }) {
  const gateLabel = state.gate === "waiting" ? "waiting for human" : state.gate === "confirmed" ? "confirmed ✓" : "—";
  return (
    <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-ink/[0.02] px-6 py-1">
      <StateRow label="Jira" value={state.jira} />
      <StateRow label="Tech doc" value={state.techDoc} />
      <StateRow label="Gate" value={gateLabel} />
    </div>
  );
}

export function GreenfieldIntake() {
  // Must match this scene's DeckItem.id in deck.ts (not its sceneSlug/route) — useSceneNav
  // looks up prev/next targets by deck id, same contract SlidePlayer.tsx uses via item.id.
  const { initialBeat, onPastEnd, onPastStart, nextHref, nextLabel } = useSceneNav("s14b", BEATS.length);
  const { beat } = useBeats({ total: BEATS.length, initialBeat, onPastEnd, onPastStart });
  const config = BEATS[beat];
  const chatLog = buildChatLog(BEATS, beat);

  return (
    <SceneChrome
      nextHref={nextHref}
      nextLabel={nextLabel}
      label="Input Collection Gate"
      totalBeats={BEATS.length}
      currentBeat={beat}
      caption={config.caption}
      sidebarClassName="w-[40vw]"
      sidebar={
        <div className="flex h-full min-h-0 flex-col gap-3">
          <ChatLogPanel log={chatLog} />
        </div>
      }
    >
      <div className="flex h-full min-h-0 w-full max-w-2xl flex-col items-center justify-center gap-8">
        <h1 className="font-display text-center text-4xl font-bold text-ink sm:text-5xl">Input Collection Gates</h1>
        <Stepper activeStep={config.step} />
        <CollectedInputsPanel state={config.state} />

        <AnimatePresence>
          {config.step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-lg border border-jade/40 bg-jade/10 px-6 py-3 text-center text-lg text-jade"
            >
              ✓ Visible, explicit default — not a silent guess
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneChrome>
  );
}
