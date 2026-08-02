# AI-Workflows — Potential Content: Verified Problem/Solution Pairs

Companion to `[09-potential-content.md](./09-potential-content.md)`, same purpose and same method — each of `ai-workflows`'s 10 "Core Principles" (from its own `docs/talk-outline.md`) checked against the actual harness artifacts (`ai-dev-workflow.md`, `.cursor/agents/*.md`, `.cursor/rules/*.mdc`, `dev-workflow-demo-runbook.md`) rather than taken on faith. Nothing here has been folded into `01-talk-outline.md` / `11-collab-doc-draft.md` yet — this is the staging area.

**Written already fully abstracted, per team decision:** no client/company name, no product name, no real repo names, no real Jira keys. Evidence below cites `ai-workflows` **framework files only** (agent definitions, rules, the master workflow doc) — these describe the harness mechanism itself, not any domain content — and deliberately omits the one real end-to-end run available for verification, since it's tied to specific (confidential) domain and repo names. Where a mechanism is only demonstrated by that run, the caveat says so without naming it.

**Scorecard:** 6 fully supported (1 with an honesty caveat) · 2 partially supported · 1 overstated · plus one cross-cutting harness-format note.

---

## Harness-format note (applies to every principle below)

Unlike `ssi-ai-kit`'s Copilot custom-agent format (`.github/agents/*.agent.md` with declared `tools:` lists), `ai-workflows`'s harness is built entirely on **Cursor custom agents** (`.cursor/agents/*.md`), **rules** (`.cursor/rules/*.mdc`), **skills**, and **commands** — none of the agent files carry a `tools:` frontmatter field restricting what an agent can technically call. Every boundary described below (single responsibility, repo scope, reuse-before-create) is enforced by an explicit **prose "Anti-Scope" / "Critical Rules" section that the agent is instructed to obey**, not by tool-level sandboxing. Worth the same honesty framing `09-potential-content.md` gives `ssi-ai-kit`'s inconsistent tool-gating: the boundaries are real and consistently *written*, but nothing prevents an agent from technically overstepping them the way a hard tool restriction would.

---

## 1. Structure the workflow, don't just trust agent judgment — ✅ Fully supported

**Claim:** Guardrails are a process-design problem, not a model-capability gap — the fix is to structure the workflow itself, not to hope the agent behaves.

**Evidence:**

- `.cursor/rules/ai-workflow-entry.mdc` is an `alwaysApply: true` rule whose explicit job is to override the model's own default instinct: *"This rule overrides the default 'do something useful immediately' behaviour for these intents."*
- It fires on a defined trigger list (bare ticket-key pattern, explicit workflow phrases, slash commands) and forces a fixed input-collection sequence (**Step 0a → 0b → 0c**) as "the agent's very first action" — before any exploration, search, or coding.
- The rule is versioned like the rest of the harness, alongside `.cursor/rules/architecture-overview.mdc` and the phase-specific agent files — not a one-off system-prompt instruction.

**Defensible framing:** "The harness doesn't ask the model to remember to be careful — it has a standing rule that structurally intercepts the request before the model gets a chance to freelance."

---

## 2. Analyze once, execute independently per unit of ownership — ⚠️ Partially supported

**Claim:** A story is analyzed once; each affected repo then designs, builds, and tests independently from that shared analysis.

**Evidence for the "shared analysis" half:**

- `ai-dev-workflow.md`'s Phase 1 Inputs Propagation table shows one readiness report consumed identically downstream by every later phase.
- The Architect agent's file plan and test strategy are explicitly **grouped by repo** — "one `### <repo-path>/` subsection per repo," "which repo each test lives in."

**Where it overstates the "independent execution" half:**

- What's actually documented is **one linear pipeline** (readiness → blueprint → RED → GREEN → REFACTOR → REVIEW) whose *artifacts* are repo-tagged throughout — not N separately forked pipelines that run in parallel per repo after the shared analysis step. The implementer agent is told to "group edits per repo," which implies sequential, not concurrent, per-repo work within one agent run.

