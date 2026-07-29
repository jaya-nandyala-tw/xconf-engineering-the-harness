import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useBeats } from "../lib/useBeats";
import { useSpringNumber } from "../lib/useSpringNumber";
import { SceneChrome } from "../components/SceneChrome";

interface Turn {
  id: string;
  tokens: number;
  text: string;
}

const TURNS: Record<string, Turn> = {
  // Baseline overhead every session pays before a single user message — sized off a
  // real session-info breakdown (System Instructions ≈1.1% of window, Tool Definitions
  // ≈0.7%), scaled to this scene's 250K window instead of the reference's 1M.
  sysPrompt: {
    id: "sysPrompt",
    tokens: 2750,
    text: "System — coding agent's built-in instructions (tool-use conventions, response style)",
  },
  toolDefs: {
    id: "toolDefs",
    tokens: 1750,
    text: "System — tool definitions (read, write, bash, grep, edit, ...)",
  },
  sys: { id: "sys", tokens: 220, text: "System — repo rules (ui-constitution.md)" },
  signal: { id: "signal", tokens: 70, text: '"Never store tokens in localStorage — always httpOnly cookies."' },
  // 6,000 lines × ~9 tokens/line — same conversion used for the monolith in the
  // Progressive Disclosure scene, so the two numbers rhyme across scenes. Sized to a
  // sprawling real-world policy doc, not a toy example — specs like this run long.
  specRead: {
    id: "specRead",
    tokens: 54_000,
    text: "Reads security-conventions.md in full (6,000 lines) to find the cookie policy",
  },
  grep1: { id: "grep1", tokens: 3200, text: 'grep -r "localStorage" — 47 matches across 12 files' },
  read1: { id: "read1", tokens: 6800, text: "Read auth/session-manager.ts (540 lines)" },
  testrun: { id: "testrun", tokens: 7400, text: "Run the auth test suite — inspect 3 failures" },
  read5: { id: "read5", tokens: 5900, text: "Read the settings page component (390 lines)" },
  read6: {
    id: "read6",
    tokens: 20_700,
    text: "Read 3 more files pulled in via imports — payment-flow.ts, invoice-utils.ts, ledger-client.ts",
  },
  bug: { id: "bug", tokens: 2100, text: '"Bug — clicking submit twice sends duplicate requests."' },
  t7: { id: "t7", tokens: 70, text: '"Quick one — add the httpOnly cookie thing we discussed."' },
};

// 250K — a typical Sonnet-class model's standard context window, not the special
// 1M option — so the percentage reads as something a team hits routinely, not an edge case.
const CONTEXT_WINDOW = 250_000;

// The "dumb zone" isn't just position — it's marked active once total usage crosses
// this share of the window, a commonly-cited rule of thumb for when quality degrades.
// Below it, buried content still reads as fine; above it, position starts to matter.
const DUMB_ZONE_THRESHOLD_PCT = 0.4;

// Needle-in-a-haystack framing: translate the abstract token count into words/pages
// so "the rule is buried" feels physical, independent of what % of the window it is.
const WORDS_PER_TOKEN = 0.75;
const WORDS_PER_PAGE = 275;

// The system prompt (agent instructions + tool definitions + repo rules) is always
// re-injected in full, unlike anything stated mid-conversation — that's a structural
// fact, not a "fix" being demonstrated, so it never changes across beats.
const PINNED_IDS = ["sysPrompt", "toolDefs", "sys"];

type Role = "user" | "harness" | "tool";
type Bubble = { role: Role; text: string };
type Callout = "none" | "missed";

type Category = "rules" | "specdocs" | "exploration" | "conversation";

const CATEGORY_OF: Record<string, Category> = {
  sysPrompt: "rules",
  toolDefs: "rules",
  sys: "rules",
  signal: "rules",
  specRead: "specdocs",
  grep1: "exploration",
  read1: "exploration",
  testrun: "exploration",
  read5: "exploration",
  read6: "exploration",
  bug: "conversation",
  t7: "conversation",
};

const CATEGORY_ORDER: Category[] = ["rules", "specdocs", "exploration", "conversation"];

