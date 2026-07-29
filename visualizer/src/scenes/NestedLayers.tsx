import { AnimatePresence, motion } from "framer-motion";
import { useBeats } from "../lib/useBeats";
import { SceneChrome } from "../components/SceneChrome";

interface Layer {
  id: "harness" | "context" | "prompt";
  title: string;
  level: string;
  metaphor: string;
  color: string;
  bullets: string[];
}

const LAYERS: Layer[] = [
  {
    id: "harness",
    title: "Harness Engineering",
    level: "system",
    metaphor: "the operating system",
    color: "#60a5fa",
    bullets: ["Orchestration", "Tool permissions", "Guardrails", "Retry loops"],
  },
  {
    id: "context",
    title: "Context Engineering",
    level: "session",
    metaphor: "the briefing packet",
    color: "#22d3ee",
    bullets: ["Retrieval", "Memory", "Summarization"],
  },
  {
    id: "prompt",
    title: "Prompt Engineering",
    level: "message",
    metaphor: "the job description",
    color: "#fde68a",
    bullets: ["Instructions", "Role", "Examples"],
  },
];

const [HARNESS, CONTEXT, PROMPT] = LAYERS;
type LayerId = Layer["id"];

// A strict chain (harness ⊃ context ⊃ prompt), not a tree — so "the child to render
// inside this layer" is just a lookup, not real recursion over branches.
const CHILD_OF: Record<LayerId, Layer | null> = {
  harness: CONTEXT,
  context: PROMPT,
  prompt: null,
};

const STAGE_W = 680;
const STAGE_H = 560;

interface BeatConfig {
  showDiagram: boolean;
  selected: LayerId | null;
  caption: string;
  pulseHarness?: boolean;
}

const BEATS: BeatConfig[] = [
  {
    showDiagram: false,
    selected: null,
    caption: "The model provides intelligence. The harness makes it useful.",
  },
  {
    showDiagram: true,
    selected: "harness",
    caption: "Outermost layer: the harness — the operating system the agent runs inside.",
  },
  {
    showDiagram: true,
    selected: "context",
    caption: "One level in: context — the briefing packet for this specific session.",
  },
  {
    showDiagram: true,
    selected: "prompt",
    caption: "Innermost: the prompt — the actual message, instructions, and examples.",
  },
  {
    showDiagram: true,
    selected: null,
    caption: "Three layers, nested — not separate systems, one with more or less reach.",
  },
  {
    showDiagram: true,
    selected: "harness",
    pulseHarness: true,
    caption: '"A prompt can REQUEST safety. Only the harness can ENFORCE it."',
  },
];

// All three layers are always on screen and always nested — only the selected one
// expands to its full content (metaphor + bullets); the other two collapse to a title
// bar but keep their box visible, so "this is nested inside something bigger" reads
// directly from the layout instead of depending on a zoom that clips ancestors away.
function LayerBox({
  layer,
  selectedId,
  pulse,
}: {
  layer: Layer;
  selectedId: LayerId | null;
  pulse?: boolean;
}) {
  const isSelected = layer.id === selectedId;
  const child = CHILD_OF[layer.id];

  return (
    <motion.div
      layout
      animate={{
        borderColor: isSelected ? layer.color : `${layer.color}55`,
        backgroundColor: isSelected ? `${layer.color}14` : `${layer.color}0a`,
        boxShadow: pulse
          ? [`0 0 20px ${layer.color}40`, `0 0 48px ${layer.color}80`, `0 0 20px ${layer.color}40`]
          : isSelected
            ? `0 0 30px ${layer.color}30`
            : "0 0 0px rgba(0,0,0,0)",
      }}
      transition={
        pulse
          ? { boxShadow: { duration: 1.8, repeat: Infinity, ease: "easeInOut" }, layout: { duration: 0.5 } }
          : { type: "spring", stiffness: 140, damping: 22 }
      }
      className="flex h-full w-full min-h-0 flex-col rounded-3xl border-2 p-5"
    >
      <motion.div layout="position" className="flex shrink-0 items-baseline gap-2.5">
        <span className="text-base font-semibold uppercase tracking-[0.12em]" style={{ color: layer.color }}>
          {layer.title}
        </span>
        {!isSelected && <span className="text-sm text-white/30">— {layer.metaphor}</span>}
      </motion.div>

      <AnimatePresence mode="wait">
        {isSelected ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex flex-1 min-h-0 flex-col items-center justify-center gap-3 py-4 text-center"
          >
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: layer.color }}>
              {layer.level}-level · {layer.metaphor}
            </p>
            <ul className="flex flex-col items-center gap-2 text-base text-white/60">
              {layer.bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: layer.color }} />
                  {bullet}
                </li>
              ))}
            </ul>
          </motion.div>
        ) : child ? (
          <motion.div
            key="child"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex-1 min-h-0"
          >
            <LayerBox layer={child} selectedId={selectedId} />
          </motion.div>
        ) : null}
      </AnimatePresence>
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
      <p className="font-mono text-4xl font-semibold text-white sm:text-5xl">Agent = Model + Harness.</p>
      <p className="max-w-xl text-lg text-white/50">The model provides intelligence. The harness makes it useful.</p>
    </motion.div>
  );
}

export function NestedLayers() {
  const { beat } = useBeats({ total: BEATS.length });
  const config = BEATS[beat];

  return (
    <SceneChrome
      label="Agent = Model + Harness — Zoom Through the Layers"
      totalBeats={BEATS.length}
      currentBeat={beat}
      caption={config.caption}
    >
      <div className="flex w-full max-w-4xl items-center justify-center">
        <AnimatePresence mode="wait">
          {!config.showDiagram ? (
            <AgentTitle key="title" />
          ) : (
            <motion.div
              key="stage"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ width: STAGE_W, height: STAGE_H }}
            >
              <LayerBox layer={HARNESS} selectedId={config.selected} pulse={config.pulseHarness} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneChrome>
  );
}
