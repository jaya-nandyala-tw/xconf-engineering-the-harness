import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBeats } from "../lib/useBeats";
import { useSceneNav } from "../lib/useSceneNav";
import { useSpringNumber } from "../lib/useSpringNumber";
import { SceneChrome } from "../components/SceneChrome";
import { useTheme, inkHex, toneText, type ToneHue } from "../lib/theme";

interface Turn {
  id: string;
  tokens: number;
  text: string;
}

// Same turn set the Problem scene ends on — this scene picks up exactly where that one
// left off (past 40%, exploration dominating) rather than replaying the build-up.
const TURNS: Record<string, Turn> = {
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
  summary: {
    id: "summary",
    tokens: 340,
    text: "Sub-agent summary: httpOnly cookies already implemented in session-manager.ts — reuse setAuthCookie().",
  },
};

const EXPLORATION_IDS = ["grep1", "read1", "testrun", "read5", "read6"];
const EXPLORATION_TOKENS = EXPLORATION_IDS.reduce((sum, id) => sum + TURNS[id].tokens, 0);
const SUBAGENT_SAVINGS_PCT = Math.round((1 - TURNS.summary.tokens / EXPLORATION_TOKENS) * 100);

const CONTEXT_WINDOW = 250_000;
const DUMB_ZONE_THRESHOLD_PCT = 0.4;
const WORDS_PER_TOKEN = 0.75;
const WORDS_PER_PAGE = 275;
const PINNED_IDS = ["sysPrompt", "toolDefs", "sys"];

const FULL_BLOAT_IDS = [
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
];
const AFTER_COLLAPSE_IDS = ["sysPrompt", "toolDefs", "sys", "signal", "specRead", "bug", "t7", "summary"];

type Role = "user" | "harness" | "subagent";
type Bubble = { role: Role; text: string };

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
  summary: "exploration",
  bug: "conversation",
  t7: "conversation",
};

const CATEGORY_ORDER: Category[] = ["rules", "specdocs", "exploration", "conversation"];

const CATEGORY_META: Record<Category, { label: string; color: string }> = {
  rules: { label: "System & rules", color: "#a78bfa" },
  specdocs: { label: "Spec / doc reads", color: "#fbbf24" },
  exploration: { label: "Codebase exploration", color: "#34d399" },
  conversation: { label: "Conversation", color: "#e5e7eb" },
};

interface BeatConfig {
  visibleIds: string[];
  bubble: Bubble;
  caption: string;
  subagentPanel?: "shown" | "collapsed";
  subagentPayoff?: boolean;
}

const BEATS: BeatConfig[] = [
  {
    visibleIds: FULL_BLOAT_IDS,
    bubble: {
      role: "harness",
      text: "Two things filled this window that didn't need to. Let's fix the exploration first.",
    },
    caption: "Picking up from the Problem: past 40%, exploration is the biggest category in the window.",
  },
  {
    visibleIds: FULL_BLOAT_IDS,
    bubble: {
      role: "subagent",
      text: "Delegating the research instead — grep, file reads, test run all run in an isolated sub-context.",
    },
    subagentPanel: "shown",
    caption: "A sub-agent does the same exploration off to the side. Its context is disposable — the main thread never sees it.",
  },
  {
    visibleIds: AFTER_COLLAPSE_IDS,
    bubble: { role: "subagent", text: TURNS.summary.text },
    subagentPanel: "collapsed",
    caption: "It reports back one thing: a condensed summary. The grep output and file contents never touch the main thread.",
  },
  {
    visibleIds: AFTER_COLLAPSE_IDS,
    bubble: { role: "subagent", text: TURNS.summary.text },
    subagentPanel: "collapsed",
    subagentPayoff: true,
    caption: "Same investigation. Same answer. The main thread never had to hold it.",
  },
  {
    visibleIds: AFTER_COLLAPSE_IDS,
    bubble: {
      role: "harness",
      text: "That's cause two handled — and it pulled the window back under 40% too.",
    },
    caption: "Cause two: solved. Cause one — the whole spec file — is Solution 2, next: Progressive Disclosure.",
  },
];