**Defensible rewording:** "Shared analysis, then repo-scoped execution — every downstream artifact (file plan, tests, code) is explicitly partitioned by repo so the boundary is never ambiguous. What isn't demonstrated is true parallel/independent execution; today it's one pipeline with repo-labeled sections, not N forked pipelines."

---

## 3. Gate irreversible or cross-cutting decisions on explicit human confirmation — ✅ Fully supported (with a caveat)

**Claim:** Nothing should let an agent decide repository scope, or make a cross-service architectural change, without an explicit human sign-off first.

**Evidence:**

- The Architect agent's **Step 7, "Multi-Repo Confirmation Gate," is marked BLOCKING** and is explicit that it applies to *every* functional story, not just complex ones: draft the repo table internally → present it via a structured confirm/adjust/cancel question → **do not write anything to disk until the human answers** → if adjusted, loop back and re-ask rather than silently absorbing the change.
- The rule is enforced downstream too: the implementer agent is told the confirmed repo table "is the **only** set of repos you are allowed to modify," and if it seems to need a repo outside that set, it must **stop and escalate** rather than proceed.

**Caveat:** The gate's *process* is unambiguous and mandatory in the agent definition. The one full pipeline run available for verification happened to be a single-repo, off-workspace edge case, so it doesn't independently demonstrate the gate firing across a genuinely multi-repo set — that part rests on reading the process definition, not observed behavior.

**Defensible framing:** "The confirmation gate is written as non-skippable, and the boundary it sets is enforced downstream by every later phase, not just declared once and forgotten. The multi-repo case specifically hasn't been observed firing end-to-end — only the process definition and the single-repo instance of the same mechanism."

---

## 4. Apply a sensible default at every step that isn't gated — ✅ Fully supported

**Claim:** Gates are only meaningful if most steps *don't* have one — low-stakes/optional inputs should resolve to a defined default instead of blocking the pipeline or silently guessing.

**Evidence:**

- `ai-workflow-entry.mdc` Step 0b: every optional field's `AskQuestion` rung offers `"Skip — <field> is not available"` as a first-class option (explicitly *never* offered for the one required field). Picking skip records `**None — confirmed by user`** — a defined, explicit value, not a silent omission.
- Step 0c's final confirmation table renders `None — confirmed by user` inline for any skipped input, so the default is visible and auditable, not hidden.
- This is distinct from the confirmation gate in #3 — the AUQ ladder has exactly one blocking gate (final confirm), and every other rung either collects a value or resolves to the explicit default.

**Defensible framing:** "Only one thing in the intake sequence is a hard stop — the final confirmation. Every optional field either gets a real value or an explicit, visible default. That's what keeps the one gate meaningful instead of being buried among a dozen other stops."

---

## 5. Make inputs traceable end to end — ✅ Fully supported

**Claim:** Every downstream step should declare which source material it used, so nothing is silently dropped or assumed.

**Evidence:**

- `ai-dev-workflow.md` opens with a dedicated **"Phase 1 Inputs Propagation"** section and table mapping all four Phase-0 inputs against every one of the six pipeline phases — e.g. the row for the requirements-source input shows exactly which section of each phase's output artifact is required to cite it (`## Approach` in the blueprint, "every line traces to an AC" in the implementation phase, a named section in the final PR).
- Each phase-specific agent file re-states the same rule from its own side: the blueprint agent must "consume the 4 Phase 1 Inputs explicitly," the implementer agent must anchor every line of code to one of those same four inputs and is told **"if you cannot trace it, do not write it."**
- The rule includes an explicit anti-drift clause: *"Any change to the 4 input values mid-flow requires re-running intake] and re-confirming the multi-repo gate. Agents must not silently absorb new inputs."*

**Defensible framing:** "It's not just that inputs get passed along — every phase's own template has a header table that names which upstream inputs it consumed and how. A reviewer can check that table against the artifact instead of trusting that nothing got dropped."