const CATEGORY_META: Record<Category, { label: string; color: string }> = {
  rules: { label: "System & rules", color: "#60a5fa" },
  specdocs: { label: "Spec / doc reads", color: "#fbbf24" },
  exploration: { label: "Codebase exploration", color: "#34d399" },
  conversation: { label: "Conversation", color: "#e5e7eb" },
};

interface BeatConfig {
  visibleIds: string[];
  bubble: Bubble;
  callout: Callout;
  caption: string;
}

const BEATS: BeatConfig[] = [
  {
    visibleIds: ["sysPrompt", "toolDefs", "sys", "signal"],
    bubble: { role: "user", text: TURNS.signal.text },
    callout: "none",
    caption: "The rule is stated. Right now: full attention.",
  },
  {
    visibleIds: ["sysPrompt", "toolDefs", "sys", "signal", "specRead"],
    bubble: { role: "tool", text: TURNS.specRead.text },
    callout: "none",
    caption: "Cause one: one question about that rule, and the agent reads an entire spec file to answer it.",
  },
  {
    visibleIds: ["sysPrompt", "toolDefs", "sys", "signal", "specRead", "grep1"],
    bubble: { role: "tool", text: TURNS.grep1.text },
    callout: "none",
    caption: "Cause two starts: it goes looking in the code too — grep across the repo.",
  },
  {
    visibleIds: ["sysPrompt", "toolDefs", "sys", "signal", "specRead", "grep1", "read1"],
    bubble: { role: "tool", text: TURNS.read1.text },
    callout: "none",
    caption: "Reading one file costs real tokens. This one alone: 6,800.",
  },
  {
    visibleIds: ["sysPrompt", "toolDefs", "sys", "signal", "specRead", "grep1", "read1", "testrun"],
    bubble: { role: "tool", text: TURNS.testrun.text },
    callout: "none",
    caption: "Running the test suite and reading the failures: 7,400 more.",
  },
  {
    visibleIds: ["sysPrompt", "toolDefs", "sys", "signal", "specRead", "grep1", "read1", "testrun", "read5"],
    bubble: { role: "tool", text: TURNS.read5.text },
    callout: "none",
    caption: "One more file. Exploration just became the single largest category in the window.",
  },
  {
    visibleIds: ["sysPrompt", "toolDefs", "sys", "signal", "specRead", "grep1", "read1", "testrun", "read5", "read6"],
    bubble: { role: "tool", text: TURNS.read6.text },
    callout: "none",
    caption: "Imports pull in three more files nobody asked for. That's the 40% line — crossed.",
  },
  {
    visibleIds: [
      "sysPrompt",
      "toolDefs",
      "sys",
      "signal",
      "specRead",
      "grep1",
      "read1",
      "testrun",
      "read5",
      "read6",
      "bug",
    ],
    bubble: { role: "user", text: TURNS.bug.text },
    callout: "none",
    caption: "A bug report lands mid-investigation. The window keeps growing regardless.",
  },
  {
    visibleIds: [
      "sysPrompt",
      "toolDefs",
      "sys",
      "signal",
      "specRead",
      "grep1",
      "read1",
      "testrun",
      "read5",
      "read6",
      "bug",
      "t7",
    ],
    bubble: { role: "user", text: TURNS.t7.text },
    callout: "missed",
    caption: "Past 40% of a 250K window — and the rule is the needle in this haystack.",
  },
  {
    visibleIds: [
      "sysPrompt",
      "toolDefs",
      "sys",
      "signal",
      "specRead",
      "grep1",
      "read1",
      "testrun",
      "read5",
      "read6",
      "bug",
      "t7",
    ],
    bubble: {
      role: "harness",
      text: "Two things filled this window that didn't need to. Both get their own fix, next.",
    },
    callout: "none",
    caption:
      '"Bigger context windows don\'t fix this — they just make the haystack bigger." Solution 1: sub-agents. Solution 2: progressive disclosure.',
  },
];

function totalTokens(ids: string[]) {
  return ids.reduce((sum, id) => sum + TURNS[id].tokens, 0);
}

