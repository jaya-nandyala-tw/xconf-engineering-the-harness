import type { ComponentType } from "react";
import type { IconName } from "../components/slides/Icon";
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
const ACCENT_CYCLE: Accent[] = ["turmeric", "jade", "turmeric", "amethyst"];

// Renumbered sequentially (1-10) to match final array/chronological order. "Make it
// reviewable" is restored as its own standalone section (id 8, "The Third Layer —
// Reviewability") rather than folded into Sensors (id 6) — sensors catching a mistake
// doesn't help if nobody can review what's left, so it earns its own chapter card between
// Context rot (id 7) and the 5 principles recap (id 9). Context rot's two solution scenes
// (sub-agents, progressive disclosure) still live inside their own section, preserving
// scenes.ts's own native Problem -> Solution 1 -> Solution 2 grouping.

export const SECTIONS: DeckSection[] = [
  { id: 1, title: "Title + hook + agenda", presenter: "Jaya + Prabina", plannedMinutes: 1.5 },
  { id: 2, title: "The core idea", presenter: "Prabina", plannedMinutes: 3.0 },
  { id: 3, title: "The problem, generalized", presenter: "Jaya", plannedMinutes: 3.5 },
  { id: 4, title: "Layer 1 — Guides", presenter: "Jaya", plannedMinutes: 2.5 },
  { id: 5, title: "Ask Before Deciding", presenter: "Prabina", plannedMinutes: 2.5 },
  { id: 6, title: "Layer 2 — Sensors", presenter: "Prabina", plannedMinutes: 5.0 },
  { id: 7, title: "Context rot — the open problem", presenter: "Jaya", plannedMinutes: 5.0 },
  { id: 8, title: "The Third Layer — Reviewability", presenter: "Prabina", plannedMinutes: 3.5 },
  { id: 9, title: "5 principles for any team", presenter: "Jaya", plannedMinutes: 1.5 },
  { id: 10, title: "Self-score + recap + close", presenter: "Jaya + Prabina", plannedMinutes: 2.0 },
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
  // own lines with the "+" as its own line in turmeric — for statements that are
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

// A single note renders as one line; an array renders as a bulleted list — pick
// whichever reads better for a given talking point.
export type Notes = string | string[];

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
  // Fallback shown for every beat unless that beat has its own entry in beatNotes.
  notes?: Notes;
  // Optional per-beat override, indexed by beat number — only needed on slides with
  // revealMode: "sequential" where a specific bullet's reveal deserves its own cue.
  // A missing/undefined entry at a given index falls back to `notes` above.
  beatNotes?: (Notes | undefined)[];
}