---

## 6. Default to reuse-before-create — ✅ Fully supported

**Claim:** Agents must check for existing components/contracts before building new ones, rather than defaulting to writing something fresh.

**Evidence:**

- The blueprint template makes a "Reuses" column **mandatory for every UI-related file plan row** — a new row must either name the existing component/helper it reuses, or carry an explicit `NEW — justification: <reason>` label. There is no unlabeled "just create it" path.
- The implementer agent has a named rule, **"Reuse Before Create,"** with an explicit allow/deny list: importing or extending an existing component/helper is allowed; introducing a parallel, near-duplicate one is not.
- The test-writing agent has the same discipline on its own inputs — it's instructed to reuse existing test helpers/fixtures rather than defining new ones, with a documented fallback discovery path if no explicit reference is given.

**Defensible framing:** "Reuse-before-create isn't a suggestion in a style guide — it's a required column in the design artifact and a named rule with explicit allow/deny examples in the agent that writes the code."

---

## 7. Protect shared state with append-only contracts — ❌ Overstated (not independently verified)

**Claim:** Shared contracts (API shapes, data models) can only be added to; changing an existing entry requires a separate, human-approved step.

**Evidence against independent verification:**

- The claim appears **verbatim, multiple times, only in `ai-workflows`'s own `docs/talk-outline.md`** — it is a stated principle and a listed anti-pattern correction in the talk's own draft, not something independently found enforced in the agent definitions, rules, or blueprint template reviewed.
- No agent file, rule, or template inspected contains an actual append-only enforcement mechanism (e.g. a rule blocking edits to an existing contract entry, or a required "why this is additive, not a rewrite" field). The blueprint template's `## Data Model` and `## API Design` sections are free-form prose/interface blocks with no such constraint written into them.
- One incidental, unrelated match: a readiness report mentions an "append-only" **audit log table** as a design detail for one specific story — a database design choice, not a mechanism protecting *shared cross-repo contracts* in general.

