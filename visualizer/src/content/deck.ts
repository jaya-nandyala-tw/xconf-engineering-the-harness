import type { ComponentType } from "react";
import type { IconName } from "../components/slides/Icon";
import { SlideFilePathMatch } from "../components/slides/bespoke/SlideFilePathMatch";
import { SlideAgentPersonas } from "../components/slides/bespoke/SlideAgentPersonas";

export type Accent = "flamingo" | "sapphire" | "jade" | "turmeric" | "amethyst";

export interface DeckSection {
  id: number;
  title: string;
  timeLabel: string;
  accent: Accent;
}

// Sapphire excluded — same teal family as the `wave` background, so it reads low-contrast
// on the actual chrome (confirmed in review: section numbers and borders in it washed out).
const ACCENT_CYCLE: Accent[] = ["flamingo", "jade", "turmeric", "amethyst"];

// 10 sections, timings from 01-talk-outline.md's run-of-show table.
export const SECTIONS: DeckSection[] = [
  { id: 1, title: "Cold open + hook + agenda", timeLabel: "0:00–1:30" },
  { id: 2, title: "The core idea", timeLabel: "1:30–5:00" },
  { id: 3, title: "The problem, generalized", timeLabel: "5:00–9:00" },
  { id: 4, title: "Layer 1 — Guides", timeLabel: "9:00–13:00" },
  { id: 5, title: "Demo clip 1", timeLabel: "13:00–16:00" },
  { id: 6, title: "Layer 2 — Sensors", timeLabel: "16:00–20:00" },
  { id: 7, title: "Demo clip 2", timeLabel: "20:00–23:00" },
  { id: 8, title: "Context rot — the open problem", timeLabel: "23:00–26:00" },
  { id: 9, title: "5 principles for any team", timeLabel: "26:00–28:30" },
  { id: 10, title: "Self-score + recap + close", timeLabel: "28:30–30:00" },
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
  | "confession-crawl"
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
  qrUrl?: string;
}

export interface ConfessionCrawlContent {
  lines: string[];
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
  | ConfessionCrawlContent;

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
}

export interface InteractiveDeckItem {
  kind: "interactive";
  id: string;
  section: number;
  navLabel: string;
  route: string;
  sceneSlug: string;
  coversSlides: string[];
}

export type DeckItem = StaticDeckItem | InteractiveDeckItem;

