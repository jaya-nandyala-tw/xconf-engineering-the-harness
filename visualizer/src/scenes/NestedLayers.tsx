import { AnimatePresence, motion } from "framer-motion";
import { useBeats } from "../lib/useBeats";
import { useSceneNav } from "../lib/useSceneNav";
import { SceneChrome } from "../components/SceneChrome";
import { useTheme, diagramTextHex } from "../lib/theme";

interface Layer {
  id: "harness" | "context" | "prompt";
  title: string;
  level: string;
  // The old per-beat footer caption's descriptive clause, folded in here now that that
  // caption is gone for these beats — this is the one sentence explaining what the layer
  // actually is, so it belongs on the card describing that layer, not in the footer.
  description: string;
  color: string;
  // Ring diameter at scale 1, in vmin — harness is the biggest (outermost), prompt the
  // smallest (innermost). Rings live on the full-screen background layer (see
  // SceneChrome's `background` prop), so vmin keeps them proportional to the actual
  // window instead of a fixed pixel box.
  size: number;
  bullets: string[];
}

const LAYERS: Layer[] = [
  {
    id: "harness",
    title: "Harness Engineering",
    level: "system",
    description: "The operating system the agent runs inside.",
    color: "#a78bfa",
    size: 80,
    bullets: ["Orchestration", "Tool permissions", "Guardrails", "Retry loops"],
  },
  {
    id: "context",
    title: "Context Engineering",
    level: "session",
    description: "The briefing packet for this specific session.",
    color: "#fb923c",
    size: 50,
    bullets: ["Retrieval", "Memory", "Summarization"],
  },
  {
    id: "prompt",
    title: "Prompt Engineering",
    level: "message",
    description: "The actual message, instructions, and examples.",
    color: "#fde68a",
    size: 26,
    bullets: ["Instructions", "Requests", "Examples"],
  },
];

const HARNESS_SIZE = LAYERS[0].size;
type LayerId = Layer["id"];

// Naive harness.size / layer.size would zoom the prompt ring in ~3x, which on the old
// fixed-size boxed diagram pushed harness's ring entirely outside the frame (invisible —
// no part of a circle that much bigger than its viewport crosses the viewport at all).
// Now that the rings render full-screen, there's much more room before that happens, but
// it's still a hard cap rather than free geometry: past ~1.9x on a typical 16:9/16:10
// window, the outermost ring's arc starts exceeding the screen's half-diagonal and
// disappears the same way. Capping the *applied* zoom (not the layers' relative sizes,
// which still drive which ring is biggest/smallest at rest) keeps every ring's curve
// somewhere on screen at every beat.
const MAX_ZOOM_SCALE = 1.9;

interface BeatConfig {
  showDiagram: boolean;
  // Which ring the "camera" is zoomed into — null means overview (all three visible,
  // none emphasized), matching "not separate systems, one with more or less reach."
  focused: LayerId | null;
  // Omitted on the three single-layer beats — their story now lives on the InfoPanel
  // card itself (title + description), not duplicated in the footer. Beats that aren't
  // "about" one specific layer (the intro, the overview, the closing quote) keep theirs.
  caption?: string;
  pulseHarness?: boolean;
}

// Zooms out, not in: prompt (the thing everyone already recognizes) first, then pulls back
// to reveal it's nested inside a context, and pulls back again to reveal the context itself
// runs inside a harness — each step exposing the parent the previous layer's gaps actually
// come from, instead of starting broad and narrowing into specifics.
const BEATS: BeatConfig[] = [
  {
    showDiagram: false,
    focused: null,
  },
  {
    showDiagram: true,
    focused: "prompt",
  },
  {
    showDiagram: true,
    focused: "context",
  },
  {
    showDiagram: true,
    focused: "harness",
  },
  // {
  //   showDiagram: true,
  //   focused: null,
  //   caption: "Three layers, nested — not separate systems, one with more or less reach.",
  // },
  // {
  //   showDiagram: true,
  //   focused: "harness",
  //   pulseHarness: true,
  //   caption: '"A prompt can REQUEST safety. Only the harness can ENFORCE it."',
  // },
];

