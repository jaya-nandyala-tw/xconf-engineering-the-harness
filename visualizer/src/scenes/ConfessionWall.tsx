import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBeats } from "../lib/useBeats";
import { useSceneNav } from "../lib/useSceneNav";
import { SceneChrome } from "../components/SceneChrome";

interface Confession {
  confession: string;
  failure: string;
  source: string;
}

// Verbatim from the brief, not paraphrased — these read as real quotes from real
// people, not marketing copy, and that's the whole point of a "confession wall."
const CONFESSIONS: Confession[] = [
  {
    confession:
      "The agent spent 18 tool calls grepping routes, inspecting middleware, and reading files just to figure out where to make a single edit. By the time it started writing code, half its context window was burned on orientation, causing degraded reasoning and hallucinations.",
    failure: "Wasting the model's highest-attention reasoning window on repo navigation.",
    source: "Reddit User",
  },
  {
    confession:
      "Instead of using our existing database client and `useAuth()` hook, the agent hallucinated and wrote 200 lines of duplicate custom helper functions because it didn't know our shared internal modules existed.",
    failure: "Unstructured context windows and lack of repository-level symbol visibility.",
    source: "Reddit User",
  },
  {
    confession:
      "I spent days guiding an agent through a complex feature, dynamically steering it as requirements shifted due to external blockers. But somewhere along the way, it silently compacted its memory, dropping my crucial mid-flight corrections. It proudly declared the task 'Done', completely oblivious to the fact that it had reverted to the initial, outdated plan.",
    failure:
      "Relying on the LLM's implicit context window management for long-running, multi-session tasks instead of maintaining persistent memory or plan file to track steering log.",
    source: "Thoughtworker",
  },
  {
    confession:
      "I asked the agent to fix a single null-pointer bug in a helper function. Instead, it decided the file was 'messy', ignored my instructions, and rewrote the entire module using a completely different design pattern. It 'fixed' the bug, but broke 45 imports across the project and nuked the CI.",
    failure:
      "Lack of blast-radius constraints, read-only file protections, and failure to enforce strict diff boundaries for localized tasks.",
    source: "Hacker News Commenter",
  },
  {
    confession:
      "The agent confidently imported a new library to solve my date parsing issue and wrote perfectly logical, highly documented code. It wasn't until I tried to build the project that I realized the library didn't exist—it had hallucinated a popular Python package inside our TypeScript project.",
    failure: "Disconnected reasoning environments without a real-time, interactive LSP or compiler feedback loop during the generation phase.",
    source: "Reddit User",
  },
  {
    confession: "Our agent connected to internal MCP tools that returned massive API responses, raw JSON payloads. It burned through 80% of its context window on unformatted responses before writing a single line of code, causing severe reasoning degradation and syntax errors.",
    failure: "Ingesting raw tool outputs directly into context instead of using structured context pruning and schema adapters.",
    source: "Hacker News Commenter"
  },
];

// Tuned for "reads as typing, not a slideshow" — fast enough that even the longest
// confession (~320 characters) finishes in well under 6 seconds.
const MS_PER_CHAR = 18;
// "pause for 5-7 seconds" — randomized within that window rather than fixed, so
// consecutive loops don't feel metronomic to anyone watching more than one cycle.
const READ_MS_MIN = 5000;
const READ_MS_MAX = 7000;

