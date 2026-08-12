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
  rules: { label: "System & rules", color: "#a78bfa" },
  specdocs: { label: "Spec / doc reads", color: "#fbbf24" },
  exploration: { label: "Codebase exploration", color: "#4ade80" },
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
    caption: "The rule lands in an empty window. The model reads attentively.",
  },
  {
    visibleIds: ["sysPrompt", "toolDefs", "sys", "signal", "specRead"],
    bubble: { role: "tool", text: TURNS.specRead.text },
    callout: "none",
    caption: "Cause 1: one question about the rule, and the agent reads the entire spec file.",
  },
  {
    visibleIds: ["sysPrompt", "toolDefs", "sys", "signal", "specRead", "grep1"],
    bubble: { role: "tool", text: TURNS.grep1.text },
    callout: "none",
    caption: "Cause 2 : Agent goes looking in the code — grep across the repo.",
  },
  {
    visibleIds: ["sysPrompt", "toolDefs", "sys", "signal", "specRead", "grep1", "read1"],
    bubble: { role: "tool", text: TURNS.read1.text },
    callout: "none",
    caption: "Reading this one file costs 6,800 tokens.",
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
    caption: "As file grows, exploration becomes the single largest category in the window.",
  },
  {
    visibleIds: ["sysPrompt", "toolDefs", "sys", "signal", "specRead", "grep1", "read1", "testrun", "read5", "read6"],
    bubble: { role: "tool", text: TURNS.read6.text },
    callout: "none",
    caption: "Imports pull in three more irrelevant files. That's the 40% line — crossed.",
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
    caption: "Bigger context windows don't fix this — they just make the haystack bigger.",
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
    caption: "Two fixes: sub-agents and progressive disclosure",
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
      <div className="flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm uppercase tracking-wide">
        <span className={pastThreshold ? `font-semibold ${toneText(isLight, "orange")}` : "text-ink/35"}>
          {middleIds.length > 0
            ? `conversation & tool output (${middleIds.length}) — ${
                pastThreshold ? "past 40%, filling the dumb zone" : "accumulating, still under 40%"
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
    <div className="flex flex-col items-end gap-1 text-xs text-ink/50">
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
        <span className="text-base text-ink/40">tokens · ≈{pctLabel}% of a 250K window</span>
      </div>
      <p className={`text-sm ${isLight ? "text-orange-700/70" : "text-orange-300/60"}`}>
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
    case "tool":
      // Bubble backdrop is fixed dark (a "terminal" look) regardless of theme, so its
      // light-on-dark text stays legible in both modes. bg-black/40 would look right on
      // the dark wave surface but composites to a muddy gray-green over light mist since
      // it's translucent — bg-wave is opaque and always the same dark teal underneath.
      return { wrap: "border-emerald-400/20 bg-wave text-emerald-300/90", label: "tool", mono: true };
  }
}

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

function ChatLogBubble({ bubble, isLatest, isLight }: { bubble: Bubble; isLatest: boolean; isLight: boolean }) {
  const style = roleStyle(bubble.role, isLight);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border px-3 py-2 text-[15px] leading-snug ${style.wrap} ${
        style.mono ? "font-mono text-sm" : ""
      } ${isLatest ? "ring-1 ring-inset ring-ink/25" : ""}`}
    >
      <span className="mr-1.5 font-mono text-[10px] uppercase tracking-wide opacity-50">{style.label}</span>
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
      <p className="text-sm uppercase tracking-[0.15em] text-ink/40 shrink-0">Chat</p>
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
        <p className="text-sm uppercase tracking-[0.15em] text-ink/40">Context Budget</p>
        <span className="font-mono text-sm text-ink/40">{total.toLocaleString()} tok</span>
      </div>

      <div className="flex flex-col gap-2">
        {CATEGORY_ORDER.map((category) => {
          const meta = CATEGORY_META[category];
          // "conversation"'s data color is a near-white neutral — fine on the dark wave
          // backdrop, invisible against light mist, so it swaps for a dark-slate equivalent.
          const color = category === "conversation" ? inkHex(isLight) : meta.color;
          const tokens = totals[category];
          const pct = total > 0 ? (tokens / total) * 100 : 0;
          return (
            <div key={category} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
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

export function ContextRotProblem() {
  const { initialBeat, onPastEnd, onPastStart, nextHref, nextLabel } = useSceneNav("context-rot-problem", BEATS.length);
  const { beat } = useBeats({ total: BEATS.length, initialBeat, onPastEnd, onPastStart });
  const { isLight } = useTheme();
  const config = BEATS[beat];
  const chatLog = buildChatLog(BEATS, beat);

  return (
    <SceneChrome
      nextHref={nextHref}
      nextLabel={nextLabel}
      label="Context Rot — Problem"
      totalBeats={BEATS.length}
      currentBeat={beat}
      caption={config.caption}
      sidebarClassName="w-[30%]"
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

        <AnimatePresence>
          {config.callout === "missed" && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-lg border border-turmeric/30 bg-turmeric/10 px-6 py-3 text-xl text-turmeric"
            >
              ✗ Re-implements with localStorage — the rule is buried, not recent, not pinned
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneChrome>
  );
}
