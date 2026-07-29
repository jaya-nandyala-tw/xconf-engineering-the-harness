# Lessons & Gaps — from External Harness-Engineering Literature

Cross-referencing the 6 sources in [`07-resources.md`](./07-resources.md) against `ssi-ai-kit`'s current state (`harness-engineering.md`, `DEMO.md`, `README.md`, the agent/skill inventory). Split into two lists: what's missing in the **actual system**, and what should change in **the talk**.

---

## Part 1 — Gaps in the `ssi-ai-kit` system

Mapped against ssi-ai-kit's own existing gap-tracking format (Status: Working / Partial / Key Gaps). None of these contradict what's already there — they're things the 5 sources surface that ssi-ai-kit hasn't named yet.

| Gap | What the literature says | Why ssi-ai-kit doesn't have it yet | Where it'd slot in |
|---|---|---|---|
| **No machine-readable scope lock** | walkinglabs: `feature_list.json` — scope as a structure the agent reads and reports against, not prose it can reinterpret. Agents "naturally try to improve tangential code or rewrite feature lists to hide incomplete work." | `@story`'s Phase 4.5 approval gate is a prose task list a human approves once — nothing stops the agent from quietly expanding scope mid-implementation. | Extend the story memory file schema: a `scope-lock` block the agent must re-read before editing files outside the approved task list. |
| **No agent-run environment health check** | walkinglabs: `init.sh` run *by the agent itself* at session start, not just documented for a human to run. | `scripts/start.sh` exists but is human-invoked; nothing forces an agent to verify DB/mock-API/env health before it starts editing. | Add a "session start" step to relevant agent definitions: run a health check script, fail loudly if infra isn't up, before touching code. |
| **No Generator/Evaluator contract negotiation** | Anthropic: Generator and Evaluator agents negotiate a **"sprint contract"** — an explicit definition of "done" — *before* code is written, not just at review time. | `@story` plans, then `@verify` grades after the fact — there's no upfront negotiated, testable "done" statement the two agree on before implementation starts. | Add a short "acceptance contract" step to `@story`'s Phase 4.5, phrased as falsifiable pass/fail criteria `@verify` will later check against — not just a task list. |
| **`@verify` likely reads, doesn't act** | Anthropic: their Evaluator used Playwright MCP to actually click through the running UI like a user, catching a real interaction bug static analysis missed. | `@verify`'s tool list is read/search/execute — worth confirming whether "execute" includes driving the actual running app (browser automation) for UI stories, or only lint/test/type-check. | If it's static-only today, that's a named upgrade: give `@verify` browser-driving capability for UI-touching stories specifically. |
| **No "harnessability" audit across repo types** | Böckeler: not every codebase supports harnessing equally — strong typing and clear module boundaries are "ambient affordances" that make certain sensors possible at all. | ssi-ai-kit spans TypeScript/React, Python/FastAPI, Terraform, and 28 Lambda repos — these almost certainly have very different sensor ceilings, but nothing currently says "expect weaker computational sensors here, lean on inferential/human review instead." | A short table in `harness-engineering.md`: per repo-type, what computational sensors are realistically achievable vs. where the harness has to lean on inferential/human review. |
| **No scheduled harness re-audit tied to model/tool upgrades** | Osmani: "harnesses don't shrink, they move" — failure modes shift as models improve; Anthropic explicitly removed a load-bearing construct after a model upgrade to test if it was still needed. | The Top 10 Priorities table tracks *building* the harness, but nothing tracks *revisiting* existing rules/constraints when the underlying model or Copilot version changes. | Add a recurring checklist item: on every material model/tool upgrade, pick 1–2 existing constraints and test whether they're still load-bearing. |
| **No tool-count discipline check per agent** | Osmani: ~10 focused tools beats 50 overlapping ones; tool descriptions occupy prompt space agents actually read. | Agent tool lists (`@story`: read/search/edit/todo/agent; `@orchestrator`: all tools) aren't audited for overlap/necessity — "all tools" for `@orchestrator` is the kind of thing worth re-checking as the agent roster grows. | Add to the doc-garden / harness-maintenance checklist: periodically review each agent's tool list for overlap or unused breadth. |
| **"Context anxiety" not named as a distinct failure mode** | Anthropic: models can start wrapping up prematurely near a *perceived* context limit — separate from generic "long-horizon drift." | ssi-ai-kit's Context Rot table has "long-horizon drift" but not this specific, model-version-dependent behavior. | Add as its own row in the Context Rot table — the mitigation (context reset with structured handoff vs. in-place compaction) is also distinct from the existing story-memory mitigation and worth naming explicitly. |
| **No check that a sensor can be "gamed" instead of satisfied** | Medium/Be Open: reward hacking — an agent satisfies the *letter* of a check via the laziest route, e.g. making a failing test pass by deleting or skipping it rather than fixing the bug it caught. | ssi-ai-kit's sensors (lint/type/test) are trusted at face value once they pass — nothing currently verifies the agent didn't get to "green" by weakening the check itself. | Add a rule: agents may not delete, skip, or loosen an existing test/lint rule to reach a passing state without an explicit human-approved exception; `code-review`/`@verify` should flag diffs that touch test files *and* claim unrelated stories as done. |
| **No risk-tiered human-in-the-loop escalation** | Medium/Be Open: HITL as "the big red STOP button" — reserved for genuinely high-stakes actions, implying *not* every action needs the same gate. | ssi-ai-kit's agents use blanket least-privilege (an agent either can or can't edit/execute) — there's no tiering by blast radius, e.g. a same-repo UI tweak vs. a shared-layer change rippling across 26 lambdas vs. an IaC change touching production infra. | Worth a explicit tiering: low-risk changes proceed with standard review; high-blast-radius changes (shared layer, IaC, cross-repo) get an extra named human checkpoint before merge, not just before the agent starts. |