// Fisher-Yates — a fresh shuffle every time the order is exhausted, so all 6 confessions
// show once before any repeats (the actual requirement), not just "roughly random."
function shuffledIndices(length: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

type Phase = "typing" | "revealed" | "exiting";

export function ConfessionWall() {
  // Still a normal stop in the deck's own chain (one beat) — → moves on to the title
  // slide whenever the presenter's ready, ← comes back from it. The confession loop
  // itself runs on its own timers, completely independent of beat state.
  const { initialBeat, onPastEnd, onPastStart, nextHref, nextLabel } = useSceneNav("confession-wall", 1);
  const { beat } = useBeats({ total: 1, initialBeat, onPastEnd, onPastStart });

  const orderRef = useRef<number[]>(shuffledIndices(CONFESSIONS.length));
  const posRef = useRef(0);
  const [confessionIndex, setConfessionIndex] = useState(orderRef.current[0]);
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedLength, setTypedLength] = useState(0);

  const confession = CONFESSIONS[confessionIndex];
  const fullyTyped = typedLength >= confession.confession.length;

  // Typing effect: one character per tick until the confession is fully on screen.
  useEffect(() => {
    if (phase !== "typing" || fullyTyped) return;
    const t = setTimeout(() => setTypedLength((n) => n + 1), MS_PER_CHAR);
    return () => clearTimeout(t);
  }, [phase, typedLength, fullyTyped]);

  // Hands off to "revealed" the instant typing finishes — this is what triggers the
  // Failure/Source fade-in below.
  useEffect(() => {
    if (phase === "typing" && fullyTyped) setPhase("revealed");
  }, [phase, fullyTyped]);

  // The read pause, then start the exit fade.
  useEffect(() => {
    if (phase !== "revealed") return;
    const readMs = READ_MS_MIN + Math.random() * (READ_MS_MAX - READ_MS_MIN);
    const t = setTimeout(() => setPhase("exiting"), readMs);
    return () => clearTimeout(t);
  }, [phase]);

  // Fires from AnimatePresence once the card's own exit animation actually finishes
  // playing (not just when we ask it to start) — advances to the next confession in the
  // shuffled order, reshuffling once every confession has had a turn, and hands back to
  // "typing" so the next card mounts fresh via its own enter animation.
  const handleExitComplete = useCallback(() => {
    posRef.current += 1;
    if (posRef.current >= orderRef.current.length) {
      posRef.current = 0;
      orderRef.current = shuffledIndices(CONFESSIONS.length);
    }
    setConfessionIndex(orderRef.current[posRef.current]);
    setTypedLength(0);
    setPhase("typing");
  }, []);

  const typedText = confession.confession.slice(0, typedLength);

  return (
    <SceneChrome
      label="Confession Wall"
      totalBeats={1}
      currentBeat={beat}
      nextHref={nextHref}
      nextLabel={nextLabel}
      background={
        // Full-bleed instead of a boxed card — the point is presence while the room is
        // still filling in, not a UI chrome metaphor. One slow ambient pulse is the only
        // thing still moving during the 5-7s read pause, so the screen never looks like
        // it's frozen; the oversized ghost quotation mark is the one bold, editorial
        // flourish this scene spends its "wow" budget on.
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <motion.div
            className="h-[75vmin] w-[75vmin] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(204,133,10,0.18), transparent 68%)" }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.9, 0.55] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <span
            className="text-turmeric/[0.14] absolute top-[14vmin] left-[6vw] select-none font-display"
            style={{ fontSize: "34vmin", lineHeight: 1 }}
            aria-hidden
          >
            “
          </span>
        </div>
      }
    >
      <div className="flex w-full max-w-5xl flex-col items-center gap-3">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-ink/30">While you find your seats</p>

        {/* Fixed height AND top-anchored (not centered) — centering the block meant its
            start line moved every time depending on the *final* typed+revealed height,
            which reads as the text jumping even though the box itself was fixed. Every
            confession now starts typing from the same top line and grows downward, like
            an actual typewriter, regardless of how long it ends up being. */}
        <div className="flex h-[660px] w-full items-start justify-center pt-10">
          <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
            {phase !== "exiting" && (
              <motion.div
                key={confessionIndex}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.5 }}
                className="flex w-full flex-col items-start gap-10"
              >
                {/* text-left, not centered — typing into a centered line recenters the
                    whole line on every keystroke, so partial text visibly grows outward
                    from the middle instead of reading left-to-right like an actual
                    typewriter. Left-aligned also reads more like a real confession/log
                    entry than a centered pull-quote. */}
                <p className="w-full font-display text-4xl leading-snug text-ink sm:text-[44px]">
                  {typedText}
                  <span className="text-turmeric animate-pulse">▮</span>
                </p>

                <AnimatePresence>
                  {phase !== "typing" && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="flex w-full flex-col items-start gap-4"
                    >
                      <p className="w-full text-2xl leading-snug text-ink/70 flex items-start gap-2.5">
                        <span className="rounded-full bg-turmeric h-7 px-3.5 min-w-[128px] py-1.5 mt-1 text-xs font-bold uppercase tracking-[0.15em] text-white">
                          The Failure
                        </span>
                        {confession.failure}
                      </p>
                      <p className="w-full font-display text-xl italic text-ink/40 text-right mr-16">— {confession.source}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SceneChrome>
  );
}