function totalTokens(ids: string[]) {
  return ids.reduce((sum, id) => sum + TURNS[id].tokens, 0);
}

// Light-mode alphas run well above their dark-mode counterparts: the same low alpha that
// reads as a clear tint against the dark wave background washes out to barely-there
// pastel against light mist (measured, not assumed — same asymmetry as inkRgba).
export type ContextTone = "pinned" | "recent" | "middle";

function toneStyle(tone: ContextTone, isLight: boolean): { bg: string; border: string } {
  switch (tone) {
    case "pinned":
      return isLight
        ? { bg: "rgba(16, 150, 100, 0.5)", border: "rgba(13, 120, 80, 0.9)" }
        : { bg: "rgba(52, 211, 153, 0.22)", border: "rgba(52, 211, 153, 0.65)" };
    case "recent":
      return isLight
        ? { bg: "rgba(16, 150, 100, 0.28)", border: "rgba(13, 120, 80, 0.65)" }
        : { bg: "rgba(52, 211, 153, 0.12)", border: "rgba(52, 211, 153, 0.45)" };
    case "middle":
      return isLight
        ? { bg: "rgba(217, 119, 6, 0.5)", border: "rgba(180, 95, 6, 0.85)" }
        : { bg: "rgba(251, 146, 60, 0.22)", border: "rgba(251, 146, 60, 0.55)" };
  }
}

function Segment({
  turn,
  tone,
  isSignal,
  isLight,
}: {
  turn: Turn;
  tone: ContextTone;
  isSignal: boolean;
  isLight: boolean;
}) {
  const style = toneStyle(tone, isLight);
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
      className={`relative flex h-full items-center justify-center border-r border-ink/5 ${
        isSignal ? "z-10 ring-2 ring-inset ring-amber-300/80" : ""
      }`}
    />
  );
}

