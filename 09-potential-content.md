# Potential Content — Verified Problem/Solution Pairs

Raw findings from fanning out 10 agents to verify each "developer talking point" (Problem → Pattern pair) against the real `ssi-ai-kit` codebase (`/Users/jayasimhareddy/Documents/codebase/ssi-ai-kit`), rather than taking the claims on faith. Purpose: a source-of-truth staging area to mine from when we finalize `01-talk-outline.md` / `02-speaker-script.md` — nothing here has been folded into the outline yet.

**Scorecard:** 5 fully supported · 2 partially supported · 3 overstated.

---

## Talk-wide correction (applies everywhere)

There is no `CLAUDE.md` or Claude Code agent config anywhere in the repo. The entire harness — scoped instructions, 8 agents, skills, prompts — is built on **GitHub Copilot's** custom-agent format (`.github/agents/*.agent.md`) and `applyTo`-glob-scoped instructions (`.github/instructions/*.instructions.md`). The actual `.claude/` directory contains only `settings.local.json`. Any slide or line that implies "Claude Code" specifically needs to say "GitHub Copilot" instead — or stay tool-agnostic.

---

## 1. Scope by file path — ✅ Fully supported (naming caveat)

**Claim:** AI only sees the open file/repo, so it defaults to the most common internet pattern, not your team's convention. Pattern: scope instructions by file path — load only what's relevant to the files being touched.

**Evidence:**
- `.github/instructions/` has 5 files with `applyTo` globs: `global.instructions.md` (`**`), `lambdas.instructions.md` (`codebase/lambdas/**`), `portal-service.instructions.md`, `portal-ui.instructions.md`, `iac.instructions.md`.
- Each scoped file references a domain-specific "constitution" spec rather than the whole `specs/` tree — genuine progressive disclosure.
- `harness-engineering.md` (lines 58–59) and `DEMO.md` (line 157: "AI only loads context relevant to the file being edited — no 32-repo noise") independently corroborate this as shipped, not aspirational.

**Caveat:** mechanism is GitHub Copilot's `applyTo`, not Claude Code's `CLAUDE.md` hierarchy — see talk-wide correction above.

---

## 2. Least-privilege agents — ⚠️ Partially supported

**Claim:** Broad tool access means a "helpful" agent can push code, restructure architecture, or touch unrelated repos. Pattern: least-privilege agents — a Q&A agent is read-only, a planning agent can't push, enforced by tooling not prompting.

**Evidence:**
- `@ask` → `[read, search, web, agent]` — no edit, no execute. Genuinely read-only.
- `@verify` → `[read, search, run]` — no edit; own description: "Cannot edit files."
- `@groom` → `[read, search, todo, agent]` — no edit, no execute.
- `@git` → `[execute, read, search]` — no edit.
- `@story`, `@test`, `@orchestrator`, `@doc-garden` retain edit and/or execute.

**Where it overstates:**
- `@story` is also a planning-flavored agent but *does* have `execute`, so "a planning agent can't push" isn't uniformly true — it's convention (delegates git ops to `@git`), not a hard restriction.
- Some sensitive constraints (e.g. a read-only reference repo `engineering-agent-poc/` that `@story` must never edit) are enforced entirely by prose ("must NEVER be edited"), not by tool restriction — `@story` has full edit access and could technically touch it.
- No literal "least privilege" language appears in the source docs — that's the talk's own framing, not a term ssi-ai-kit uses.

**Defensible rewording:** "Some sub-agents declare restricted tool lists in frontmatter, genuinely enforced by the harness's tool-gating — `@ask` is read/search/web only, `@verify` and `@groom` exclude edit. But it's inconsistent: other 'planning' agents retain full edit+execute, and some sensitive constraints are still prompt-only."

---

## 3. Sensors self-correct automatically — ❌ Overstated

**Claim:** AI says "done" whether or not the code compiles, lints, or passes tests. Pattern: sensors run after every agent action and feed failures straight back so the agent self-corrects without a human in the loop.

**Evidence against automatic closure:**
- `.claude/settings.local.json` contains only a permission allowlist — no `PostToolUse` hook or any mechanism that fires after an edit.
- The "sensor loop" is prose: `.github/copilot-instructions.md` rule 8 ("Verify before finishing...") and a "Completion Sensor Loop" section — a request the model may or may not comply with, not an enforced gate.
- `harness-engineering.md`'s own "Context Rot — Open Gaps" table admits: *"Self-verification bias — Agent claims broken code is finished."*
- `@verify` does run real commands with real exit codes and reports PASS/FAIL — genuine — but must be **manually invoked** before a PR, and on failure tells the human to fix it and re-run `@verify` themselves. Human-mediated, not closed.
- Pre-commit hooks (ruff/tsc/terraform-validate) only run at `git commit` time, only if installed locally, and are bypassable with `--no-verify`. "Architecture Enforcement" is a named Key Gap: import boundaries are "prose DO-NOT rules" only.