**Recommendation:** I did **not** edit `ssi-ai-kit/harness-engineering.md` yet — these are proposed additions to an actively-maintained roadmap doc in a different repo than this talk folder. Say the word and I'll append an "External Lessons" section there in the same table format as the existing gap tables.

---

## Part 2 — What should change in the talk

### A. A real, external, citable number (fits the "keep our own numbers illustrative" decision)

We deliberately kept ssi-ai-kit's own metrics directional, not measured. Anthropic's public number isn't ours to prove or disprove — it's citable as-is, with attribution, and it's a genuinely strong "wow" data point:

> Same model. No harness: 20 minutes, $9, broken core gameplay. With a full harness: 6 hours, $200, a functional app with 16 features across 10 sprints.

**Where it slots in:** Section 3 ("The problem, generalized") or right after Section 6 (Sensors) as the payoff stat — "this is why the sensors layer isn't optional." I'd lean toward using it as the closer of the Sensors section (right before Demo Clip 2), since it makes the abstract "guides vs. sensors" argument suddenly very concrete in dollars and minutes — a number a room of 400 engineers will actually remember.

### B. Name-drop Böckeler's article explicitly — home-crowd credibility

This is a Thoughtworks conference, and one of the five best sources on this exact topic was written by a Thoughtworks Distinguished Engineer, published on Thoughtworks' own platform. Citing it by name in the opening or the "core idea" section signals you did your homework and anchors the talk's terminology (guides/sensors) to something the room may already half-recognize — reduces the "is this guy making up terminology" skepticism a skeptical technical crowd might otherwise have.

**Suggested line, Section 2:** *"This isn't a term I coined — Birgitta Böckeler wrote about this on Martin Fowler's site earlier this year, and a lot of what I'll show you is what that looks like actually built."*

### C. A new named failure mode: "context anxiety"

Vivid, one-sentence, and immediately relatable to anyone who's watched an agent visibly rush and cut corners late in a long session: *"the agent starts wrapping up early because it's afraid it's running out of room."* Cleaner and more memorable than "long-horizon drift" alone — add it as a second bullet in Section 8 (Context Rot).

### D. Reinforce the Sensors section with the Generator/Evaluator framing

Both Osmani and Anthropic independently converge on the same finding: agents grading their own work skew positive. That's a second, independent citation for exactly the reason `@verify`-style independent QA agents exist — strengthens Section 6 without adding new content, just a sharper justification for something already in the talk.

**Suggested line, Section 6:** *"And this isn't just our experience — it shows up everywhere in the literature: agents reliably skew positive when grading their own work. That's the whole argument for a separate evaluator that can't edit the code it's judging."*

### E.5 A darker, memorable one-liner: "the fastest way to make a failing test go silent is to delete it"

The reward-hacking framing from the Medium/Be Open piece gives Section 6 a genuinely funny-but-unsettling beat right after "silent success, verbose failure." It reframes that principle from a nice-to-have into something with teeth: silence isn't automatically good news.

**Suggested line, Section 6, right after the two rules slide:** *"And be careful what 'silent' means. The fastest way for an agent to make a failing test go quiet isn't to fix the bug — it's to delete the test. A sensor you don't also watch is just a lock with no one checking who has the key."*

### E. A closing forward-looking beat: "every rule encodes an assumption"

Anthropic's practice of deliberately *removing* a harness construct after a model upgrade — to test whether it was still load-bearing — is a sharper, more concrete version of "treat the harness as software" (Principle 5). It reframes harness maintenance as active experimentation, not just upkeep.

**Suggested addition to Section 9 (5 principles) or the close:** *"Every rule in your harness encodes an assumption about what the model can't do on its own. Those assumptions go stale — the discipline is stress-testing them, not just writing them once."*

### F. Optional: swap or supplement the 5-subsystem framing

walkinglabs' five subsystems (**Instructions, State, Verification, Scope, Lifecycle**) are a clean, alternative audit lens to ssi-ai-kit's "six primitives." Not a replacement — but could work well as a *second, simpler* pass in the takeaway checklist (`06-audience-takeaway.md`), since "does your harness have all five of these?" is an even easier gut-check for someone with zero context than the more detailed primitives table.

---

## Suggested next step

Want me to:
1. Apply **B–E** directly into `01-talk-outline.md` / `02-speaker-script.md` / `04-slide-outline.md` (they're small, surgical additions to sections that already exist), and
2. Separately, append the Part 1 findings to `ssi-ai-kit/harness-engineering.md` as a new dated section?

I'd treat those as two separate asks since they touch two different repos.
