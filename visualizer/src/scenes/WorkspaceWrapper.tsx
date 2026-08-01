import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useBeats } from "../lib/useBeats";
import { useSceneNav } from "../lib/useSceneNav";
import { SceneChrome } from "../components/SceneChrome";

type RepoId = "billing" | "checkout" | "invoicing";
type RepoState = "neutral" | "active" | "synced" | "drift";
type Field = "pct" | "percentage";
type GateState = "pending" | "approved";

interface Repo {
  id: RepoId;
  name: string;
  role: "owner" | "consumer";
}

// One owner, two consumers of the same contract field — the exact shape of the failure
// mode already documented: "same story interpreted differently depending on which repo
// picked it up first," because nothing outside that repo knew the field even existed.
const REPOS: Repo[] = [
  { id: "billing", name: "billing-service", role: "owner" },
  { id: "checkout", name: "checkout-service", role: "consumer" },
  { id: "invoicing", name: "invoicing-service", role: "consumer" },
];

const REQUEST = "Rename the discount field from pct to percentage.";

// Domain-scoped specs are real (specs/portal, specs/lambdas, specs/product in the
// actual system) — every repo starts with its own, isolated. "Skills" mirrors that same
// local-vs-shared split for reusable practice, not just rules.
const LOCAL_SPECS: Record<RepoId, string> = {
  billing: "specs/billing/constitution.md",
  checkout: "specs/checkout/constitution.md",
  invoicing: "specs/invoicing/constitution.md",
};
const LOCAL_SKILLS: Record<RepoId, string> = {
  billing: "skills/billing-conventions.md",
  checkout: "skills/checkout-conventions.md",
  invoicing: "skills/invoicing-conventions.md",
};
const SHARED_SPEC = "workspace/conventions.md";
const SHARED_SKILL = "workspace/skills/safe-rename.md";

interface Beat {
  request: string | null;
  showWrapper: boolean;
  // Once true, all 3 repos inherit the workspace's shared spec + skill instead of their
  // own local copies — a standing structural fact, unlike the per-request analysis/gate.
  sharedDocsShown?: boolean;
  analysisShown?: boolean;
  gateState?: GateState;
  repoStates: Record<RepoId, RepoState>;
  repoField: Record<RepoId, Field>;
  driftCallout?: boolean;
  syncCallout?: boolean;
  caption: string;
}

const ALL_NEUTRAL: Record<RepoId, RepoState> = { billing: "neutral", checkout: "neutral", invoicing: "neutral" };
const ALL_PCT: Record<RepoId, Field> = { billing: "pct", checkout: "pct", invoicing: "pct" };

const BEATS: Beat[] = [
  {
    request: null,
    showWrapper: false,
    repoStates: ALL_NEUTRAL,
    repoField: ALL_PCT,
    caption: "Three repos. Three separate specs, three separate skills. Nothing connects them.",
  },
  {
    request: REQUEST,
    showWrapper: false,
    repoStates: { billing: "active", checkout: "neutral", invoicing: "neutral" },
    repoField: ALL_PCT,
    caption: "A request lands wherever it lands — this time, billing-service.",
  },
  {
    request: REQUEST,
    showWrapper: false,
    repoStates: { billing: "synced", checkout: "neutral", invoicing: "neutral" },
    repoField: { billing: "percentage", checkout: "pct", invoicing: "pct" },
    caption: "The agent renames the field. In billing-service, this looks finished.",
  },
  {
    request: REQUEST,
    showWrapper: false,
    repoStates: { billing: "synced", checkout: "drift", invoicing: "drift" },
    repoField: { billing: "percentage", checkout: "pct", invoicing: "pct" },
    driftCallout: true,
    caption:
      "Checkout and invoicing were never told — they're still reading a field that no longer means what they think.",
  },
  {
    request: null,
    showWrapper: true,
    repoStates: ALL_NEUTRAL,
    repoField: ALL_PCT,
    caption: "Same 3 repos. Now wrapped in one shared workspace.",
  },
  {
    request: null,
    showWrapper: true,
    sharedDocsShown: true,
    repoStates: ALL_NEUTRAL,
    repoField: ALL_PCT,
    caption: "The workspace also holds shared specs and skills — conventions every repo inherits, instead of drifting on its own.",
  },
  {
    request: REQUEST,
    showWrapper: true,
    sharedDocsShown: true,
    repoStates: ALL_NEUTRAL,
    repoField: ALL_PCT,
    caption: "The request hits the workspace first — not a repo.",
  },
  {
    request: REQUEST,
    showWrapper: true,
    sharedDocsShown: true,
    analysisShown: true,
    repoStates: ALL_NEUTRAL,
    repoField: ALL_PCT,
    caption: "One shared analysis, done once, before any code exists.",
  },
  {
    request: REQUEST,
    showWrapper: true,
    sharedDocsShown: true,
    analysisShown: true,
    gateState: "pending",
    repoStates: ALL_NEUTRAL,
    repoField: ALL_PCT,
    caption: "A confirmation gate — before the agent touches a single file.",
  },
  {
    request: REQUEST,
    showWrapper: true,
    sharedDocsShown: true,
    analysisShown: true,
    gateState: "approved",
    repoStates: ALL_NEUTRAL,
    repoField: ALL_PCT,
    caption: "A person confirms scope. Only then does the agent start.",
  },
  {
    request: REQUEST,
    showWrapper: true,
    sharedDocsShown: true,
    analysisShown: true,
    gateState: "approved",
    repoStates: { billing: "synced", checkout: "synced", invoicing: "synced" },
    repoField: { billing: "percentage", checkout: "percentage", invoicing: "percentage" },
    syncCallout: true,
    caption: "All three update together, using the shared rename-safely skill. Nobody drifts.",
  },
];