// Full talk order — mirrors 04-slide-outline.md, cross-checked against 01-talk-outline.md.
// Placeholders below ([PLACEHOLDER]) mark content not yet collected — see plan doc.
export const DECK: DeckItem[] = [
  {
    kind: "static",
    id: "s1a",
    section: 1,
    navLabel: "Cold open",
    slideKind: "confession-crawl",
    content: {
      lines: [
        "[PLACEHOLDER] “It told me the migration was ‘safe.’ It was not.”",
        "[PLACEHOLDER] “It refactored the whole auth module to fix a typo.”",
        "[PLACEHOLDER] “It deleted the tests that were failing. All green now.”",
        "[PLACEHOLDER] “It invented an API that does not exist — confidently.”",
      ],
    } satisfies ConfessionCrawlContent,
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
          name: "Jayasimha Reddy Nandyala",
          title: "Senior Consultant | Full Stack Engineer",
          bio: "7+ years building enterprise apps across React, Python, and Java Spring Boot — now designing harness-engineering systems that make AI coding agents reliable across large, multi-repo codebases.",
        },
        {
          name: "Prabina Pani",
          title: "Tech Lead | AIFSD Practitioner",
          bio: "10 years in software development — designs and maintains agentic SDLC tooling, and the practical guardrails needed to run AI agents safely on production, multi-repo codebases.",
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
        { icon: "flag", label: "Take this home" },
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
        "Local dev setup differs per engineer, per repo — onboarding is tribal knowledge.",
        "Engineers work across many repos in separate windows — no single view of the system.",
        "The AI assistant only sees the one open file — it suggests the internet's pattern, not your team's.",
        "The AI never checks its own work — it says “done” whether or not it lints, type-checks, or passes tests.",
        "Planning misses cross-repo blast radius — a “small” change quietly needs three more PRs elsewhere.",
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
      title: "AI is only as good as the context it gets + the feedback loops that correct it.",
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
    navLabel: "Six primitives",
    slideKind: "table",
    content: {
      heading: "Six primitives",
      columns: ["Primitive", "What it does", "When it loads"],
      rows: [
        ["Global instructions", "Rules that always apply", "Every interaction"],
        ["Scoped instructions", "Domain rules tied to file path", "When editing matching files"],
        ["Agents", "Restricted personas", "When explicitly invoked"],
        ["Skills", "Repeatable multi-step workflows", "When explicitly invoked"],
        ["Prompts", "Single-task focused templates", "When explicitly invoked"],
        ["Specs", "The architecture knowledge base", "When referenced by the above"],
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
      title: "Load only what's relevant to the 5 files being touched.",
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
      title: "A read-only agent literally cannot edit files.",
    } satisfies StatementContent,
    bespokeComponent: SlideAgentPersonas,
  },
  {
    kind: "static",
    id: "s14",
    section: 5,
    navLabel: "Demo — Guides in action",
    slideKind: "video-placeholder",
    content: {
      heading: "Demo 1 — Guides in action",
      setupLine: "Watch what happens to the same request, once with no scoped context, once with it.",
      callouts: [
        "No scoped context → generic pattern",
        "Scoped instructions load automatically by file path",
        "Same model. Same prompt. Different harness.",
      ],
    } satisfies VideoPlaceholderContent,
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
    id: "s17a",
    section: 6,
    navLabel: "Rule 1",
    slideKind: "statement",
    content: {
      title: "Silent success, verbose failure.",
      subtitle:
        "A sensor that passes produces zero output. A sensor that fails surfaces the exact error, so the agent can self-correct without a human in the loop.",
    } satisfies StatementContent,
  },
  {
    kind: "static",
    id: "s17b",
    section: 6,
    navLabel: "Rule 2",
    slideKind: "statement",
    content: {
      title: "Promote rules from docs into code.",
      subtitle:
        "If you keep writing the same instruction in prose and the agent keeps ignoring it, escalate it to a linter or a structural test.",
    } satisfies StatementContent,
  },
  {
    kind: "static",
    id: "s18",
    section: 7,
    navLabel: "Demo — Sensors in action",
    slideKind: "video-placeholder",
    content: {
      heading: "Demo 2 — Sensors in action",
      setupLine: "Now watch the agent make a mistake — and catch it itself before a human ever sees it.",
      callouts: ["Agent claims: done", "Sensor disagrees", "Agent self-corrects — no human review yet", "Silent on pass"],
    } satisfies VideoPlaceholderContent,
  },
  {
    kind: "static",
    id: "s19",
    section: 8,
    navLabel: "Honesty beat",
    slideKind: "statement",
    content: {
      title: "Bigger context windows don't fix this — they just make the haystack bigger.",
    } satisfies StatementContent,
  },
  {
    kind: "interactive",
    id: "context-rot-problem",
    section: 8,
    navLabel: "Context Rot — Problem",
    route: "/context-rot-problem",
    sceneSlug: "context-rot-problem",
    coversSlides: ["S19", "S20"],
  },
  {
    kind: "interactive",
    id: "context-rot-solution-1",
    section: 8,
    navLabel: "Context Rot — Sub-Agents",
    route: "/context-rot-solution-1",
    sceneSlug: "context-rot-solution-1",
    coversSlides: ["S19", "S20"],
  },
  {
    kind: "interactive",
    id: "progressive-disclosure",
    section: 8,
    navLabel: "Context Rot — Progressive Disclosure",
    route: "/progressive-disclosure",
    sceneSlug: "progressive-disclosure",
    coversSlides: ["S19", "S20"],
  },
  {
    kind: "static",
    id: "s20",
    section: 8,
    navLabel: "Context rot recap",
    slideKind: "table",
    content: {
      heading: "Context rot — 3 failure modes",
      columns: ["Failure mode", "One-line mitigation"],
      rows: [
        ["Long-horizon drift", "Scoped, persistent memory instead of one ever-growing session"],
        ["Stale specs", "Diff-based refresh tied to code changes, not calendar-based"],
        ["Self-verification bias", "Computational sensors override the agent's own “I'm done” claim"],
      ],
    } satisfies TableContent,
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
      items: [
        "Earn every rule. Every instruction should trace to a real past failure.",
        "The codebase wins. When a guideline and the code disagree, the agent follows the code.",
        "Structure in, structure out. Real file paths and real symbol names in, correct code out.",
        "Sub-agents are context firewalls, not personas.",
        "Treat the harness as software. Version it, review it, refactor it when it drifts.",
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
      quote: "You can't prompt your way to a reliable AI coding agent. You have to engineer the harness around it.",
      recapLine: "Model plus harness. Guides before, sensors after. Treat both as software, not as a one-time setup.",
      qrUrl: undefined, // [PLACEHOLDER] fill in the takeaway-doc link before the talk
    } satisfies CloseContent,
  },
];
