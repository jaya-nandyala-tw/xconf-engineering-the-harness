# XConf 2026 — Speaker Submission Material

## Title (pick one)

1. **Engineering the Harness: Making AI Coding Agents Actually Reliable**
2. **Engineering the Harness: A Field Guide to AI-Assisted Development at Scale**
3. **Beyond the Prompt: Engineering the Harness Around Your AI Coding Agent**

> Recommendation: **#1**. It names the talk's coined term first, and "actually reliable" promises the payoff a skeptical audience wants.

## One-liner (for the agenda / social card)

> Your AI coding agent is only as good as the harness around it. Two engineers, two very different codebases, the same fix — here's how to engineer one for yours.

## Abstract (150 words, for the conference agenda)

*(Refined to reflect Prabina's updated `talk-outline.md` (2) — she now frames her half as numbered principles, each traced to a real production failure, rather than a narrative walkthrough. Still flag for her review before locking in.)*

Every team adopting AI coding agents hits the same wall: a smart model that writes plausible code that doesn't follow *your* team's conventions — the wrong pattern, the wrong abstraction — with no idea it broke something three services away. The instinct is a better prompt — the real fix is bigger: engineer the **harness** around the agent, guides that steer it before it acts and sensors that catch mistakes after.

We hit this from opposite directions — hardening an existing multi-repo platform, and building a new agentic workflow from scratch — and converged on the same principles, each traced to a real production failure, including hard limits like context window drift that no prompt fixes. Guides: scoped context and human confirmation gates on decisions that matter, sensible defaults elsewhere. Sensors: running the relevant tests, validating lint rules, and reviewing diffs — feeding failures straight back so the agent self-corrects. Underneath both: version-controlled rules that make working with AI an engineering discipline, not a habit. You'll leave with a tool-agnostic checklist for your team.

## Talk format

- **Duration:** 30 minutes (target: ~26–27 min content + buffer, leaving room for Q&A handoff)
- **Demo:** 2 short pre-recorded screen-capture clips (~60–90 sec each), embedded in the slide deck — no live demo risk on stage
- **Framing:** fully abstracted framework — illustrative examples throughout, not a specific team/company case study
- **Takeaway artifact:** a one-page "harness audit checklist" (see [`06-audience-takeaway.md`](./06-audience-takeaway.md))

## Speaker profile form — talking points

Use these when filling the linked speaker profile form (due July 27 EOD):

- **Bio angle:** Practitioner who designed and shipped a harness-engineering system for a real multi-repo codebase, not a theorist — the talk is drawn from hands-on work, generalized so it applies to any team's setup.
- **Session tags / topics:** AI-assisted development, developer experience, coding agents, context engineering, developer tooling, platform engineering.
- **Audience takeaway (1 sentence):** "A concrete mental model — harness vs. context vs. prompt — plus a checklist to apply on Monday morning, regardless of which AI tool or codebase you use."
- **Level:** Intermediate — assumes familiarity with AI coding assistants (Copilot/Cursor/Claude Code/etc.) but no prior exposure to "harness engineering" as a term.

## Deadlines (from the XConf announcement, for reference)

| Item | Deadline |
|---|---|
| Flight booking (Navan) | 2026-07-27 EOD |
| Speaker profile form | 2026-07-27 EOD |
| Final abstract submission | Not yet dated — use this file |
| Internal dry run (XConf Hyderabad office) | 2026-08-13, arrive by 12:00 pm |
| Main event (Trident Hyderabad) | 2026-08-14 |
