import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useBeats } from "../lib/useBeats";
import { useSceneNav } from "../lib/useSceneNav";
import { SceneChrome } from "../components/SceneChrome";
import { Icon } from "../components/slides/Icon";
import { useTheme, inkRgba, inkTextRgba, toneText } from "../lib/theme";

type RepoId = "billing" | "checkout" | "invoicing";
type RepoState = "neutral" | "active" | "synced" | "drift";
type Field = "pct" | "percentage";
type GateState = "pending" | "approved";
type FolderType = "skills" | "agents" | "specs" | "plans";

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

const FOLDER_TYPES: FolderType[] = ["skills", "agents", "specs", "plans"];

// Domain-scoped specs are real (specs/portal, specs/lambdas, specs/product in the
// actual system) — every repo starts with its own copy of all four kinds of AI config,
// isolated. Once ai-kit exists these paths are deleted from the repo entirely, not left
// behind — ai-kit becomes the one place they live.
const LOCAL_PATHS: Record<RepoId, Record<FolderType, string>> = {
  billing: {
    skills: "skills/billing-conventions.md",
    agents: "agents/billing-rename-agent.md",
    specs: "specs/billing/constitution.md",
    plans: "plans/billing/migration.md",
  },
  checkout: {
    skills: "skills/checkout-conventions.md",
    agents: "agents/checkout-rename-agent.md",
    specs: "specs/checkout/constitution.md",
    plans: "plans/checkout/migration.md",
  },
  invoicing: {
    skills: "skills/invoicing-conventions.md",
    agents: "agents/invoicing-rename-agent.md",
    specs: "specs/invoicing/constitution.md",
    plans: "plans/invoicing/migration.md",
  },
};

const SHARED_PATHS: Record<FolderType, string> = {
  skills: "ai-kit/skills/safe-rename.md",
  agents: "ai-kit/agents/rename-agent.md",
  specs: "ai-kit/conventions.md",
  plans: "ai-kit/plans/migration.md",
};

interface Beat {
  request: string | null;
  showWrapper: boolean;
  // Once true, ai-kit holds the canonical folders and each repo's local copies have
  // been deleted — a standing structural fact, unlike the per-request analysis/gate.
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
    caption: "Three repos. Each with its own skills, agents, specs, and plans. Nothing connects them.",
  },
  {
    request: REQUEST,
    showWrapper: false,
    repoStates: { billing: "active", checkout: "neutral", invoicing: "neutral" },
    repoField: ALL_PCT,
    caption: "The request starts in billing-service",
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
    caption: "Same 3 repos. Now wrapped inside one repo — ai-kit — each one gitignored there, not re-committed.",
  },
  {
    request: null,
    showWrapper: true,
    sharedDocsShown: true,
    repoStates: ALL_NEUTRAL,
    repoField: ALL_PCT,
    caption: "ai-kit holds the one canonical skills, agents, specs, and plans. Deleted from every repo — moved, not duplicated.",
  },
  {
    request: REQUEST,
    showWrapper: true,
    sharedDocsShown: true,
    repoStates: ALL_NEUTRAL,
    repoField: ALL_PCT,
    caption: "The request hits ai-kit first — not a repo.",
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
    caption: "All three update together, using the shared skill in ai-kit. Nobody drifts.",
  },
];

// Violet/green/turmeric — same brand-accent family used across the rest of the
// visualizer, none of them teal-adjacent, so every state stays legible on the wave bg.
// Neutral's border/text are bumped a notch brighter than a typical "inactive" tone —
// at true low-alpha they read as almost invisible against the wave background, and the
// resting-state cards need to look like cards even before anything happens to them.
function stateTone(state: RepoState, isLight: boolean): { border: string; bg: string; text: string; icon: string } {
  switch (state) {
    case "neutral":
      return { border: inkRgba(isLight, 0.22), bg: inkRgba(isLight, 0.03), text: inkTextRgba(isLight, 0.55), icon: "·" };
    case "active":
      return {
        border: "rgba(167,139,250,0.7)",
        bg: "rgba(167,139,250,0.12)",
        text: isLight ? "#5b21b6" : "#c4b5fd",
        icon: "…",
      };
    case "synced":
      return {
        border: "rgba(74,222,128,0.7)",
        bg: "rgba(74,222,128,0.14)",
        text: isLight ? "#0f766e" : "#86efac",
        icon: "✓",
      };
    case "drift":
      return {
        border: "rgba(204,133,10,0.7)",
        bg: "rgba(204,133,10,0.14)",
        text: isLight ? "#976207" : "#cc850a",
        icon: "✗",
      };
  }
}