**Defensible rewording:** "The harness *prompts* the agent to self-verify and provides an on-demand `@verify` agent with real pass/fail sensors — but nothing runs automatically after every action, and the loop requires manual re-invocation to close."

---

## 4. Promote rule → code — ❌ Overstated

**Claim:** The same instruction gets written in prose repeatedly and ignored. Pattern: promote it into a linter rule or failing test — prose is the starting point, mechanical enforcement the destination.

**Evidence:**
- This is **Principle #7 verbatim** in `harness-engineering.md`: *"Promote rules from docs into code... Prose is the starting point; mechanical enforcement is the destination."* — a stated principle, not a demonstrated outcome.
- The flagship candidate — UI architecture/import boundaries (`specs/portal/ui-constitution.md`, extensive prose DO-NOT rules) — is explicitly logged in the same doc's "Key Gaps" table as unresolved: *"Import boundaries enforced only as prose DO-NOT rules → Next Step: Add dep-cruiser (UI) + import-linter (Python)."* Unchanged across every revision, marked "Defer."
- No commit anywhere in the repo ever added dep-cruiser, import-linter, or a custom ESLint rule. The one ESLint config found uses stock recommended presets only.

**Defensible rewording:** "The team has explicitly named this failure mode and adopted 'promote prose to mechanical enforcement' as a stated principle — but hasn't yet executed it. The flagship candidate remains prose-only, and the proposed linters are still a deferred backlog item." *(Good honesty beat — pairs well with the Context Rot section's "this isn't solved" framing.)*

---

## 5. Codebase wins over docs — ✅ Fully supported

**Claim:** Docs/specs drift from what the code actually does, and the agent trusts the stale doc. Pattern: when a guideline and the code disagree, the agent follows the code.

**Evidence:**
- Verbatim in `harness-engineering.md:31` (Principle 5): *"Codebase wins over guidelines. When existing code contradicts a guideline, the agent follows the code. The codebase is the source of truth."* Logged as "✅ Done on 2026-05-19."
- Also in `.github/copilot-instructions.md:32` (Global Rule 7) — the file every agent session loads first, so it's operative.

**Nuance:** `specs/lambdas/constitution.md:305` says the formal constitution itself "supersedes informal conventions and local preferences" — i.e., for *formal* specs, the spec outranks ad hoc code patterns. Not contradictory, but worth having the distinction ready if asked "which wins, the constitution or the code?"

**🎤 Concrete anecdote for the talk:** real drift found in the wild — `.github/copilot-instructions.md` and `specs/lambdas/dependency-map.md` both say "28 lambdas," but `codebase/lambdas/` actually contains **26** directories. Also `specs/product/feature-inventory.md` marks a feature as 🔧 WIP that's already fully implemented in the UI code. Concrete, funny, and proves the rule is necessary rather than theoretical.

---

## 6. Independent evaluation — ✅ Fully supported

**Claim:** Agents grade their own work too generously (self-verification bias). Pattern: a separate agent that can't edit the code it's judging; computational checks override self-assessment.

**Evidence:**
- `@verify` (`tools: [read, search, run]`) has no edit/write capability — own description: *"Independent QA evaluator... Cannot edit files."*
- Explicit sensor-first framing: *"Exit codes and test output override self-assessment,"* and on failure: *"Do NOT suggest a fix"* — routes back to the implementer instead of self-correcting.
- `harness-engineering.md` names "Self-verification bias" as a tracked risk with `@verify` as the mitigation, and describes a two-gate close: `@verify` (objective sensor check) → `code-review` skill (inferential) → PR.
- Contrast agent: `@story` (the implementer) has full edit access — genuine separation of duties.

---

## 7. Structure in, structure out — ❌ Overstated

**Claim:** Vague prompts produce vague code that ignores conventions. Pattern: real file paths and real symbol names in is what buys convention-following code out.

**Evidence against the literal claim:**
- All 3 prompt templates in `.github/prompts/` take a single freeform `{{ input }}` string — no required file-path/symbol fields, no validation against real paths.
- Skill `argument-hint` fields (e.g. "DNA-XXXX story description," "Feature name and domain") are loose hints, not enforced structure.
- Real file paths appear only as **agent-generated output** (via `Explore` subagent delegation), never as required human input.
- `specs/` is prose `.md`, not machine-readable JSON/YAML.

**What's actually true:** `STORY-IMPLEMENTATION-GUIDE.md`'s "Start With Intake" does require structured *ticket* metadata (Jira ID, description, AC, scope), and `@story`'s Phase 2 mandates a discovery-before-code sequence: intake → codebase search → plan pinned to real files → human approval gate — before any code is touched.

**Defensible rewording:** "The harness doesn't require humans to type file paths into prompts. It enforces structure via process gates instead: minimal ticket intake → mandatory codebase search → a plan grounded in real files → human approval — before code gets written. Structure is enforced by sequence, not by prompt syntax."

---

## 8. Sub-agents as context firewalls — ✅ Fully supported

**Claim:** Sub-agents get used as role-play "personas" instead of a context-management tool. Pattern: isolate context, return a condensed answer, don't role-play a character.

**Evidence:**
- All 8 agents (`ask`, `git`, `groom`, `story`, `test`, `verify`, `orchestrator`, `doc-garden`) are function-named, not personality-based — no "Aria the Architect" style role-play.
- `orchestrator.agent.md`: *"You do NOT do the work yourself... Interpret → Plan → Delegate → Coordinate → Synthesize."*
- `ask.agent.md` / `groom.agent.md` explicitly instruct delegating to `Explore` and to *"Return: file paths, a 1-para summary... No raw file contents"* — a textbook context firewall.
- Stated as explicit design Principle #4 in `harness-engineering.md`: *"Sub-agents are context firewalls... not role-play personas."* — intentional philosophy, confirmed in practice.

**Caveat:** top-level agents are still user-addressable by name (`@ask`, `@git`), which is superficially persona-like — but their content is purely functional/tool-scoped.

---

## 9. Treat the harness as software — ⚠️ Partially supported

**Claim:** Instructions/prompts written once and never revisited rot like a stale test. Pattern: version it, review it in PRs, refactor it as the model/tools change.

**Evidence it's practiced:**
- `.github/{agents,instructions,prompts,skills}` has 23 commits (Apr 10 – Jul 21 2026) with real iterative messages: "Restructured agents, skills to github way," "Context Rot Optimizations," "cleaned up unused skills."
- `specs/` has 11 commits of genuine refactors, not one dump.
- `harness-engineering.md` itself is a living, dated doc — self-tracked revision over time.

**Where it falls short:**
- Zero CI workflows, zero PR template for the harness itself.
- Only 1 merge-via-PR in the entire history; 48 of 59 commits are one author pushing directly to `main`. No evidence of team review on harness files.
- `harness-engineering.md` hasn't been updated since 2026-06-19 despite skills/agents changing as recently as 2026-07-16 — the meta-doc lagged the harness it describes.

**Defensible rewording:** "Instructions were versioned and iteratively refactored as the harness matured — but revised by one person pushing directly to main, not reviewed in PRs like code. 'Treat it as software' is half-true: versioned, yes; peer-reviewed, not yet." *(Also an honest beat — could pair with the "every rule encodes an assumption" closing line from `08-lessons-and-gaps.md`.)*

---

## 10. Earn every rule — ✅ Fully supported

**Claim:** Bloated, often auto-generated rule sets dilute the rules that matter. Pattern: every instruction traces to a real past failure, hand-written, never auto-generated.

**Evidence:**
- Verbatim in `harness-engineering.md:27`: *"Earn each rule. Every instruction must trace to a past failure or hard constraint. Hand-craft rules — never auto-generate them (auto-generated agentfiles hurt performance ~20%)."*
- Rules read as hard-won and codebase-specific, not generic boilerplate — e.g. "Each lambda pinpoints a specific layer hash... Always check which layer hash a lambda references before modifying," "Preact Signals... deprecated, exists in old UI only."
- Git history shows incremental curation, including an active *pruning* commit ("Context Rot Optimizations") that **removed** an entire agents/skills table to cut bloat — the opposite of accretive auto-generation.
- Explicit anti-bloat mechanisms: "Reference, never duplicate" principle; splitting a monolithic file into per-flow files specifically to fight context rot.

---

## Suggested next step

When we're ready to finalize `01-talk-outline.md`:
- Fold the **talk-wide GitHub-Copilot-not-Claude-Code correction** in first — it touches every section.
- Consider presenting rows 3, 4, 7, 9 not as solved patterns but as "here's what we tried, here's what's still a gap" — more credible than overclaiming, and doubles as content for the Context Rot / honesty section.
- The "28 lambdas vs. 26" anecdote (row 5) is ready to drop in as-is.