const STATE_TONE: Record<RepoState, { border: string; bg: string; text: string; icon: string }> = {
  neutral: { border: "rgba(255,255,255,0.12)", bg: "rgba(255,255,255,0.02)", text: "rgba(255,255,255,0.4)", icon: "·" },
  active: { border: "rgba(96,165,250,0.65)", bg: "rgba(96,165,250,0.1)", text: "#c4b5fd", icon: "…" },
  synced: { border: "rgba(52,211,153,0.65)", bg: "rgba(52,211,153,0.12)", text: "#86efac", icon: "✓" },
  drift: { border: "rgba(248,113,113,0.65)", bg: "rgba(248,113,113,0.12)", text: "#fca5a5", icon: "✗" },
};

function RequestBubble({ text }: { text: string | null }) {
  return (
    <div className="flex h-11 items-center">
      <AnimatePresence mode="wait">
        {text && (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-base text-white/80"
          >
            <span className="mr-2 font-mono text-xs uppercase tracking-wide text-white/40">request</span>
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DocRow({ label, shared, path }: { label: string; shared: boolean; path: string }) {
  const color = shared ? "#c4b5fd" : "rgba(255,255,255,0.35)";
  return (
    <div className="flex items-center gap-1.5 overflow-hidden">
      <motion.span animate={{ color }} className="shrink-0 text-[9px] uppercase tracking-wide">
        {label}
      </motion.span>
      <motion.span animate={{ color }} className="truncate font-mono text-[9px]">
        {path}
      </motion.span>
    </div>
  );
}

function RepoCard({
  repo,
  state,
  field,
  docsShared,
}: {
  repo: Repo;
  state: RepoState;
  field: Field;
  docsShared: boolean;
}) {
  const tone = STATE_TONE[state];
  const specPath = docsShared ? SHARED_SPEC : LOCAL_SPECS[repo.id];
  const skillPath = docsShared ? SHARED_SKILL : LOCAL_SKILLS[repo.id];
  return (
    <motion.div
      layout
      animate={{ borderColor: tone.border, backgroundColor: tone.bg }}
      transition={{ type: "spring", stiffness: 160, damping: 22 }}
      className="flex w-[220px] flex-col gap-2 rounded-2xl border-2 p-4"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[13px] font-semibold text-white/85">{repo.name}</span>
        <motion.span animate={{ color: tone.text }} className="text-base">
          {tone.icon}
        </motion.span>
      </div>
      <span className="text-[10px] uppercase tracking-wide text-white/30">{repo.role}</span>
      <div className="flex flex-col gap-1">
        <DocRow label="specs" shared={docsShared} path={specPath} />
        <DocRow label="skills" shared={docsShared} path={skillPath} />
      </div>
      <motion.div
        animate={{ borderColor: tone.border, color: tone.text }}
        className="rounded-lg border px-2.5 py-1.5 font-mono text-xs"
      >
        discount.{field}
      </motion.div>
    </motion.div>
  );
}

function SharedDocsPanel() {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full rounded-xl border border-blue-400/25 bg-blue-400/[0.06] px-4 py-3 text-sm text-blue-200"
    >
      <span className="mr-2 font-mono text-[10px] uppercase tracking-wide text-blue-300/60">shared specs &amp; skills</span>
      {SHARED_SPEC} · {SHARED_SKILL} — inherited by all 3 repos
    </motion.div>
  );
}

function AnalysisPanel() {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full rounded-xl border border-blue-400/25 bg-blue-400/[0.06] px-4 py-3 text-sm text-blue-200"
    >
      <span className="mr-2 font-mono text-[10px] uppercase tracking-wide text-blue-300/60">impact analysis</span>
      billing-service (owner) · checkout-service (consumer) · invoicing-service (consumer)
    </motion.div>
  );
}

function GatePanel({ state }: { state: GateState }) {
  const approved = state === "approved";
  const color = approved ? "#4ade80" : "#a78bfa";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0, borderColor: color }}
      exit={{ opacity: 0 }}
      className="flex w-full items-center gap-2.5 rounded-xl border px-4 py-3 text-sm"
      style={{ backgroundColor: approved ? "rgba(52,211,153,0.08)" : "rgba(96,165,250,0.08)" }}
    >
      <span style={{ color }}>{approved ? "✓" : "⏸"}</span>
      <span style={{ color }}>
        {approved
          ? "Approved — 3 repos confirmed, proceeding."
          : "3 repos affected — confirm before writing any code."}
      </span>
    </motion.div>
  );
}

