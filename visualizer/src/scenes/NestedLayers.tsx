import { AnimatePresence, motion } from "framer-motion";
import { useBeats } from "../lib/useBeats";
import { useSceneNav } from "../lib/useSceneNav";
import { SceneChrome } from "../components/SceneChrome";

interface Layer {
  id: "harness" | "context" | "prompt";
  title: string;
  level: string;
  metaphor: string;
  color: string;
  // Ring diameter at scale 1 — harness is the biggest (outermost), prompt the smallest
  // (innermost). Zooming into a layer scales the whole ring group up by
  // harness.size / layer.size, so that layer's ring fills the viewport exactly.
  size: number;
  bullets: string[];
}

const LAYERS: Layer[] = [
  {
    id: "harness",
    title: "Harness Engineering",
    level: "system",
    metaphor: "the operating system",
    color: "#a78bfa",
    size: 560,
    bullets: ["Orchestration", "Tool permissions", "Guardrails", "Retry loops"],
  },
  {
    id: "context",
    title: "Context Engineering",
    level: "session",
    metaphor: "the briefing packet",
    color: "#fb923c",
    size: 380,
    bullets: ["Retrieval", "Memory", "Summarization"],
  },
  {
    id: "prompt",
    title: "Prompt Engineering",
    level: "message",
    metaphor: "the job description",
    color: "#fde68a",
    size: 200,
    bullets: ["Instructions", "Role", "Examples"],
  },
];

const HARNESS_SIZE = LAYERS[0].size;
type LayerId = Layer["id"];

// Must stay bigger than HARNESS_SIZE: the zoom scale is normalized so the focused ring
// is always exactly HARNESS_SIZE across (see `scale` below) — if the viewport were
// smaller than that, every focused ring would get cropped into straight edges with only
// its curve peeking through at the corners, instead of reading as a clean circle.
const VIEWPORT = 640;

interface BeatConfig {
  showDiagram: boolean;
  // Which ring the "camera" is zoomed into — null means overview (all three visible,
  // none emphasized), matching "not separate systems, one with more or less reach."
  focused: LayerId | null;
  caption: string;
  pulseHarness?: boolean;
}

const BEATS: BeatConfig[] = [
  {
    showDiagram: false,
    focused: null,
    caption: "The model provides intelligence. The harness makes it useful.",
  },
  {
    showDiagram: true,
    focused: "harness",
    caption: "Outermost layer: the harness — the operating system the agent runs inside.",
  },
  {
    showDiagram: true,
    focused: "context",
    caption: "One level in: context — the briefing packet for this specific session.",
  },
  {
    showDiagram: true,
    focused: "prompt",
    caption: "Innermost: the prompt — the actual message, instructions, and examples.",
  },
  {
    showDiagram: true,
    focused: null,
    caption: "Three layers, nested — not separate systems, one with more or less reach.",
  },
  {
    showDiagram: true,
    focused: "harness",
    pulseHarness: true,
    caption: '"A prompt can REQUEST safety. Only the harness can ENFORCE it."',
  },
];

// One ring per layer, all concentric and always mounted — the "zoom" is the shared
// parent scaling up around their common center, not any one ring animating alone.
function Ring({ layer, isFocused, isDimmed, pulse }: { layer: Layer; isFocused: boolean; isDimmed: boolean; pulse?: boolean }) {
  return (
    <motion.div
      className="absolute rounded-full border-2"
      style={{ width: layer.size, height: layer.size, left: "50%", top: "50%", x: "-50%", y: "-50%" }}
      animate={{
        borderColor: isFocused ? layer.color : `${layer.color}40`,
        backgroundColor: isFocused ? `${layer.color}14` : "rgba(255,255,255,0)",
        opacity: isDimmed ? 0.3 : 1,
        boxShadow: pulse
          ? [`0 0 20px ${layer.color}40`, `0 0 60px ${layer.color}90`, `0 0 20px ${layer.color}40`]
          : isFocused
            ? `0 0 40px ${layer.color}50`
            : "0 0 0px rgba(0,0,0,0)",
      }}
      transition={{
        default: { duration: 0.4 },
        boxShadow: pulse ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 },
      }}
    />
  );
}

function InfoPanel({ layer }: { layer: Layer }) {
  return (
    <motion.div
      key={layer.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-3 text-center"
    >
      <p className="text-sm uppercase tracking-[0.2em]" style={{ color: layer.color }}>
        {layer.title} — {layer.level}-level · {layer.metaphor}
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-lg text-white/70">
        {layer.bullets.map((bullet) => (
          <li key={bullet} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: layer.color }} />
            {bullet}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function AgentTitle() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-4 text-center"
    >
      <p className="font-display text-5xl font-bold text-white sm:text-6xl">Agent = Model + Harness.</p>
      <p className="max-w-xl text-xl text-white/50">The model provides intelligence. The harness makes it useful.</p>
    </motion.div>
  );
}

export function NestedLayers() {
  const { initialBeat, onPastEnd, onPastStart, nextHref, nextLabel } = useSceneNav("nested-layers", BEATS.length);
  const { beat } = useBeats({ total: BEATS.length, initialBeat, onPastEnd, onPastStart });
  const config = BEATS[beat];
  const focusedLayer = config.focused ? LAYERS.find((l) => l.id === config.focused)! : null;
  const scale = focusedLayer ? HARNESS_SIZE / focusedLayer.size : 1;

  return (
    <SceneChrome
      label="Agent = Model + Harness — Zoom Through the Layers"
      totalBeats={BEATS.length}
      currentBeat={beat}
      caption={config.caption}
      nextHref={nextHref}
      nextLabel={nextLabel}
    >
      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-8">
        <AnimatePresence mode="wait">
          {!config.showDiagram ? (
            <AgentTitle key="title" />
          ) : (
            <motion.div
              key="stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-6"
            >
              <div
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]"
                style={{ width: VIEWPORT, height: VIEWPORT }}
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale }}
                  transition={{ type: "spring", stiffness: 90, damping: 20 }}
                  style={{ transformOrigin: "center center" }}
                >
                  {LAYERS.map((layer) => (
                    <Ring
                      key={layer.id}
                      layer={layer}
                      isFocused={config.focused === layer.id}
                      isDimmed={config.focused !== null && config.focused !== layer.id}
                      pulse={config.pulseHarness && layer.id === "harness"}
                    />
                  ))}
                </motion.div>
              </div>

              <div className="min-h-[92px]">
                <AnimatePresence mode="wait">{focusedLayer && <InfoPanel key={focusedLayer.id} layer={focusedLayer} />}</AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneChrome>
  );
}