function ContextBar({ visibleIds, isLight }: { visibleIds: string[]; isLight: boolean }) {
  const pinned = visibleIds.filter((id) => PINNED_IDS.includes(id));
  const rest = visibleIds.filter((id) => !PINNED_IDS.includes(id));
  const recentId = rest[rest.length - 1];
  const middleIds = rest.slice(0, -1);

  const pinnedTokens = totalTokens(pinned);
  const middleTokens = totalTokens(middleIds);
  const recentTokens = recentId ? TURNS[recentId].tokens : 0;

  const usedTokens = pinnedTokens + middleTokens + recentTokens;
  const unusedTokens = Math.max(0, CONTEXT_WINDOW - usedTokens);
  const unusedPct = Math.round((unusedTokens / CONTEXT_WINDOW) * 100);

  const pastThreshold = isPastDumbZoneThreshold(visibleIds);
  const middleTone = pastThreshold ? "middle" : "recent";

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-baseline justify-between text-[11px] uppercase tracking-wide">
        <span className={pastThreshold ? `font-semibold ${toneText(isLight, "orange")}` : "text-ink/35"}>
          {middleIds.length > 0
            ? `conversation & tool output (${middleIds.length}) — ${
                pastThreshold ? "past 40%, filling the dumb zone" : "accumulating, back under 40%"
              }`
            : "system prompt + tools + rules only"}
        </span>
        {unusedTokens > 0 && <span className="text-ink/40">{unusedPct}% of the 250K window still unused</span>}
      </div>

      <motion.div layout className="flex h-20 w-full overflow-hidden rounded-2xl border border-ink/10">
        <AnimatePresence initial={false}>
          {pinned.length > 0 && (
            <motion.div key="pinned-group" layout className="flex" style={{ flexGrow: pinnedTokens, flexBasis: 0 }}>
              {pinned.map((id) => (
                <Segment key={id} turn={TURNS[id]} tone="pinned" isSignal={id === "signal"} isLight={isLight} />
              ))}
            </motion.div>
          )}

          {middleIds.length > 0 && (
            <motion.div key="middle-group" layout className="flex" style={{ flexGrow: middleTokens, flexBasis: 0 }}>
              {middleIds.map((id) => (
                <Segment key={id} turn={TURNS[id]} tone={middleTone} isSignal={id === "signal"} isLight={isLight} />
              ))}
            </motion.div>
          )}

          {recentId && (
            <motion.div key="recent-group" layout className="flex" style={{ flexGrow: recentTokens, flexBasis: 0 }}>
              <Segment turn={TURNS[recentId]} tone="recent" isSignal={recentId === "signal"} isLight={isLight} />
            </motion.div>
          )}

          {unusedTokens > 0 && (
            <motion.div
              key="unused-group"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full border-l border-ink/5 bg-ink/[0.015]"
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
      <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </span>
  );
}

// One row per bar tone instead of a 2-item summary row plus a prose caption that just
// re-explained the same three tones in different words — same information, no redundancy,
// and each swatch is the segment's own border color so the key visually matches the bar.
function ZoneLegend({ isLight }: { isLight: boolean }) {
  return (
    <div className="flex flex-col items-end gap-1 text-[11px] text-ink/50">
      <LegendItem color={toneStyle("pinned", isLight).border} label="Pinned — system prompt, always attended" />
      <LegendItem color={toneStyle("recent", isLight).border} label="Recent — attended, but temporary" />
      <LegendItem color={toneStyle("middle", isLight).border} label='Past 40% — "lost in the middle"' />
    </div>
  );
}

function TokenCounter({ tokens, isLight }: { tokens: number; isLight: boolean }) {
  const { display } = useSpringNumber(tokens, { stiffness: 90, damping: 20, mass: 0.7 });
  const pct = (tokens / CONTEXT_WINDOW) * 100;
  const pctLabel = pct < 0.01 ? "<0.01" : pct.toFixed(1);
  const words = Math.round(tokens * WORDS_PER_TOKEN);
  const pages = Math.max(1, Math.round(words / WORDS_PER_PAGE));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-3xl text-ink/90">{display.toLocaleString()}</span>
        <span className="text-sm text-ink/40">tokens · ≈{pctLabel}% of a 250K window</span>
      </div>
      <p className={`text-xs ${isLight ? "text-orange-700/70" : "text-orange-300/60"}`}>
        the haystack: ≈{words.toLocaleString()} words (~{pages} pages) · the needle: one sentence about cookies
      </p>
    </div>
  );
}

type SignalZone = "pinned" | "safe" | "dumbzone";

function isPastDumbZoneThreshold(visibleIds: string[]) {
  return totalTokens(visibleIds) / CONTEXT_WINDOW >= DUMB_ZONE_THRESHOLD_PCT;
}

function computeSignalZone(visibleIds: string[]): SignalZone | null {
  if (!visibleIds.includes("signal")) return null;
  if (PINNED_IDS.includes("signal")) return "pinned";
  const rest = visibleIds.filter((id) => !PINNED_IDS.includes(id));
  if (rest[rest.length - 1] === "signal") return "safe";
  return isPastDumbZoneThreshold(visibleIds) ? "dumbzone" : "safe";
}

const ZONE_LABEL: Record<SignalZone, { text: string; hue: ToneHue }> = {
  pinned: { text: "pinned — always attended", hue: "blue" },
  safe: { text: "under 40% — still well attended", hue: "emerald" },
  dumbzone: { text: 'dumb zone — "lost in the middle"', hue: "orange" },
};