// Smart zone (pinned + recent) shares one green family — attention research shows BOTH
// ends of a context window are well-attended, only the middle degrades. Pinned is a touch
// more saturated to read as "permanent" vs. recent's lighter "current, but temporary" tone.
// Middle (the dumb zone) gets a warm amber instead of a near-invisible gray — it should
// read as a visibly growing warning, not blend into the background as it fills up.
const TONE_STYLE = {
  pinned: { bg: "rgba(52, 211, 153, 0.22)", border: "rgba(52, 211, 153, 0.65)" },
  recent: { bg: "rgba(52, 211, 153, 0.12)", border: "rgba(52, 211, 153, 0.45)" },
  middle: { bg: "rgba(251, 146, 60, 0.22)", border: "rgba(251, 146, 60, 0.55)" },
} as const;

function Segment({
  turn,
  tone,
  isSignal,
}: {
  turn: Turn;
  tone: keyof typeof TONE_STYLE;
  isSignal: boolean;
}) {
  const style = TONE_STYLE[tone];
  return (
    <motion.div
      layoutId={turn.id}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        flexGrow: turn.tokens,
        flexBasis: 0,
        minWidth: isSignal ? 16 : 4,
        backgroundColor: style.bg,
        borderColor: style.border,
      }}
      transition={{ type: "spring", stiffness: 120, damping: 22 }}
      className={`relative flex h-full items-center justify-center border-r border-white/5 ${
        isSignal ? "z-10 ring-2 ring-inset ring-amber-300/80" : ""
      }`}
    />
  );
}

