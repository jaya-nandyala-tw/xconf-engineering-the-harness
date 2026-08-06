import type { ComponentType } from "react";
import type { IconName } from "../components/slides/Icon";
import { SlideFilePathMatch } from "../components/slides/bespoke/SlideFilePathMatch";
import { SlideAgentPersonas } from "../components/slides/bespoke/SlideAgentPersonas";
import presenterJayaPhoto from "../assets/brand/presenter-jaya.jpeg";
import presenterPrabinaPhoto from "../assets/brand/presenter-prabina.jpeg";

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

// Renumbered sequentially (1-9) to match final array/chronological order. "Make it
// reviewable" is no longer a standalone section (id 8) — folded into Sensors (id 6) as a
// continuation ("sensors catch the mistake; can a human still tell what happened?")
// instead of a third co-equal layer, so the "two layers: guides and sensors" framing
// stated in the hook/agenda/nested-layers scene stays true for the whole talk. Context
// rot's two solution scenes (sub-agents, progressive disclosure) still live inside their
// own section, restoring scenes.ts's own native Problem -> Solution 1 -> Solution 2
// grouping.
export const SECTIONS: DeckSection[] = [
  { id: 1, title: "Title + hook + agenda", timeLabel: "0:00–1:30" },
  { id: 2, title: "The core idea", timeLabel: "1:30–5:00" },
  { id: 3, title: "The problem, generalized", timeLabel: "5:00–9:00" },
  { id: 4, title: "Layer 1 — Guides", timeLabel: "9:00–13:00" },
  { id: 5, title: "Ask Before Deciding", timeLabel: "13:00–15:30" },
  { id: 6, title: "Layer 2 — Sensors", timeLabel: "15:30–22:00" },
  { id: 7, title: "Context rot — the open problem", timeLabel: "22:00–26:30" },
  { id: 8, title: "5 principles for any team", timeLabel: "26:30–29:00" },
  { id: 9, title: "Self-score + recap + close", timeLabel: "29:00–30:00" },
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
  qrUrl?: string;
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

// Full talk order — mirrors 04-slide-outline.md, cross-checked against 01-talk-outline.md
// and the joint-talk collab docs (11-collab-doc-draft.md, 12-ai-workflows-potential-content.md).
// Placeholders below ([PLACEHOLDER] / [BACKLOG]) mark content or scenes not yet built.
export const DECK: DeckItem[] = [
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
  },
  {
    kind: "static",
    id: "divider-problem",
    section: 3,
    navLabel: "Section: The problem",
    slideKind: "divider",
    content: {
      title: "The problem, generalized",
      subtitle: "Not one team's mess — the shape any multi-repo (or multi-service) codebase runs into.",
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
        "Local dev setup differs per engineer, per repo — onboarding is tribal knowledge.",
        "Engineers work across many repos in separate windows — no single view of the system.",
        "The AI assistant only sees the one open file — it suggests the internet's pattern, not your team's.",
        "The AI never checks its own work — it says “done” whether or not it lints, type-checks, or passes tests.",
        "Planning misses cross-repo blast radius — a “small” change quietly needs three more PRs elsewhere, or, on a greenfield build, ships a cross-service change with no sign-off at all.",
        "Gating everything isn't the fix either — a pipeline that stops for a human at every step just trades silent wrong changes for nothing finishing.",
        "Large, fast AI-generated diffs turn review into the bottleneck — a human misses something buried in a 40-file change, or rubber-stamps it.",
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
      title: "AI is only as good as\nthe context it gets + the feedback loops that correct it.",
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
    id: "s13b",
    section: 4,
    navLabel: "Gate only what's irreversible",
    slideKind: "statement",
    content: {
      icon: "lock",
      eyebrow: "Gate only what's irreversible",
      title: "Default everything else.",
      subtitle:
        "A confirmation gate on repo scope and cross-service changes — the decisions you can't cheaply undo. Everything else resolves to a visible, explicit default instead of stopping the pipeline.",
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
        "Guide with input gates. A structured intake, a blocking gate, a visible default — applied before any codebase exists to constrain the agent.",
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
    id: "s17a",
    section: 6,
    navLabel: "Rule 1",
    slideKind: "statement",
    content: {
      icon: "check",
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
      icon: "code",
      title: "Promote rules from docs into code.",
      subtitle:
        "If you keep writing the same instruction in prose and the agent keeps ignoring it, escalate it to a linter or a structural test.",
    } satisfies StatementContent,
  },
  {
    kind: "static",
    id: "s17c",
    section: 6,
    navLabel: "Phase gates",
    slideKind: "statement",
    content: {
      icon: "lock",
      eyebrow: "Phase gates",
      title: "An automatic pass/fail verdict before the next phase is even allowed to start.",
      subtitle: "RED → GREEN → REFACTOR → REVIEW — “silent success, verbose failure” running as the actual pipeline, not just a design rule.",
    } satisfies StatementContent,
  },
  // Folded in from a standalone "Layer 3" section — sensors catching a mistake doesn't
  // help if nobody can review what's left, so this is a continuation of Sensors, not a
  // third co-equal layer: `section: 6`, same SECTIONS entry, no new numbered chapter. It
  // still gets its own visual separator card for pacing — accent matches section 6's own
  // cycled color (jade) rather than reusing a fresh accent, so it doesn't read as a brand
  // new top-level section the way divider-problem/divider-context-rot do.
  {
    kind: "static",
    id: "s17d",
    section: 6,
    navLabel: "One more sensor problem",
    slideKind: "divider",
    content: {
      title: "Make it reviewable",
      subtitle: "Sensors catch the mistake. Can a human still tell what happened? Two of us hit the same gap, on two different codebases.",
      accent: "jade",
    } satisfies DividerContent,
  },
  {
    kind: "static",
    id: "s20b",
    section: 6,
    navLabel: "Two teams, same shape of gap",
    slideKind: "two-column",
    content: {
      heading: "Two teams, same shape of gap",
      left: {
        label: "Jaya's side (ssi-ai-kit)",
        body: "“Promote rules from docs into code” — stated in the harness's own docs. The flagship candidate (import/architecture boundaries) is still prose-only; the linter was never added.",
      },
      right: {
        label: "Prabina's side (ai-workflows)",
        body: "“Protect shared state with append-only contracts” — named the same way in the harness's own roadmap. No rule or field yet stops an agent from silently rewriting a shared contract entry.",
      },
    } satisfies TwoColumnContent,
  },
  {
    kind: "static",
    id: "s20c",
    section: 6,
    navLabel: "The reviewer's problem",
    slideKind: "two-column",
    content: {
      heading: "The reviewer's problem",
      left: {
        label: "PRs at scale",
        body: "Regularly exceed 20 files / 1,000+ lines. Code volume up 30%. (Salesforce Engineering, on their own data.)",
      },
      right: {
        label: "Review coverage",
        body: "61% of agent-authored PRs get no recorded human review at all. (Industry PR-review study — full sourcing in 10-external-problems.md §4.)",
      },
    } satisfies TwoColumnContent,
  },
  {
    kind: "static",
    id: "s20d",
    section: 6,
    navLabel: "Structured change summary",
    slideKind: "table",
    content: {
      heading: "Structured change summary — not just a diff",
      columns: ["Acceptance criterion", "Test", "Result"],
      rows: [
        ["AC-1: ...", "test_...", "✅ pass"],
        ["AC-2: ...", "test_...", "✅ pass"],
      ],
    } satisfies TableContent,
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
  // just make the haystack bigger.") was cut — it duplicated this scene's own final beat
  // caption verbatim (ContextRotProblem.tsx's last BEATS entry), which already lands the
  // same line and previews both solution scenes. coversSlides above already documented
  // that this scene covers S19 — the standalone slide was the actual redundant copy.
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
  {
    kind: "static",
    id: "s20",
    section: 7,
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
    section: 8,
    navLabel: "5 principles",
    slideKind: "list",
    revealMode: "sequential",
    content: {
      heading: "5 principles for any team",
      subheading: "Merged from both projects",
      items: [
        "Earn every rule. Every instruction should trace to a real past failure — hand-written, never auto-generated.",
        "Gate only the irreversible. Human confirmation on decisions with real blast radius; a sensible default everywhere else.",
        "Ground the agent in what's real. Structure in, structure out, and reuse before you create — the codebase, and confirmed inputs, win over guesswork.",
        "Sub-agents are single-purpose firewalls, not personas. Isolate context or responsibility, return a condensed result.",
        "Treat the harness as software. Version it, review it, refactor it when it drifts, and make what it produces auditable.",
      ],
      style: "numbered",
    } satisfies ListContent,
  },
  {
    kind: "static",
    id: "s21b",
    section: 9,
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
    section: 9,
    navLabel: "Close",
    slideKind: "close",
    content: {
      icon: "flag",
      quote: "You can't prompt your way to a reliable AI coding agent. You have to engineer the harness around it.",
      recapLine:
        "Model plus harness. Guides before, sensors after, and make what comes out the other end auditable. Two of us, two completely different codebases, and we converged on the same principles.",
      qrUrl: undefined, // [PLACEHOLDER] fill in the takeaway-doc link before the talk
    } satisfies CloseContent,
  },
];