// One ring per layer, all concentric and always mounted — the "zoom" is the shared
// parent scaling up around their common center, not any one ring animating alone.
function Ring({
  layer,
  isFocused,
  isDimmed,
  pulse,
  isLight,
}: {
  layer: Layer;
  isFocused: boolean;
  isDimmed: boolean;
  pulse?: boolean;
  isLight: boolean;
}) {
  // A pale color (prompt's #fde68a) at 25% alpha reads clearly against the dark wave
  // background but nearly disappears against light mist — bump the unfocused alpha in
  // light theme so every ring stays legible, not just the currently-focused one.
  const unfocusedAlpha = isLight ? "70" : "40";
  return (
    <motion.div
      className="absolute rounded-full border-2"
      style={{
        width: `${layer.size}vmin`,
        height: `${layer.size}vmin`,
        left: "50%",
        top: "50%",
        x: "-50%",
        y: "-50%",
      }}
      animate={{
        borderColor: isFocused ? layer.color : `${layer.color}${unfocusedAlpha}`,
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

function InfoPanel({ layer, isLight }: { layer: Layer; isLight: boolean }) {
  return (
    <motion.div
      key={layer.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-3 text-center"
    >
      {/* Ring uses layer.color at full saturation for its border/glow (fine as a bold
          decorative shape either theme) — but as body text on light mist that same
          violet/orange/pale-yellow drops to ~1.5-2.4:1, so text gets the darkened swap. */}
      <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: diagramTextHex(layer.color, isLight) }}>
        {layer.level}-level
      </p>
      <h2 className="font-display text-4xl font-bold leading-tight text-ink sm:text-6xl">{layer.title}</h2>
      <p className="max-w-md text-xl text-ink/60">{layer.description}</p>
      <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-base text-ink/70">
        {layer.bullets.map((bullet) => (
          <li key={bullet} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: layer.color }} />
            {bullet}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// The one beat where all three rings show at once (focused === null, showDiagram true) —
// InfoPanel only ever describes a single layer, so without this the audience loses the
// color-to-layer mapping right when it matters most: the moment meant to prove they nest.
function LegendRow({ isLight }: { isLight: boolean }) {
  return (
    <motion.div
      key="legend"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
    >
      {LAYERS.map((layer) => (
        <span
          key={layer.id}
          className="flex items-center gap-2 text-sm uppercase tracking-[0.15em]"
          style={{ color: diagramTextHex(layer.color, isLight) }}
        >
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: layer.color }} />
          {layer.title}
        </span>
      ))}
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
      <p className="font-display whitespace-nowrap text-6xl font-bold leading-tight text-ink sm:text-6xl">Agent = Model + Harness.</p>
      <p className="max-w-2xl text-3xl text-ink/60">The model provides intelligence. The harness makes it useful.</p>
    </motion.div>
  );
}

export function NestedLayers() {
  const { initialBeat, onPastEnd, onPastStart, nextHref, nextLabel } = useSceneNav("nested-layers", BEATS.length);
  const { beat } = useBeats({ total: BEATS.length, initialBeat, onPastEnd, onPastStart });
  const { isLight } = useTheme();
  const config = BEATS[beat];
  const focusedLayer = config.focused ? LAYERS.find((l) => l.id === config.focused)! : null;
  const scale = focusedLayer ? Math.min(HARNESS_SIZE / focusedLayer.size, MAX_ZOOM_SCALE) : 1;

  return (
    <SceneChrome
      label="Agent = Model + Harness — Zoom Through the Layers"
      totalBeats={BEATS.length}
      currentBeat={beat}
      caption={config.caption}
      nextHref={nextHref}
      nextLabel={nextLabel}
      background={
        config.showDiagram && (
          <motion.div
            key="rings"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
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
                  isLight={isLight}
                />
              ))}
            </motion.div>
          </motion.div>
        )
      }
    >
      <div
        className={
          config.showDiagram
            ? "flex w-full max-w-2xl flex-col items-center justify-center gap-6 rounded-3xl bg-surface/70 px-6 py-6 text-center backdrop-blur-sm"
            : "flex w-full max-w-5xl flex-col items-center justify-center gap-8"
        }
      >
        <AnimatePresence mode="wait">
          {!config.showDiagram ? (
            <AgentTitle key="title" />
          ) : focusedLayer ? (
            <InfoPanel key={focusedLayer.id} layer={focusedLayer} isLight={isLight} />
          ) : (
            <LegendRow key="legend" isLight={isLight} />
          )}
        </AnimatePresence>
      </div>
    </SceneChrome>
  );
}