// The tail lives on the bubble itself — a real, always-correct anchor point — instead of
// a separate connector line hanging in the gap above the cards with nothing above it to
// visibly hang from. It points generically down at "what follows," not at any one card:
// the bubble is centered over the whole row, so a line claiming to trace to one specific
// repo would be pointing somewhere it doesn't actually originate from.
function RequestBubble({ text }: { text: string | null }) {
  return (
    <div className="flex h-12 items-center">
      <AnimatePresence mode="wait">
        {text && (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-xl border border-ink/10 bg-ink/[0.04] px-6 py-2.5 text-lg text-ink/80"
          >
            <span className="mr-2 font-mono text-xs uppercase tracking-wide text-ink/40">request</span>
            {text}
            {/* A thin 1px border at low opacity (matching the bubble's own outline) all but
                disappears at presentation scale/distance — a solid filled triangle instead
                of a rotated bordered square reads clearly as "pointing down" from across a
                room, not just up close. */}
            <span
              className="absolute left-1/2 top-full -translate-x-1/2 border-x-[8px] border-t-[9px] border-x-transparent border-t-ink/25"
              aria-hidden
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Local copy, before ai-kit exists — plain path, still on disk in this repo. No separate
// "SKILLS" type label: every path's first segment already names its folder type, so a
// label would just repeat the first word and cost width that's better spent not
// truncating the path itself.
function FolderRow({ path }: { path: string }) {
  return (
    <div className="flex items-center gap-2 overflow-hidden text-ink/75">
      <Icon name="folder" className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate font-mono text-xs text-ink/65">{path}</span>
    </div>
  );
}

// Once ai-kit holds the canonical copy, the four local folders are deleted from the
// repo outright — this replaces the FolderRow list entirely, not a struck-through
// remnant of it. Kept to one short tag instead of repeating the same full sentence in
// all 3 cards — SharedFoldersPanel above already spells out what moved where.
function MovedNotice() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-1.5 text-sm font-medium text-turmeric"
    >
      <Icon name="folder" className="h-4 w-4 shrink-0" />
      <span>→ ai-kit</span>
    </motion.div>
  );
}

function RepoCard({
  repo,
  state,
  field,
  docsShared,
  isLight,
}: {
  repo: Repo;
  state: RepoState;
  field: Field;
  docsShared: boolean;
  isLight: boolean;
}) {
  const tone = stateTone(state, isLight);
  return (
    <motion.div
      layout
      animate={{ borderColor: tone.border, backgroundColor: tone.bg }}
      transition={{ type: "spring", stiffness: 160, damping: 22 }}
      className="flex w-[310px] flex-col gap-3 rounded-2xl border-2 p-5"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-base font-semibold text-ink/85">{repo.name}</span>
        <motion.span animate={{ color: tone.text }} className="text-lg">
          {tone.icon}
        </motion.span>
      </div>
      <span className="text-xs uppercase tracking-wide text-ink/40">{repo.role}</span>
      <AnimatePresence mode="popLayout">
        {docsShared ? (
          <MovedNotice key="moved" />
        ) : (
          <motion.div key="local" layout className="flex flex-col gap-1.5">
            {FOLDER_TYPES.map((type) => (
              <FolderRow key={type} path={LOCAL_PATHS[repo.id][type]} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        animate={{ borderColor: tone.border, color: tone.text }}
        className="overflow-hidden rounded-lg border px-3 py-2 font-mono text-sm"
      >
        {/* Keyed on field so the exact value that just changed — the whole point of the
            demo — gets a bright flash-to-settle instead of quietly tweening color like
            the rest of the card. */}
        <motion.span
          key={field}
          initial={{ color: "#facc15" }}
          animate={{ color: tone.text }}
          transition={{ duration: 0.7 }}
        >
          discount.{field}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

// Lives inside the ai-kit wrapper, above the repo row — the one canonical copy of each
// folder type, now that every repo's local copy has been deleted.
function SharedFoldersPanel() {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="grid w-full grid-cols-2 gap-x-5 gap-y-2 rounded-xl border border-turmeric/40 bg-turmeric/10 px-5 py-3 sm:grid-cols-4"
    >
      {FOLDER_TYPES.map((type) => (
        <div key={type} className="flex items-center gap-2 overflow-hidden text-turmeric">
          <Icon name="folder" className="h-4 w-4 shrink-0" />
          <span className="truncate font-mono text-xs font-medium">{SHARED_PATHS[type]}</span>
        </div>
      ))}
    </motion.div>
  );
}

function AnalysisPanel({ isLight }: { isLight: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`w-full rounded-xl border border-violet-400/40 bg-violet-400/10 px-5 py-3 text-base ${
        isLight ? "text-violet-900" : "text-violet-100"
      }`}
    >
      <span className={`mr-2 font-mono text-xs uppercase tracking-wide ${toneText(isLight, "violet")}`}>
        impact analysis
      </span>
      billing-service (owner) · checkout-service (consumer) · invoicing-service (consumer)
    </motion.div>
  );
}

function GatePanel({ state, isLight }: { state: GateState; isLight: boolean }) {
  const approved = state === "approved";
  const color = approved ? (isLight ? "#0f766e" : "#4ade80") : isLight ? "#5b21b6" : "#a78bfa";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0, borderColor: color }}
      exit={{ opacity: 0 }}
      className="flex w-full items-center gap-3 rounded-xl border px-5 py-3 text-base"
      style={{ backgroundColor: approved ? "rgba(74,222,128,0.08)" : "rgba(167,139,250,0.08)" }}
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

// A stub, not a functioning card — no folder rows, no field, no state of its own. Three
// repos already makes the owner/2-consumers point; this exists purely so the audience
// doesn't read "three" as "the whole blast radius" when a real org has many more.
// No explicit height here — the row is items-stretch, which only stretches flex items
// whose cross-size is the auto *keyword*; an explicit height (even h-full/100%) opts a
// child out of that and falls back to its own content height instead. Leaving height
// unset is what lets this track whatever height the real cards land on that beat.
function GhostRepoCard() {
  return (
    <div className="flex w-[240px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-ink/20 p-5 text-center">
      <span className="text-3xl text-ink/30">+9</span>
      <span className="text-xs uppercase tracking-wide text-ink/35">more repos</span>
    </div>
  );
}

function Callout({ tone, isLight, children }: { tone: "red" | "green"; isLight: boolean; children: ReactNode }) {
  const cls =
    tone === "red"
      ? "border-turmeric/30 bg-turmeric/10 text-turmeric"
      : `border-emerald-400/30 bg-emerald-400/10 ${toneText(isLight, "emerald")}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-lg border px-7 py-3 text-xl ${cls}`}
    >
      {children}
    </motion.div>
  );
}

export function WorkspaceWrapper() {
  const { initialBeat, onPastEnd, onPastStart, nextHref, nextLabel } = useSceneNav("workspace-wrapper", BEATS.length);
  const { beat } = useBeats({ total: BEATS.length, initialBeat, onPastEnd, onPastStart });
  const { isLight } = useTheme();
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
      <div className="flex w-full max-w-[1320px] flex-col items-center gap-5">
        <RequestBubble text={config.request} />

        {/* ai-kit wraps the repos — a single bordered container the 3 repo cards render
            inside, not a peer box beside them, so "one shared repo enclosing three
            services" reads directly from the layout. */}
        <motion.div
          layout
          animate={{
            borderColor: config.showWrapper ? (isLight ? "rgba(151,98,7,0.45)" : "rgba(204,133,10,0.45)") : "rgba(255,255,255,0)",
            backgroundColor: config.showWrapper ? (isLight ? "rgba(151,98,7,0.05)" : "rgba(204,133,10,0.05)") : "rgba(255,255,255,0)",
          }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
          className="flex flex-col items-center gap-4 rounded-[32px] border-2 p-6"
        >
          <AnimatePresence>
            {config.showWrapper && (
              <motion.div
                key="ai-kit-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-start gap-1 self-start"
              >
                <span className="font-mono text-sm uppercase tracking-[0.2em] text-turmeric">ai-kit</span>
                <span className="font-mono text-xs text-ink/45">
                  .gitignore: billing-service/, checkout-service/, invoicing-service/
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {docsShared && <SharedFoldersPanel key="shared-folders" />}
            {config.analysisShown && <AnalysisPanel key="analysis" isLight={isLight} />}
            {config.gateState && <GatePanel key="gate" state={config.gateState} isLight={isLight} />}
          </AnimatePresence>

          <div className="flex items-stretch gap-6">
            {REPOS.map((repo) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                state={config.repoStates[repo.id]}
                field={config.repoField[repo.id]}
                docsShared={docsShared}
                isLight={isLight}
              />
            ))}
            <GhostRepoCard />
          </div>
        </motion.div>

        <AnimatePresence>
          {config.driftCallout && (
            <Callout key="drift" tone="red" isLight={isLight}>
              ✗ Same request, interpreted differently depending on which repo picked it up first.
            </Callout>
          )}
          {config.syncCallout && (
            <Callout key="sync" tone="green" isLight={isLight}>
              ✓ One shared analysis, one confirmation, zero drift.
            </Callout>
          )}
        </AnimatePresence>
      </div>
    </SceneChrome>
  );
}