**Defensible rewording:** "This is a named, real intention in the harness's own roadmap — but on the evidence available, it's aspirational rather than demonstrated. No template field, rule, or agent instruction currently stops an agent from silently rewriting an existing shared contract entry; the append-only discipline would need to be added as an explicit rule (e.g. a required 'this is additive, here's why' field) before it's a fair claim about what the harness *does*, versus what it *intends*." *(Good honesty beat — same shape as `09-potential-content.md`'s "promote rule → code" gap for `ssi-ai-kit`: a stated principle without a demonstrated enforcement mechanism yet.)*

---

## 8. Make reviews easier, not just changes correct — ✅ Fully supported

**Claim:** Every change should ship with a structured summary tracing the diff back to the requirement/decision it fulfills, instead of handing a reviewer a large diff cold.

**Evidence:**

- The review/PR-generation step's output is specified consistently across multiple files as containing an **AC coverage table** (mapping each acceptance criterion → test file → test name → pass/fail), a **risk assessment**, and **rollback steps** — not just a diff.
- The review command's own gate table refuses to proceed without it: missing AC coverage routes back to the test-writing phase rather than being waved through.
- This is explicitly a **separate, later step** from input traceability (#5): #5 is about what each phase *consumed*; this is about what gets **generated for the human reviewer** at the end, summarizing the whole chain.

**Defensible framing:** "A reviewer doesn't get a bare diff and a ticket number — they get a table mapping every acceptance criterion to the specific test that proves it, plus a risk note and a rollback plan, generated automatically as part of the same step that would otherwise just open the pull request."

---

## 9. Give each agent a single responsibility — ✅ Fully supported (with the harness-format caveat from above)

**Claim:** Don't let one agent both write the tests and the code it's tested against.

**Evidence:**

- The blueprint-writing agent has a six-item **Anti-Scope** list that hands off every adjacent responsibility by name: *"Do not write tests — that is the test agent]'s job... Do not write production code — that is the implementer]'s job... Do not refactor existing code — that is the refactor agent]'s job."*
- The implementer agent is separately, explicitly forbidden from touching test files at all — its own instructions say it must **stop and flag to a human** if it believes an existing test is wrong, rather than editing the assertion itself.
- The refactor step keeps the same boundary from the other direction: **zero test files modified**, behavior provably unchanged (tests stay green throughout), no new features — a structural change only.

**Caveat (see harness-format note above):** this separation is enforced entirely by each agent's own prose instructions, not by withholding edit access at the tool level — an agent could technically edit a file its own Anti-Scope forbids; nothing blocks it mechanically.

**Defensible framing:** "Every agent's own definition names the adjacent job it must not do and who owns it instead — a real, consistent separation of duties, just one enforced by convention and instruction rather than by hard permissions."

---

## 10. Enforce incremental, bottom-up build order — ⚠️ Partially supported

**Claim:** Work proceeds one layer at a time, with tests passing before moving to the next.

**Evidence:**

- The implementer agent's own rule: *"Implement incrementally. Write code for one test at a time, run tests after each unit."* This is a real, named constraint, not just a description of how someone happened to work.
- A logged example of one real implementation run shows the exact bottom-up order followed inside a single unit of work: constants → data models → service layer → module export → migration → configuration registration — each a dependency of the next, built in that order.
- The refactor phase repeats the same discipline: run tests before touching anything, make one small change, run tests again, repeat.

**Where it's narrower than the principle's phrasing suggests:**

- What's demonstrated is bottom-up ordering **within a single implementation unit / single repo's worth of work** (constants before the service that uses them, migration before the config that registers the module). It is not shown as a **cross-repo layering rule** (e.g. "the domain-owning repo must be built and merged before the consuming repos start") — the talk-outline's phrasing ("one layer at a time," "gated by tests per layer") reads more ambitiously multi-repo than the evidence on hand supports.

**Defensible rewording:** "Bottom-up, test-gated ordering is real and named as a rule, and there's a concrete example of it holding at the level of one implementation pass (dependencies built before the things that depend on them, tests run after every unit). What isn't yet demonstrated is the same discipline enforced *across* repos as a sequencing rule — that's a stronger, still-unverified version of the same idea."

---

## Cross-cutting comparison with `ssi-ai-kit` (for `08-lessons-and-gaps.md` / `11-collab-doc-draft.md` use)


| Dimension                     | `ssi-ai-kit` (brownfield)                                                                                               | `ai-workflows` (greenfield)                                                                                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where guardrails bite hardest | Existing repos with years of drift already baked in — the harness's job is mostly *detecting and correcting* divergence | Repos being stood up in parallel with no drift yet — the harness's job is mostly *preventing* divergence before it can start                                         |
| Tool-level enforcement        | Partial — some agents (`@ask`, `@verify`) genuinely have restricted tool lists; others don't                            | None found — every boundary (single responsibility, repo scope, reuse) is prose-only, no `tools:` frontmatter anywhere                                               |
| Sensor automation             | Partial — real pass/fail checks exist but are manually invoked, not wired to fire automatically after every action      | The RED→GREEN→REFACTOR→REVIEW gate sequence *is* the automatic loop — each phase has a machine-checkable pass/fail verdict before the next phase is allowed to start |
| Weakest verified claim        | "Promote rules from docs into code" — named as a principle, not yet executed (flagship candidate still prose-only)      | "Append-only shared contracts" — named as a principle in the same way, no enforcement mechanism found yet either                                                     |
| Strongest verified claim      | "Codebase wins over docs" — concrete, funny, real drift example on hand                                                 | "Inputs traceable end to end" — every phase template has a literal header table naming which upstream inputs it consumed and how                                     |


Both systems independently named a principle they haven't yet mechanically enforced (`ssi-ai-kit`'s rule→code promotion; `ai-workflows`'s append-only contracts) — worth saying out loud on stage as a shared, honest "we know this is still a gap" beat rather than two isolated weaknesses.