function ContextBar({ visibleIds }: { visibleIds: string[] }) {
  const pinned = visibleIds.filter((id) => PINNED_IDS.includes(id));
  const rest = visibleIds.filter((id) => !PINNED_IDS.includes(id));
  const recentId = rest[rest.length - 1];
  const middleIds = rest.slice(0, -1);

  const pinnedTokens = totalTokens(pinned);
  const middleTokens = totalTokens(middleIds);
  const recentTokens = recentId ? TURNS[recentId].tokens : 0;

  // The bar's total width is the fixed 250K window, not just whatever's currently
  // visible — so the filled portion's width literally IS "% of the window used,"
  // the same number the audience just read off the token counter above.
  const usedTokens = pinnedTokens + middleTokens + recentTokens;
  const unusedTokens = Math.max(0, CONTEXT_WINDOW - usedTokens);
  const unusedPct = Math.round((unusedTokens / CONTEXT_WINDOW) * 100);

  // The whole middle block flips from "still fine" to "dumb zone" together, right at the
  // 40% mark — not per-segment, since it's the total that crosses the threshold, not any one turn.
  const pastThreshold = isPastDumbZoneThreshold(visibleIds);
  const middleTone = pastThreshold ? "middle" : "recent";

  return (
    <div className="flex w-full flex-col gap-2">
      {/* A single caption line instead of per-segment labels — once the bar is scaled to
          the full 250K window, the "used" sliver is often too narrow to fit three
          proportionally-sized labels. Segment meaning comes from ZoneLegend's color key
          below instead; this line just carries the two numbers that actually change. */}
      <div className="flex w-full items-baseline justify-between text-[11px] uppercase tracking-wide">
        <span className={pastThreshold ? "font-semibold text-orange-300/80" : "text-white/35"}>
          {middleIds.length > 0
            ? `conversation & tool output (${middleIds.length}) — ${
                pastThreshold ? "past 40%, filling the dumb zone" : "accumulating, still under 40%"
              }`
            : "system prompt + tools + rules only"}
        </span>
        {unusedTokens > 0 && <span className="text-white/15">{unusedPct}% of the 250K window still unused</span>}
      </div>

      <motion.div layout className="flex h-20 w-full overflow-hidden rounded-2xl border border-white/10">
        <AnimatePresence initial={false}>
          {pinned.length > 0 && (
            <motion.div key="pinned-group" layout className="flex" style={{ flexGrow: pinnedTokens, flexBasis: 0 }}>
              {pinned.map((id) => (
                <Segment key={id} turn={TURNS[id]} tone="pinned" isSignal={id === "signal"} />
              ))}
            </motion.div>
          )}

          {middleIds.length > 0 && (
            <motion.div key="middle-group" layout className="flex" style={{ flexGrow: middleTokens, flexBasis: 0 }}>
              {middleIds.map((id) => (
                <Segment key={id} turn={TURNS[id]} tone={middleTone} isSignal={id === "signal"} />
              ))}
            </motion.div>
          )}

          {recentId && (
            <motion.div key="recent-group" layout className="flex" style={{ flexGrow: recentTokens, flexBasis: 0 }}>
              <Segment turn={TURNS[recentId]} tone="recent" isSignal={recentId === "signal"} />
            </motion.div>
          )}

          {unusedTokens > 0 && (
            <motion.div
              key="unused-group"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full border-l border-white/5 bg-white/[0.015]"
              style={{ flexGrow: unusedTokens, flexBasis: 0 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function ZoneLegend() {
  return (
    <div className="flex flex-col items-end gap-1.5 text-xs text-white/40">
      <div className="flex items-center gap-5">
        <LegendItem color="rgba(52, 211, 153, 0.8)" label="smart zone — start & recent, well attended" />
        <LegendItem color="rgba(251, 146, 60, 0.75)" label='dumb zone — "lost in the middle"' />
      </div>
      <p className="text-[11px] text-white/25">
        darker green = system prompt, always attended · lighter green = recent, but temporary · amber = past 40% of
        the window, poorly attended
      </p>
    </div>
  );
}

function TokenCounter({ tokens }: { tokens: number }) {
  const { display } = useSpringNumber(tokens, { stiffness: 90, damping: 20, mass: 0.7 });
  const pct = (tokens / CONTEXT_WINDOW) * 100;
  const pctLabel = pct < 0.01 ? "<0.01" : pct.toFixed(1);
  const words = Math.round(tokens * WORDS_PER_TOKEN);
  const pages = Math.max(1, Math.round(words / WORDS_PER_PAGE));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-3xl text-white/90">{display.toLocaleString()}</span>
        <span className="text-sm text-white/40">tokens · ≈{pctLabel}% of a 250K window</span>
      </div>
      <p className="text-xs text-orange-300/60">
        the haystack: ≈{words.toLocaleString()} words (~{pages} pages) · the needle: one sentence about cookies
      </p>
    </div>
  );
}

type SignalZone = "pinned" | "safe" | "dumbzone";

function isPastDumbZoneThreshold(visibleIds: string[]) {
  return totalTokens(visibleIds) / CONTEXT_WINDOW >= DUMB_ZONE_THRESHOLD_PCT;
}

// The most recent turn is always well-attended regardless of window fill — that's the
// "recency" half of smart-zone research. Everything else only turns into the dumb zone
// once the window has actually crossed the 40% mark; below that, being buried is still fine.
function computeSignalZone(visibleIds: string[]): SignalZone | null {
  if (!visibleIds.includes("signal")) return null;
  if (PINNED_IDS.includes("signal")) return "pinned";
  const rest = visibleIds.filter((id) => !PINNED_IDS.includes(id));
  if (rest[rest.length - 1] === "signal") return "safe";
  return isPastDumbZoneThreshold(visibleIds) ? "dumbzone" : "safe";
}

const ZONE_LABEL: Record<SignalZone, { text: string; className: string }> = {
  pinned: { text: "pinned — always attended", className: "text-blue-300" },
  safe: { text: "under 40% — still well attended", className: "text-emerald-300" },
  dumbzone: { text: 'dumb zone — "lost in the middle"', className: "text-orange-300" },
};

function SignalZoneReadout({ zone }: { zone: SignalZone | null }) {
  if (!zone) return null;
  const info = ZONE_LABEL[zone];
  return (
    <div className="flex items-center gap-2 text-base">
      <span className="text-amber-300">★ tracked instruction — currently:</span>
      <span className={`font-mono font-semibold uppercase ${info.className}`}>{info.text}</span>
    </div>
  );
}

const ROLE_STYLE: Record<Role, { wrap: string; label: string; mono?: boolean }> = {
  user: { wrap: "border-white/10 bg-white/[0.04] text-white/80", label: "user" },
  harness: { wrap: "border-blue-400/30 bg-blue-400/10 text-blue-200", label: "harness" },
  tool: { wrap: "border-emerald-400/20 bg-black/40 text-emerald-300/90", label: "tool", mono: true },
};

// Replays every beat's bubble as a running chat transcript, collapsing consecutive
// beats that share the same message.
function buildChatLog(beats: BeatConfig[], uptoBeat: number): Bubble[] {
  const log: Bubble[] = [];
  let prevText: string | null = null;
  for (let i = 0; i <= uptoBeat; i++) {
    const b = beats[i].bubble;
    if (b.text !== prevText) {
      log.push(b);
      prevText = b.text;
    }
  }
  return log;
}

function ChatLogBubble({ bubble, isLatest }: { bubble: Bubble; isLatest: boolean }) {
  const style = ROLE_STYLE[bubble.role];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border px-3 py-2 text-[13px] leading-snug ${style.wrap} ${
        style.mono ? "font-mono text-xs" : ""
      } ${isLatest ? "ring-1 ring-inset ring-white/25" : ""}`}
    >
      <span className="mr-1.5 font-mono text-[9px] uppercase tracking-wide opacity-50">{style.label}</span>
      {bubble.text}
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
    <div className="flex h-full w-full flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-white/40 shrink-0">Chat</p>
      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {log.map((b, i) => (
            <ChatLogBubble key={`${i}-${b.text}`} bubble={b} isLatest={i === log.length - 1} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function computeCategoryTotals(visibleIds: string[]): Record<Category, number> {
  const totals: Record<Category, number> = { rules: 0, specdocs: 0, exploration: 0, conversation: 0 };
  visibleIds.forEach((id) => {
    const category = CATEGORY_OF[id];
    if (category) totals[category] += TURNS[id].tokens;
  });
  return totals;
}

function ContextBudgetPanel({ visibleIds }: { visibleIds: string[] }) {
  const totals = computeCategoryTotals(visibleIds);
  const total = CATEGORY_ORDER.reduce((sum, cat) => sum + totals[cat], 0);

  return (
    <div className="flex h-full w-full flex-col gap-2.5 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-baseline justify-between shrink-0">
        <p className="text-xs uppercase tracking-[0.15em] text-white/40">Context Budget</p>
        <span className="font-mono text-xs text-white/40">{total.toLocaleString()} tok</span>
      </div>

      <div className="flex flex-col gap-2">
        {CATEGORY_ORDER.map((category) => {
          const meta = CATEGORY_META[category];
          const tokens = totals[category];
          const pct = total > 0 ? (tokens / total) * 100 : 0;
          return (
            <div key={category} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/60">{meta.label}</span>
                <span className="font-mono text-white/50">{tokens.toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: meta.color }}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 22 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ContextRotProblem() {
  const navigate = useNavigate();
  const { beat } = useBeats({
    total: BEATS.length,
    onPastEnd: () => navigate("/context-rot-solution-1"),
  });
  const config = BEATS[beat];
  const chatLog = buildChatLog(BEATS, beat);

  return (
    <SceneChrome
      nextHref="/context-rot-solution-1"
      nextLabel="Next: Solution 1 — Sub-Agents →"
      label="Context Rot — Problem"
      totalBeats={BEATS.length}
      currentBeat={beat}
      caption={config.caption}
      sidebar={
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div className="min-h-0 flex-[7]">
            <ChatLogPanel log={chatLog} />
          </div>
          <div className="min-h-0 flex-[3]">
            <ContextBudgetPanel visibleIds={config.visibleIds} />
          </div>
        </div>
      }
    >
      <div className="flex h-full min-h-0 w-full max-w-4xl flex-col items-center justify-center gap-6">
        <div className="flex w-full flex-col items-center gap-5">
          <div className="flex w-full items-center justify-between px-1">
            <TokenCounter tokens={totalTokens(config.visibleIds)} />
            <ZoneLegend />
          </div>

          <ContextBar visibleIds={config.visibleIds} />

          <SignalZoneReadout zone={computeSignalZone(config.visibleIds)} />
        </div>

        <AnimatePresence>
          {config.callout === "missed" && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-lg border border-red-400/30 bg-red-400/10 px-6 py-3 text-xl text-red-300"
            >
              ✗ Re-implements with localStorage — the rule is buried, not recent, not pinned
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneChrome>
  );
}
