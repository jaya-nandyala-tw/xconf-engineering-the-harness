import type { ComponentType } from "react";
import type { IconName } from "../components/slides/Icon";
import { SlideFilePathMatch } from "../components/slides/bespoke/SlideFilePathMatch";
import { SlideAgentPersonas } from "../components/slides/bespoke/SlideAgentPersonas";
import { SlidePRDiff } from "../components/slides/bespoke/SlidePRDiff";
import { SlidePRSummary } from "../components/slides/bespoke/SlidePRSummary";
import presenterJayaPhoto from "../assets/brand/presenter-jaya.jpeg";
import presenterPrabinaPhoto from "../assets/brand/presenter-prabina.jpeg";

export type Accent = "flamingo" | "sapphire" | "jade" | "turmeric" | "amethyst";

export interface DeckSection {
  id: number;
  title: string;
  // Who owns this section on stage — edit freely before/during rehearsal sync-ups.
  presenter: string;
  // Length of this section in minutes. The gallery's displayed time range and Presenter
  // Preview's pace timer both derive from this, so rebalancing one section's minutes here
  // automatically shifts every downstream section's planned start time — nothing else to
  // update by hand. Sums to the talk's total planned length (30 min today).
  plannedMinutes: number;
  accent: Accent;
}

// Sapphire excluded — same teal family as the `wave` background, so it reads low-contrast
// on the actual chrome (confirmed in review: section numbers and borders in it washed out).
const ACCENT_CYCLE: Accent[] = ["flamingo", "jade", "turmeric", "amethyst"];

// Renumbered sequentially (1-10) to match final array/chronological order. "Make it
// reviewable" is restored as its own standalone section (id 8, "The Third Layer —
// Reviewability") rather than folded into Sensors (id 6) — sensors catching a mistake
// doesn't help if nobody can review what's left, so it earns its own chapter card between
// Context rot (id 7) and the 5 principles recap (id 9). Context rot's two solution scenes
// (sub-agents, progressive disclosure) still live inside their own section, preserving
// scenes.ts's own native Problem -> Solution 1 -> Solution 2 grouping.
export const SECTIONS: DeckSection[] = [
  { id: 1, title: "Title + hook + agenda", presenter: "Jaya + Prabina", plannedMinutes: 1.5 },
  { id: 2, title: "The core idea", presenter: "Prabina", plannedMinutes: 3.5 },
  { id: 3, title: "The problem, generalized", presenter: "Jaya", plannedMinutes: 4 },
  { id: 4, title: "Layer 1 — Guides", presenter: "Jaya", plannedMinutes: 3 },
  { id: 5, title: "Ask Before Deciding", presenter: "Prabina", plannedMinutes: 2.5 },
  { id: 6, title: "Layer 2 — Sensors", presenter: "Prabina", plannedMinutes: 4 },
  { id: 7, title: "Context rot — the open problem", presenter: "Jaya", plannedMinutes: 4.5 },
  { id: 8, title: "The Third Layer — Reviewability", presenter: "Prabina", plannedMinutes: 3.5 },
  { id: 9, title: "5 principles for any team", presenter: "Jaya", plannedMinutes: 2.5 },
  { id: 10, title: "Self-score + recap + close", presenter: "Jaya + Prabina", plannedMinutes: 1 },
].map((s, i) => ({ ...s, accent: ACCENT_CYCLE[i % ACCENT_CYCLE.length] }));

export type SlideKind =
  | "cover"
  | "presenters"
  | "statement"
  | "agenda"
  | "list"
  | "table"
  | "two-column"
  | "video-placeholder"
  | "close"
  | "divider"
  | "bespoke";