export interface InteractiveDeckItem {
  kind: "interactive";
  id: string;
  section: number;
  navLabel: string;
  route: string;
  sceneSlug: string;
  coversSlides: string[];
  // Same as StaticDeckItem.notes — shown whenever the current beat has no override below.
  notes?: Notes;
  // Per-beat override, indexed to match the scene's own internal BEATS array — lets
  // presenter notes track a scene's actual sub-steps instead of staying fixed for the
  // whole scene. A missing/undefined entry at a given index falls back to `notes` above.
  beatNotes?: (Notes | undefined)[];
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
    notes: "Walk-in loop — let it run while people find seats. Advance to the title slide when you're ready to start. Confirm mic/camera sync before advancing — this venue's had streaming sync issues at past events.",
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
          bio: "7+ years building enterprise web applications — now designing harness-engineering systems that make AI coding agents reliable across large, multi-repo codebases.",
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
    notes: "Quick, don't over-read the bios verbatim — the room can read. Name-check both of you, then move. Optional, if it fits: mention the ~30-repo AI platform work for a client (self-service infra automation) to ground the multi-repo problem as real, not hypothetical.",
  },
  {
    kind: "static",
    id: "s2",
    section: 1,
    navLabel: "Hook",
    slideKind: "statement",
    content: {
      title: "Who's had an AI assistant ignore their team's conventions?",
    } satisfies StatementContent,
    notes: "Actually pause for hands. This is the hook — let the recognition land before moving to the agenda.",
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
    notes: "One breath per line — this is the map for the next 25 minutes, don't editorialize yet.",
    beatNotes: [
      "Harness first — everything else in the talk hangs off this one definition.",
      "Guides = before the agent acts.",
      "Sensors = after it acts.",
      "This one's easy to skip past too fast — reviewability is its own section later, flag that now.",
    ],
  },
  {
    kind: "interactive",
    id: "nested-layers",
    section: 2,
    navLabel: "Agent = Model + Harness",
    route: "/nested-layers",
    sceneSlug: "nested-layers",
    coversSlides: ["S4", "S5", "S6"],
    notes: "An agent is a model plus a harness — that's the idea this whole talk builds on.",
    beatNotes: [
      [
        "So let's understand components that make up an AI Agent:",
        "The model, the LLM itself -- is the reasoning engine. It's powerful, but stateless, with no memory, tools, or guardrails of its own.",
        "The harness is everything built around the model — orchestration, tool permissions, guardrails, retry loops — the system that makes that raw intelligence usable and safe.",
        "The Model and the harness together make the Agent.",

        "Harness itself has layers nested inside it, and we're about to zoom through them"
      ],
      [
        "First layer is Prompt Engineering",
        "Prompt Engineering is crafting the message sent to the model. This could be in the form of instructions, requests, and examples.",
        "But a prompt only lasts for one message — it carries no memory, no retrieval, and no state across turns. That gap is what Context Engineering closes.",
      ],
      [
        "Which brings us to the next layer, Context Engineering",
        "Context Engineering is the briefing packet for a session — it provides retrieval, memory, and summarization.",
        "In short, it makes the stateless prompt stateful.",
        "But context can only inform the model — it has no power to enforce anything. The model can still ignore it or act unsafely. That's the gap Harness Engineering closes.",
      ],
      [
        "Harness Engineering is the outermost layer, the one with enforcement power. A prompt can request safety — only the harness can enforce it.",
        "That's why it sits on the outside: it's the only layer that can guarantee what the other two can only suggest.",
      ],
    ],
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
    notes: "Section handoff — a beat of silence here is fine, chapter cards don't need narration.",
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
    notes: "These six add up to one root cause, coming up next — don't resolve it here, just let the list build.",
    beatNotes: [
      undefined,
      undefined,
      "This is the one the next scene (Workspace Wrapper) dramatizes directly.",
    ],
  },
  {
    kind: "interactive",
    id: "workspace-wrapper",
    section: 3,
    navLabel: "Cross-repo blast radius",
    route: "/workspace-wrapper",
    sceneSlug: "workspace-wrapper",
    coversSlides: [],
    notes: "Live demo of the drift failure mode, then the fix — pace the before/after as two clear halves.",
    beatNotes: [
      "Three repos, no shared layer yet — this is the 'before' state.",
      "Track the rename request landing in billing-service first.",
      "Looks done from inside billing-service — that's the trap.",
      "The drift callout is the whole point of this half — let it sit for a second.",
      "Same repos, now wrapped in ai-kit — the fix begins here.",
      "Local folders are deleted, not duplicated — ai-kit becomes the one source of truth.",
      "The request now hits ai-kit first, not a single repo.",
      "One shared analysis, done once — this replaces three separate agent investigations.",
      "The confirmation gate — call out that nothing gets written yet.",
      "A human approves scope before any code changes — this is the guide in action.",
      "All three repos update together — zero drift. This is the payoff line, let it land.",
    ],
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
    notes: "This is the equation the whole rest of the talk unpacks — say it once, cleanly, don't rush into the transition slide.",
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
    notes: "Short transition — this is the two-layer structure that organizes everything else. Don't linger.",
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
    notes: "Section opener for Guides — Jaya's section. One sentence, then straight into the seven primitives table.",
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
    notes: [
      "Don't read every row — the room can read. Call out 2-3: global instructions, confirmation gates, and specs.",
      "Confirmation gates is the one that pays off in Workspace Wrapper — plant that connection now.",
    ],
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
    notes: "Restricted personas as a hard guarantee, not a suggestion — make sure that distinction lands.",
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
    notes: "Closes out Guides — the punchline is 'default everything else,' not 'gate everything.' Don't let it sound like more gates.",
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
    notes: [
    "AI agents hallucinate — when they don't know the answer, they don't stay quiet, they guess, and state that guess with full confidence.",
    " If the agent is left unconstrained it'll invent assumptions about scope, stack, even requirements, instead of asking.",
    "Ask Before Deciding is what should be followed here: a set of input collection gates in place before any implementation starts.",  
    ]
  },
  {
    kind: "interactive",
    id: "s14b",
    section: 5,
    navLabel: "Input Collection Gate",
    route: "/input-collection-gate",
    sceneSlug: "input-collection-gate",
    coversSlides: ["S14b"],
    notes: "Real trimmed dialogue from story-analysis-agent's actual Input Collection Gate skill — this isn't a mockup.",
    beatNotes: [
      "We'll go through an example of where we've asked an agent for story ananlysis. Before the agent fetches anything or reads any code, a fixed intake sequence kicks in — asking for input is the very first thing it does.",
      "It doesn't ask one open-ended question. It offers three fixed intake types — user story-only, story & UI, story & tech doc — the structure should be fixed, not left to the agent's judgment.",
      "Once 'Jira plus Tech' is picked, fields come one at a time, in a set order — Jira ticket first.",
      "Tech doc is optional here, but the agent still asks for it explicitly. An optional field never gets silently skipped by the agent itself.",
      "The human chooses to skip it. That's a recorded human decision — not the agent quietly deciding it doesn't need one.",
      "Before anything else, it summarizes what it collected and what was skipped, and asks for confirmation. The confirmation gate is blocking and non-skippable.",
      "Only once the human actually answers all the questions, does anything downstream start.",
      "Because the tech doc was skipped, that gap has to resolve to something later — here it resolves to an explicit sensible default.",
    ],
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
    notes: "ow moving forward, we have covered guides which steers the agent before it acts. Now let's come to Sensors for catching what gets through after it acts.",  },
  {
    kind: "interactive",
    id: "guides-sensors",
    section: 6,
    navLabel: "Guides → Sensors",
    route: "/guides-sensors",
    sceneSlug: "guides-sensors",
    coversSlides: ["S16"],
    notes: "The longest interactive scene — one story runs the real 6-phase pipeline end to end. Keep the pace brisk through the RED/GREEN/REFACTOR beats; the two loops (confirm-wait and gap-loop) are where you slow down.",
    beatNotes: [
      "Set up the promise: one story, all six phases, for real.",
      "Three repos touched by one story — this is the multi-repo angle from Section 3, paid off here.",
      "Guides fire immediately, before any file is touched — that's Analyze.",
      "Architect finds three repos, not one — this is the moment the gate becomes necessary.",
      "The Multi-Repo Confirmation Gate — blocking. Nothing downstream starts. Let 'blocking' land.",
      "Confirmed — only now does anything get written. This is a guide, working exactly as designed.",
      "Red: tests written first, all failing — that's correct, not a bug.",
      "Green: just enough code to pass. Tests don't change.",
      "Refactor: structure improves, behavior doesn't — re-run tests after every change.",
      "Review finds a real gap — a sensor doing its job, not a false alarm.",
      "This is the interesting one: no human needed, the loop closes itself because it's just a completeness gap, not a judgment call.",
      "Second pass, condensed — just the one missing test.",
      "Second pass — just the missing handling, nothing else touched.",
      "Clean on the second pass — coverage, lint, types all pass.",
      "Land the close: a person handled the blast-radius decision, the agent handled the coverage gap. Two different kinds of loop, closed two different ways.",
    ],
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
    notes: "Tone shift — this is the 'we don't have this fully solved' section. Signal that honestly, don't undersell it.",
  },
  {
    kind: "interactive",
    id: "context-rot-problem",
    section: 7,
    navLabel: "Context Rot — Problem",
    route: "/context-rot-problem",
    sceneSlug: "context-rot-problem",
    coversSlides: ["S19", "S20"],
    notes: "Two causes of context rot, live: one question triggers a full spec read, then exploration piles on top. Watch the budget panel with the room — the 40% line is the moment to slow down.",
    beatNotes: [
      "Empty window, one rule lands — the model reads attentively here. This is the baseline.",
      "Cause 1: one question about the rule, and the agent reads the entire 6,000-line spec file to answer it.",
      "Cause 2: agent starts exploring the codebase on top of that — grep across the repo.",
      "Each file read adds up — 6,800 tokens for one file.",
      "Test run and failures: another 7,400. Exploration keeps growing.",
      "Exploration is now the single largest category in the window — point at the budget panel.",
      "Imports pull in three more files nobody asked for — this is the 40% line, crossed. Slow down here.",
      "A real bug report lands mid-investigation — the window keeps growing regardless of what's urgent.",
      "Past 40%, and the original rule is now the needle in this haystack — this is the punchline of cause 1+2 together.",
      "Bigger context windows don't fix this — they just make the haystack bigger. Land this line before naming the two fixes.",
      "Name both fixes before advancing: sub-agents for the exploration cause, progressive disclosure for the spec-read cause.",
    ],
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
    notes: "Picks up exactly where Problem left off — no need to re-set the scene, just say 'same window, fixing cause two now.'",
    beatNotes: [
      "Same window from Problem — still past 40%, exploration is the target now.",
      "The sub-agent takes grep/reads/test-run into an isolated context — main thread never sees it.",
      "Collapses to a condensed summary — this is the exploration cost leaving the main window.",
      "Same investigation, same answer — the main thread just never had to hold it. Let the numbers land.",
      "Cause two: solved, and the window is back under 40% as a side effect. Bridge to Progressive Disclosure for cause one.",
    ],
  },
  {
    kind: "interactive",
    id: "progressive-disclosure",
    section: 7,
    navLabel: "Context Rot — Progressive Disclosure",
    route: "/progressive-disclosure",
    sceneSlug: "progressive-disclosure",
    coversSlides: ["S19", "S20"],
    notes: "This is cause one's fix — the same 54,000-token monolith from the Problem scene, now split. Watch a real task traverse just 5 of 12 files.",
    beatNotes: [
      "One monolithic spec — every flow lives in this single file.",
      "6,000 lines, ~54,000 tokens, no matter how small the question. This is the cost from cause one, quantified.",
      "Same knowledge, now split into an index plus nested flow files.",
      "Every task starts at the index — cheap to read, points to the rest. This is the only file loaded up front.",
      "The index links to exactly one relevant flow — the other branches stay closed, untouched.",
      "That flow links deeper into its own escalation rules — nesting continues only where the task needs it.",
      "Deeper still into the actual SLA matrix — still following just this one task's path.",
      "Found the answer four hops down — call out that 'appeals' exists one level deeper and is never touched.",
      "Same answer, a fraction of the file loaded. Let the savings percentage land before moving on.",
    ],
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
    notes: "The fix for long-horizon drift isn't a bigger context window — it's writing decisions to a persistent plan file instead of trusting the session to remember. One beat, then straight into the reviewability divider.",
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
    notes: "Third layer, standalone section — not folded into Sensors. The point: sensors catching a mistake is worthless if nobody can review what's left.",
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
    notes: "Both stats are cited, real numbers — say the sources out loud, they carry the slide's credibility.",
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
    notes: "These are the costs of the 40-file diff coming up next — this list is the setup, the diagram is the payoff.",
    beatNotes: [
      undefined,
      undefined,
      undefined,
      undefined,
      "This last one has a citation (Cortex, 2026) — say it out loud.",
    ],
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
    notes: "Let the diagram breathe — this is the concrete picture of the abstract list the room just saw. Don't talk over it immediately.",
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
    notes: "This is the fix for the 47-file PR — a structured summary a human can actually review, not the raw diff.",
  },
  {
    kind: "static",
    id: "divider-principles",
    section: 9,
    navLabel: "Section: 5 principles",
    slideKind: "divider",
    content: {
      title: "Different Projects. Same Rules",
      subtitle: "Everything so far, distilled into five principles.",
      accent: "turmeric",
    } satisfies DividerContent,
    notes: "This section was trimmed for time in rehearsal — keep it brisk, don't restore the cut detail. The credibility point: two unrelated projects converged on the same five rules independently — say that plainly.",
  },
  {
    kind: "static",
    id: "s21",
    section: 9,
    navLabel: "5 principles",
    slideKind: "list",
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
    notes: [
      "The synthesis of everything so far — merged from both projects, not five new ideas. All five load at once now — read the room, then summarize the connections below rather than walking through them one at a time.",
      "Earn every rule — ties back to the seven primitives (S11): none of those exist without a real past failure behind them.",
      "Gate only the irreversible — this is S13b's punchline again, restated as a general principle.",
      "Ground the agent in what's real — this is the Input Collection Gate's whole premise.",
      "Sub-agents as firewalls, not personas — this is exactly what Context Rot Solution 1 demonstrated.",
      "Treat the harness as software — the meta-point: everything in this talk is itself just software that needs the same discipline.",
    ],
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
    notes: "Give the room real time here — this is deliberately static so people can score themselves on their fingers. Don't rush past it.",
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
    notes: "Say the quote slowly, let it be the last full sentence of the talk. Thank the room after the recap line, not before it. Budget ~10 min for Q&A after this — leave time, don't run the close long.",
  },
];