function SignalZoneReadout({ zone, isLight }: { zone: SignalZone | null; isLight: boolean }) {
  if (!zone) return null;
  const info = ZONE_LABEL[zone];
  return (
    <div className="flex items-center gap-2 text-base">
      <span className={toneText(isLight, "amber")}>★ tracked instruction — currently:</span>
      <span className={`font-mono font-semibold uppercase ${toneText(isLight, info.hue)}`}>{info.text}</span>
    </div>
  );
}

function roleStyle(role: Role, isLight: boolean): { wrap: string; label: string; mono?: boolean } {
  switch (role) {
    case "user":
      return { wrap: "border-ink/10 bg-ink/[0.04] text-ink/80", label: "user" };
    case "harness":
      return {
        wrap: `border-blue-400/30 bg-blue-400/10 ${isLight ? "text-blue-700" : "text-blue-200"}`,
        label: "harness",
      };
    case "subagent":
      return {
        wrap: `border-violet-400/30 bg-violet-400/10 ${isLight ? "text-violet-700" : "text-violet-200"}`,
        label: "sub-agent",
      };
  }
}

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

function ChatLogBubble({ bubble, isLatest, isLight }: { bubble: Bubble; isLatest: boolean; isLight: boolean }) {
  const style = roleStyle(bubble.role, isLight);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border px-3 py-2 text-[13px] leading-snug ${style.wrap} ${
        style.mono ? "font-mono text-xs" : ""
      } ${isLatest ? "ring-1 ring-inset ring-ink/25" : ""}`}
    >
      <span className="mr-1.5 font-mono text-[9px] uppercase tracking-wide opacity-50">{style.label}</span>
      {bubble.text}
    </motion.div>
  );
}

function ChatLogPanel({ log, isLight }: { log: Bubble[]; isLight: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log.length]);

  return (
    <div className="flex h-full w-full flex-col gap-2 rounded-xl border border-ink/10 bg-ink/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-ink/40 shrink-0">Chat</p>
      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {log.map((b, i) => (
            <ChatLogBubble key={`${i}-${b.text}`} bubble={b} isLatest={i === log.length - 1} isLight={isLight} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SubAgentPanel({ state, isLight }: { state: "shown" | "collapsed"; isLight: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {state === "shown" ? (
        <motion.div
          key="shown"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className="w-full rounded-2xl border-2 border-dashed border-violet-400/40 bg-violet-400/[0.04] p-4"
        >
          <div
            className={`mb-2 flex items-center justify-between text-xs uppercase tracking-wide ${
              isLight ? "text-violet-700/80" : "text-violet-300/70"
            }`}
          >
            <span>sub-agent — isolated context</span>
            <span className="font-mono">{EXPLORATION_TOKENS.toLocaleString()} tokens — never touches main thread</span>
          </div>
          <div className="flex h-10 w-full overflow-hidden rounded-xl border border-violet-400/20">
            {EXPLORATION_IDS.map((id) => (
              <div
                key={id}
                style={{ flexGrow: TURNS[id].tokens, flexBasis: 0 }}
                className="h-full border-r border-violet-400/10 bg-violet-400/15"
              />
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="collapsed"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={`rounded-lg border border-violet-400/30 bg-violet-400/10 px-6 py-3 text-lg ${
            isLight ? "text-violet-700" : "text-violet-200"
          }`}
        >
          ✓ Sub-agent collapsed — {EXPLORATION_TOKENS.toLocaleString()} tokens of research reduced to a{" "}
          {TURNS.summary.tokens}-token summary
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SubAgentPayoff({ isLight }: { isLight: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="flex items-center gap-6 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-6 py-4"
    >
      <div className="text-center">
        <p className="font-mono text-2xl font-semibold text-ink/70 line-through decoration-red-400/60">
          {EXPLORATION_TOKENS.toLocaleString()}
        </p>
        <p className="text-xs uppercase tracking-wide text-ink/40">without sub-agent</p>
      </div>
      <span className={`text-2xl ${toneText(isLight, "emerald")}`}>→</span>
      <div className="text-center">
        <p className={`font-mono text-2xl font-semibold ${toneText(isLight, "emerald")}`}>{TURNS.summary.tokens}</p>
        <p className={`text-xs uppercase tracking-wide ${isLight ? "text-emerald-800/80" : "text-emerald-300/70"}`}>
          with sub-agent
        </p>
      </div>
      <div className="ml-2 border-l border-emerald-400/20 pl-6 text-left">
        <p className={`font-mono text-3xl font-semibold ${toneText(isLight, "emerald")}`}>{SUBAGENT_SAVINGS_PCT}%</p>
        <p className={`text-sm ${isLight ? "text-emerald-800/90" : "text-emerald-300/80"}`}>
          less research ever touches the main thread
        </p>
      </div>
    </motion.div>
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

function ContextBudgetPanel({ visibleIds, isLight }: { visibleIds: string[]; isLight: boolean }) {
  const totals = computeCategoryTotals(visibleIds);
  const total = CATEGORY_ORDER.reduce((sum, cat) => sum + totals[cat], 0);

  return (
    <div className="flex h-full w-full flex-col gap-2.5 overflow-y-auto rounded-xl border border-ink/10 bg-ink/[0.03] p-4">
      <div className="flex items-baseline justify-between shrink-0">
        <p className="text-xs uppercase tracking-[0.15em] text-ink/40">Context Budget</p>
        <span className="font-mono text-xs text-ink/40">{total.toLocaleString()} tok</span>
      </div>

      <div className="flex flex-col gap-2">
        {CATEGORY_ORDER.map((category) => {
          const meta = CATEGORY_META[category];
          const color = category === "conversation" ? inkHex(isLight) : meta.color;
          const tokens = totals[category];
          const pct = total > 0 ? (tokens / total) * 100 : 0;
          return (
            <div key={category} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ink/60">{meta.label}</span>
                <span className="font-mono text-ink/50">{tokens.toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
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

export function ContextRotSolution1() {
  const { initialBeat, onPastEnd, onPastStart, nextHref, nextLabel } = useSceneNav(
    "context-rot-solution-1",
    BEATS.length,
  );
  const { beat } = useBeats({ total: BEATS.length, initialBeat, onPastEnd, onPastStart });
  const { isLight } = useTheme();
  const config = BEATS[beat];
  const chatLog = buildChatLog(BEATS, beat);

  return (
    <SceneChrome
      label="Context Rot — Solution 1: Sub-Agents"
      totalBeats={BEATS.length}
      currentBeat={beat}
      caption={config.caption}
      nextHref={nextHref}
      nextLabel={nextLabel}
      sidebar={
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div className="min-h-0 flex-[7]">
            <ChatLogPanel log={chatLog} isLight={isLight} />
          </div>
          <div className="min-h-0 flex-[3]">
            <ContextBudgetPanel visibleIds={config.visibleIds} isLight={isLight} />
          </div>
        </div>
      }
    >
      <div className="flex h-full min-h-0 w-full max-w-4xl flex-col items-center justify-center gap-6">
        <div className="flex w-full flex-col items-center gap-5">
          <div className="flex w-full items-center justify-between px-1">
            <TokenCounter tokens={totalTokens(config.visibleIds)} isLight={isLight} />
            <ZoneLegend isLight={isLight} />
          </div>

          <ContextBar visibleIds={config.visibleIds} isLight={isLight} />

          <SignalZoneReadout zone={computeSignalZone(config.visibleIds)} isLight={isLight} />
        </div>

        {(config.subagentPanel || config.subagentPayoff) && (
          <div className="flex w-full flex-col items-center gap-5">
            {config.subagentPanel && <SubAgentPanel state={config.subagentPanel} isLight={isLight} />}
            {config.subagentPayoff && <SubAgentPayoff isLight={isLight} />}
          </div>
        )}
      </div>
    </SceneChrome>
  );
}