export interface CoverContent {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export interface PresentersContent {
  // photo is left undefined until real headshots are exported from Drive and dropped
  // into src/assets/brand/ — the slide renders a clear "photo pending" placeholder until then.
  people: { name: string; title: string; bio: string; photo?: string }[];
}

export interface StatementContent {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: IconName;
  // When true, SlideStatement splits `title` on " + " and stacks the clauses on their
  // own lines with the "+" as its own line in flamingo — for statements that are
  // literally structured as "A + B" (e.g. S8's root-cause line).
  highlightPlus?: boolean;
}

export interface AgendaContent {
  items: { icon: IconName; label: string }[];
}

export interface ListContent {
  heading: string;
  subheading?: string;
  items: string[];
  style: "bullet" | "numbered" | "check";
}

export interface TableContent {
  heading: string;
  columns: string[];
  rows: string[][];
}

export interface TwoColumnContent {
  heading: string;
  left: { label: string; body: string };
  right: { label: string; body: string };
}

export interface VideoPlaceholderContent {
  heading: string;
  setupLine: string;
  src?: string;
  callouts: string[];
}

export interface CloseContent {
  quote: string;
  recapLine: string;
  icon?: IconName;
}

// A chapter card between major sections — see SlideDivider. Content is authored inline
// per divider rather than derived from SECTIONS at render time, same as every other
// static slide in this file.
export interface DividerContent {
  title: string;
  subtitle?: string;
  accent: Accent;
}

export type SlideContent =
  | CoverContent
  | PresentersContent
  | StatementContent
  | AgendaContent
  | ListContent
  | TableContent
  | TwoColumnContent
  | VideoPlaceholderContent
  | CloseContent
  | DividerContent;

export interface StaticDeckItem {
  kind: "static";
  id: string;
  section: number;
  navLabel: string;
  slideKind: SlideKind;
  revealMode?: "all" | "sequential";
  content: SlideContent;
  // Only set when slideKind === "bespoke" — a deliberate escape hatch for one-off
  // diagrams (S12, S13) that aren't worth generalizing into a SlideKind of their own.
  bespokeComponent?: ComponentType<{ content: StatementContent }>;
  // Presenter-only talking points — never rendered on the audience screen (see
  // PresentationSpeakerNotes / the Presenter View / Audience View window split).
  // One note per deck item, not per beat, even for slides with sequential reveals.
  notes?: string;
}

export interface InteractiveDeckItem {
  kind: "interactive";
  id: string;
  section: number;
  navLabel: string;
  route: string;
  sceneSlug: string;
  coversSlides: string[];
  // Same as StaticDeckItem.notes — one note for the whole scene, not per internal beat
  // (interactive scenes have their own BEATS arrays with many sub-steps; splitting notes
  // to that granularity is more plumbing than a first cut needs).
  notes?: string;
}

export type DeckItem = StaticDeckItem | InteractiveDeckItem;

// Full talk order — mirrors 04-slide-outline.md, cross-checked against 01-talk-outline.md
// and the joint-talk collab docs (11-collab-doc-draft.md, 12-ai-workflows-potential-content.md).
// Placeholders below ([PLACEHOLDER] / [BACKLOG]) mark content or scenes not yet built.
export const DECK: DeckItem[] = [
  // Loops on its own timers while the room settles in — → chains into the title slide
  // whenever the presenter's ready, same as any other scene-to-scene transition.
  {
    kind: "interactive",
    id: "confession-wall",
    section: 1,
    navLabel: "Confession Wall",
    route: "/confession-wall",
    sceneSlug: "confession-wall",
    coversSlides: [],
    notes: "Walk-in loop — let it run while people find seats. Advance to the title slide when you're ready to start.",
  },
  {
    kind: "static",
    id: "s1",
    section: 1,
    navLabel: "Title",
    slideKind: "cover",
    content: {
      eyebrow: "XConf 2026",
      title: "Engineering the Harness",
      subtitle: "Making AI Coding Agents Actually Reliable",
    } satisfies CoverContent,
    notes: "Let the room settle before advancing. Introduce the talk in one sentence before the hook slide — don't read the subtitle verbatim.",
  },
  {
    kind: "static",
    id: "s1b",
    section: 1,
    navLabel: "Presenters",
    slideKind: "presenters",
    content: {
      people: [
        {
          name: "Jaya Simha Reddy Nandyala",
          title: "Senior Consultant | Full Stack Engineer",
          bio: "7+ years building enterprise apps across React, Python, and Java Spring Boot — now designing harness-engineering systems that make AI coding agents reliable across large, multi-repo codebases.",
          photo: presenterJayaPhoto,
        },
        {
          name: "Prabina Pani",
          title: "Tech Lead | AIFSD Practitioner",
          bio: "10 years in software development — designs and maintains agentic SDLC tooling, and the practical guardrails needed to run AI agents safely on production, multi-repo codebases.",
          photo: presenterPrabinaPhoto,
        },
      ],
    } satisfies PresentersContent,
  },
  {
    kind: "static",
    id: "s2",
    section: 1,
    navLabel: "Hook",
    slideKind: "statement",
    content: {
      title: "Who's had an AI assistant confidently ignore every convention on their team?",
    } satisfies StatementContent,
  },
  {
    kind: "static",
    id: "s3",
    section: 1,
    navLabel: "Agenda",
    slideKind: "agenda",
    revealMode: "sequential",
    content: {
      items: [
        { icon: "layers", label: "What a harness is" },
        { icon: "compass", label: "Guides" },
        { icon: "loop", label: "Sensors" },
        { icon: "checklist", label: "Make it reviewable" },
      ],
    } satisfies AgendaContent,
  },
  {
    kind: "interactive",
    id: "nested-layers",
    section: 2,
    navLabel: "Agent = Model + Harness",
    route: "/nested-layers",
    sceneSlug: "nested-layers",
    coversSlides: ["S4", "S5", "S6"],
    notes: "This is the whole talk's thesis in one diagram — don't rush it. Pause on the closing pulse beat and let the quote land before moving on.",
  },
  {
    kind: "static",
    id: "divider-problem",
    section: 3,
    navLabel: "Section: The problem",
    slideKind: "divider",
    content: {
      title: "AI's blind spot: Multi-repo Codebases",
      accent: "turmeric",
    } satisfies DividerContent,
  },
  {
    kind: "static",
    id: "s7",
    section: 3,
    navLabel: "The shape of the problem",
    slideKind: "list",
    revealMode: "sequential",
    content: {
      heading: "The shape of the problem",
      items: [
    "No single view across repos",
    "Agent sees only one file at a time",
    "Agent never checks its own work",
    "Cross-repo blast radius missed in planning",
    "Over-gating stalls everything",
    "Big diffs turn review into bottleneck"
     ],
      style: "bullet",
    } satisfies ListContent,
  },
  {
    kind: "interactive",
    id: "workspace-wrapper",
    section: 3,
    navLabel: "Cross-repo blast radius",
    route: "/workspace-wrapper",
    sceneSlug: "workspace-wrapper",
    coversSlides: [],
  },
  {
    kind: "static",
    id: "s8",
    section: 3,
    navLabel: "Root cause",
    slideKind: "statement",
    content: {
      title: "AI generated code quality = The context it's given + Feedback loops that correct it",
      highlightPlus: true,
    } satisfies StatementContent,
  },
  {
    kind: "static",
    id: "s9",
    section: 3,
    navLabel: "Transition",
    slideKind: "two-column",
    content: {
      heading: "So we built two layers",
      left: { label: "Before", body: "One prompt, hoping the model guesses your conventions right." },
      right: { label: "After", body: "Guides steer it before it acts. Sensors catch it after." },
    } satisfies TwoColumnContent,
  },
  {
    kind: "static",
    id: "s10",
    section: 4,
    navLabel: "Guides",
    slideKind: "statement",
    content: {
      icon: "compass",
      title: "Guides steer the agent before it acts.",
    } satisfies StatementContent,
  },
  {
    kind: "static",
    id: "s11",
    section: 4,
    navLabel: "Seven primitives",
    slideKind: "table",
    content: {
      heading: "Seven primitives",
      columns: ["Primitive", "What it does", "When it loads"],
      rows: [
        ["Global instructions", "Rules that always apply", "Every interaction"],
        ["Scoped instructions", "Domain rules tied to file path", "When editing matching files"],
        ["Agents", "Restricted personas", "When explicitly invoked"],
        ["Skills", "Repeatable multi-step workflows", "When explicitly invoked"],
        ["Prompts", "Single-task focused templates", "When explicitly invoked"],
        ["Specs", "The architecture knowledge base", "When referenced by the above"],
        ["Confirmation gates", "Blocks on irreversible/cross-cutting decisions until a human confirms", "When scope is ambiguous or blast radius crosses repos"],
      ],
    } satisfies TableContent,
  },
  {
    kind: "static",
    id: "s12",
    section: 4,
    navLabel: "Progressive disclosure",
    slideKind: "bespoke",
    content: {
      eyebrow: "Progressive disclosure",
      title: "Load only what's relevant.",
    } satisfies StatementContent,
    bespokeComponent: SlideFilePathMatch,
  },
  {
    kind: "static",
    id: "s13",
    section: 4,
    navLabel: "Least privilege",
    slideKind: "bespoke",
    content: {
      eyebrow: "Least privilege",
      title: "A read-only agent cannot edit files.",
    } satisfies StatementContent,
    bespokeComponent: SlideAgentPersonas,
  },
  {
    kind: "static",
    id: "s13b",
    section: 4,
    navLabel: "Gate only what's irreversible",
    slideKind: "statement",
    content: {
      icon: "lock",
      eyebrow: "Default everything else",
      title: "Gate only what's irreversible.",
      subtitle:
        "Gate the decisions you can't cheaply undo — repo scope, cross-service changes. Everything else gets a visible default.",
    } satisfies StatementContent,
  },
  {
    kind: "static",
    id: "s14a",
    section: 5,
    navLabel: "Ask Before Deciding",
    slideKind: "statement",
    content: {
      icon: "lock",
      eyebrow: "Reduce hallucinations",
      title: "Ask Before Deciding",
      subtitle:
        "A structured intake, a blocking gate, a visible default — all before any codebase exists.",
    } satisfies StatementContent,
  },
  {
    kind: "interactive",
    id: "s14b",
    section: 5,
    navLabel: "Input Collection Gate",
    route: "/input-collection-gate",
    sceneSlug: "input-collection-gate",
    coversSlides: ["S14b"],
  },
  {
    kind: "static",
    id: "s15",
    section: 6,
    navLabel: "Sensors",
    slideKind: "statement",
    content: {
      icon: "loop",
      title: "Sensors catch mistakes after the agent acts, and feed the error back.",
    } satisfies StatementContent,
  },
  {
    kind: "interactive",
    id: "guides-sensors",
    section: 6,
    navLabel: "Guides → Sensors",
    route: "/guides-sensors",
    sceneSlug: "guides-sensors",
    coversSlides: ["S16"],
  },
  {
    kind: "static",
    id: "divider-context-rot",
    section: 7,
    navLabel: "Section: Context rot",
    slideKind: "divider",
    content: {
      title: "Context rot — the open problem",
      subtitle: "Guides and sensors both still run inside a context window. Now, the honest part.",
      accent: "turmeric",
    } satisfies DividerContent,
  },
  {
    kind: "interactive",
    id: "context-rot-problem",
    section: 7,
    navLabel: "Context Rot — Problem",
    route: "/context-rot-problem",
    sceneSlug: "context-rot-problem",
    coversSlides: ["S19", "S20"],
  },
  // The standalone S19 statement slide ("Bigger context windows don't fix this — they
  // just make the haystack bigger.") was cut — it duplicated this scene's own second-to-last
  // beat caption verbatim (ContextRotProblem.tsx's BEATS entries), which already lands the
  // same line before the following beat previews both solution scenes. coversSlides above
  // already documented that this scene covers S19 — the standalone slide was the actual
  // redundant copy.
  // Sub-agents (Solution 1) and progressive disclosure (Solution 2) now live here, right
  // after the problem they fix, instead of inside Guides/Sensors — restoring scenes.ts's
  // own native Problem -> Solution 1 -> Solution 2 grouping. This is also a capstone: both
  // techniques reuse mechanisms (restricted sub-agents, scoped loading) already introduced
  // in Guides, so it reads as "here's those tools applied to a genuinely hard problem."
  {
    kind: "interactive",
    id: "context-rot-solution-1",
    section: 7,
    navLabel: "Context Rot — Sub-Agents",
    route: "/context-rot-solution-1",
    sceneSlug: "context-rot-solution-1",
    coversSlides: ["S19", "S20"],
  },
  {
    kind: "interactive",
    id: "progressive-disclosure",
    section: 7,
    navLabel: "Context Rot — Progressive Disclosure",
    route: "/progressive-disclosure",
    sceneSlug: "progressive-disclosure",
    coversSlides: ["S19", "S20"],
  },
  // Sub-agents and progressive disclosure both fix within-session bloat — this is the
  // third, distinct failure mode: a big story spanning many sessions, where nothing
  // carries the earlier decisions forward except an ever-growing (and eventually
  // truncated/summarized) conversation. The fix is structural, not a bigger window.
  {
    kind: "static",
    id: "s20b",
    section: 7,
    navLabel: "Steering log",
    slideKind: "statement",
    content: {
      icon: "folder",
      eyebrow: "Long-horizon drift",
      title: "Write every steering decision back into the plan.",
      subtitle:
        "Decisions and resolved gaps get persisted to the plan file, not the session — so a long story hands off across sessions without drifting.",
    } satisfies StatementContent,
  },
  // Standalone third layer — sensors catching a mistake doesn't help if nobody can
  // review what's left, so this earns its own chapter (`section: 8`) between Context rot
  // (id 7) and the 5 principles recap (id 9), rather than folding back into Sensors.
  {
    kind: "static",
    id: "s17d",
    section: 8,
    navLabel: "Make it reviewable",
    slideKind: "divider",
    content: {
      title: "Make it reviewable",
      subtitle: "Sensors catch the mistake. Can a human still tell what happened?",
      accent: "amethyst",
    } satisfies DividerContent,
  },
  {
    kind: "static",
    id: "s20c",
    section: 8,
    navLabel: "The reviewer's problem",
    slideKind: "two-column",
    content: {
      heading: "The reviewer's problem",
      left: {
        label: "PRs at scale",
        body: "Regularly exceeds 20 files / 1,000+ lines — code volume up 30%. (Salesforce Engineering)",
      },
      right: {
        label: "Review coverage",
        body: "61% of agent-authored PRs get no recorded human review. (Industry PR-review study)",
      },
    } satisfies TwoColumnContent,
  },
  {
    kind: "static",
    id: "s20c2",
    section: 8,
    navLabel: "Problems with huge PRs",
    slideKind: "list",
    revealMode: "sequential",
    content: {
      heading: "What a 40-file diff actually costs you",
      items: [
        "Overlooked bugs in the noise",
        "Rubber-stamped approvals over real reviews",
        "Feedback too delayed to act on",
        "All-or-nothing reverts on bundled changes",
        "Rising incident and change-failure rates (Cortex, 2026)",
      ],
      style: "bullet",
    } satisfies ListContent,
  },
  {
    kind: "static",
    id: "s20c3",
    section: 8,
    navLabel: "The 40-file diff",
    slideKind: "bespoke",
    content: {
      eyebrow: "What a reviewer actually sees",
      title: "One PR. 47 files. 3,140 lines changed.",
    } satisfies StatementContent,
    bespokeComponent: SlidePRDiff,
  },
  {
    kind: "static",
    id: "s20d",
    section: 8,
    navLabel: "Structured change summary",
    slideKind: "bespoke",
    content: {
      eyebrow: "Structured change summary",
      title: "Ship the description, not just the diff.",
    } satisfies StatementContent,
    bespokeComponent: SlidePRSummary,
  },
  {
    kind: "static",
    id: "divider-principles",
    section: 9,
    navLabel: "Section: 5 principles",
    slideKind: "divider",
    content: {
      title: "Two projects. One set of rules.",
      subtitle: "Everything so far, distilled into five principles.",
      accent: "flamingo",
    } satisfies DividerContent,
  },
  {
    kind: "static",
    id: "s21",
    section: 9,
    navLabel: "5 principles",
    slideKind: "list",
    revealMode: "sequential",
    content: {
      heading: "5 principles for any team",
      subheading: "Merged from both projects",
      items: [
        "Earn every rule. Trace it to a real past failure — hand-written, never auto-generated.",
        "Gate only the irreversible. Confirm real blast radius; default everywhere else.",
        "Ground the agent in what's real. Reuse before you create — the codebase over guesswork.",
        "Sub-agents are firewalls, not personas. Isolate context, return a condensed result.",
        "Treat the harness as software: version it, review it, refactor it, audit its output.",
      ],
      style: "numbered",
    } satisfies ListContent,
  },
  {
    kind: "static",
    id: "s21b",
    section: 10,
    navLabel: "Self-score",
    slideKind: "list",
    // revealMode intentionally omitted (defaults to "all") — 04-slide-outline.md is explicit
    // that this slide must stay static so the room can read while scoring on their fingers.
    content: {
      heading: "Score your own team, 0–5",
      items: [
        "Do your AI instructions load by scope, or does every request see everything?",
        "Can you point to a real past failure behind every rule in your instructions file?",
        "Are your instructions/prompts/skills version-controlled and reviewed like code?",
        "When your code and your docs disagree, which one does the agent follow?",
        "What happens when the agent says “done”? Does anything computational check that claim?",
      ],
      style: "check",
    } satisfies ListContent,
  },
  {
    kind: "static",
    id: "s22",
    section: 10,
    navLabel: "Close",
    slideKind: "close",
    content: {
      icon: "flag",
      quote: "You can't prompt your way to a reliable AI coding agent. You have to engineer the harness around it.",
      recapLine:
        "Model plus harness. Guides before, sensors after — and audit what comes out.",
    } satisfies CloseContent,
  },
];
