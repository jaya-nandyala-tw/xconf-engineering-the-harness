export interface SceneMeta {
  slug: string;
  title: string;
  concept: string;
  description: string;
  status: "ready" | "backlog";
  // Scenes sharing a group render together under one heading on the launcher, in array
  // order, instead of as separate top-level cards — used for a multi-flow story like
  // Context Rot's Problem -> Solution 1 -> Solution 2.
  group?: string;
}

export const scenes: SceneMeta[] = [
  {
    slug: "nested-layers",
    title: "Agent = Model + Harness",
    concept: "Nested boxes, one expanded at a time",
    description:
      "Harness ⊃ Context ⊃ Prompt, always shown together — the selected layer expands with full detail, the other two collapse to just a title, so the nesting never disappears off-screen.",
    status: "ready",
  },
  {
    slug: "guides-sensors",
    title: "Guides → Sensors",
    concept: "Flowchart with two feedback loops",
    description:
      "A 3-file rename ripples into a dependent test failure — the agent closes that loop itself. A 3-file policy change breaks a now-outdated test — that loop routes through a human-confirm checkpoint before the agent touches it. Same pipeline, two different feedback paths, drawn as an actual flowchart.",
    status: "ready",
  },
  {
    slug: "context-rot-problem",
    title: "Problem",
    concept: "Two causes, a live token budget panel, a needle in a haystack",
    description:
      "A whole spec file loaded for one line, then grep/reads/test runs on top — a live budget panel shows exactly what's bloating the window while the rule quietly crosses the 40% line and gets lost.",
    status: "ready",
    group: "context-rot",
  },
  {
    slug: "context-rot-solution-1",
    title: "Solution 1: Sub-Agents",
    concept: "Context firewall for the exploration cause",
    description:
      "Picks up right where Problem leaves off. A sub-agent takes the exploration off the main thread entirely — and pulls the window back under 40% in the process.",
    status: "ready",
    group: "context-rot",
  },
  {
    slug: "progressive-disclosure",
    title: "Solution 2: Progressive Disclosure",
    concept: "One monolith splits into a linked tree of chunks",
    description:
      "The same 54,000-token spec from the Problem explodes into an index and its flows, nested where it needs to be. Watch a real task traverse just 5 of 12 files for a fraction of the tokens.",
    status: "ready",
    group: "context-rot",
  },
  {
    slug: "workspace-wrapper",
    title: "Workspace Wrapper",
    concept: "Same 3 repos, before and after a shared layer",
    description:
      "A field rename lands in one repo and silently drifts in the other two — the exact 'same story, different repo' failure mode. Wrap the repos in one workspace: shared impact analysis, a confirmation gate, then all three update together from the same contract.",
    status: "ready",
  },
  {
    slug: "principles-checklist",
    title: "5 Principles",
    concept: "Flip-card grid",
    description:
      "The takeaway checklist as flippable cards — doubles as the online leave-behind linked from the closing QR code.",
    status: "backlog",
  },
];