function Callout({ tone, children }: { tone: "red" | "green"; children: ReactNode }) {
  const cls =
    tone === "red"
      ? "border-red-400/30 bg-red-400/10 text-red-300"
      : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-lg border px-6 py-3 text-lg ${cls}`}
    >
      {children}
    </motion.div>
  );
}

export function WorkspaceWrapper() {
  const { initialBeat, onPastEnd, onPastStart, nextHref, nextLabel } = useSceneNav("workspace-wrapper", BEATS.length);
  const { beat } = useBeats({ total: BEATS.length, initialBeat, onPastEnd, onPastStart });
  const config = BEATS[beat];
  const docsShared = config.sharedDocsShown ?? false;

  return (
    <SceneChrome
      label="Workspace Wrapper — Multi-Repo Before/After"
      totalBeats={BEATS.length}
      currentBeat={beat}
      caption={config.caption}
      nextHref={nextHref}
      nextLabel={nextLabel}
    >
      <div className="flex w-full max-w-4xl flex-col items-center gap-6">
        <RequestBubble text={config.request} />

        <motion.div
          layout
          animate={{
            borderColor: config.showWrapper ? "rgba(96,165,250,0.35)" : "rgba(255,255,255,0)",
            backgroundColor: config.showWrapper ? "rgba(96,165,250,0.03)" : "rgba(255,255,255,0)",
          }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
          className="flex flex-col items-center gap-4 rounded-[32px] border-2 p-6"
        >
          <AnimatePresence>
            {config.showWrapper && (
              <motion.span
                key="workspace-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="self-start font-mono text-[11px] uppercase tracking-[0.2em] text-blue-300/70"
              >
                Workspace
              </motion.span>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {docsShared && <SharedDocsPanel key="shared-docs" />}
            {config.analysisShown && <AnalysisPanel key="analysis" />}
            {config.gateState && <GatePanel key="gate" state={config.gateState} />}
          </AnimatePresence>

          <div className="flex items-center gap-5">
            {REPOS.map((repo) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                state={config.repoStates[repo.id]}
                field={config.repoField[repo.id]}
                docsShared={docsShared}
              />
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          {config.driftCallout && (
            <Callout key="drift" tone="red">
              ✗ Same request, interpreted differently depending on which repo picked it up first.
            </Callout>
          )}
          {config.syncCallout && (
            <Callout key="sync" tone="green">
              ✓ One shared analysis, one confirmation, zero drift.
            </Callout>
          )}
        </AnimatePresence>
      </div>
    </SceneChrome>
  );
}
