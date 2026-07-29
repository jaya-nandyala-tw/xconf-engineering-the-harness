# Engineering the Harness — Joint Talk Working Doc

**Speakers:** Jaya (brownfield, multi-repo/multi-service platform) + Prabina (greenfield — `ai-workflows`, an in-house agentic SDLC tool built on MCP, connected to Figma/Jira/GitHub)

`[Jaya — note: prior planning-meeting recap described Prabina's project as "single-repo," but both her talk-outline.md drafts describe a "multi-repo confirmation gate" and an agent that "touches multiple repositories in a single run." Now confirmed consistent across two independent drafts, so I'm treating "multi-repo" as accurate and the planning-meeting note as stale — but flagging so Prabina can correct if I'm wrong.]`
**Guide:** Kumar
**Slot:** XConf 2026, Aug 14, Trident Hyderabad — 30 min talk + 10 min Q&A (questions held to the end)
**Dry run:** Aug 13, XConf Hyderabad office, arrive by 12:00pm

*Live doc — edit inline, leave `[name — comment]` tags for open questions rather than deleting someone else's draft.*

---

## 0. Ground rules (from Kumar)

- Focus on **shareable skills/practices**, not specific internal configs — the audience should leave with something they can apply regardless of tool or company.
- Use **external, citable examples** (Anthropic, Thoughtworks/Böckeler, etc.) to back claims where possible.
- **Anonymize** client/production specifics — placeholder names, no real company/tool/ticket data. (We already have a sanitization convention from Jaya's side — happy to share.)
- Flag anything that might overlap with the **"knowledge fabric / context engineering"** talk in the same track — share this doc into the AIFSD shared drive once Kumar/Sanyam set it up, so both talks can de-conflict early.

---

## 1. Shared premise (proposed — edit freely)

> **Agent = Model + Harness.** The model provides intelligence. The harness — guides that steer it before it acts, and sensors that catch it after — is what makes it reliable in a real codebase.

Both of our experiences should slot into this same frame, even though our projects are structurally different (brownfield multi-repo vs. greenfield/single-repo). That contrast is actually useful on stage: it shows the pattern generalizes rather than being one team's fix for one team's mess.

`[Jaya — drafted from Prabina's talk-outline.md: her narrative (assistant-era limits → agentic shift → capability-level automation → production problems → guardrails → V2 architecture) fits this frame well. Her "guardrails" (human confirmation gates, structured input collection) read as guides; her "reviewability" and per-layer testing read as sensors. Prabina — please confirm or correct.]`

---

## 2. Problem statements & solutions

### Jaya's (from ssi-ai-kit, multi-repo/multi-service platform)

| Problem | Pattern / Solution | Status |
|---|---|---|
| AI only sees the open file/repo, defaults to the most common internet pattern, not our convention | Scope instructions by file path — load only what's relevant to the files being touched | ✅ Verified in production |
| Broad tool access lets a "helpful" agent push code or touch unrelated repos | Least-privilege agents — some agents are read-only or execute-only by tool restriction | ⚠️ Partially — real but inconsistent |
| Agent claims "done" whether or not code actually compiles/lints/passes tests | Sensors — automated checks after agent actions, failures fed back for self-correction | ⚠️ Partially — real but not fully automatic yet, still human-triggered |
| Docs/specs drift from what the code actually does | "Codebase wins" — when guideline and code disagree, follow the code | ✅ Verified, with a real drift example (docs said 28 lambdas, actual count was 26) |
| Agents grade their own work too generously | Independent evaluator agent with no edit access; sensor output overrides self-assessment | ✅ Verified in production |
| Sub-agents used as "personas" instead of context tools | Sub-agents as context firewalls — isolate context, return a condensed answer | ✅ Verified in production |
| Rules written once, never revisited | Treat the harness as versioned software | ⚠️ Partially — versioned, but not yet peer-reviewed like code |
| Bloated/generic rule sets dilute what matters | Every rule traces to a real past failure, hand-written | ✅ Verified, strong example |

*(Full verification detail in a companion doc if useful — happy to share.)*

### Prabina's (from `ai-workflows`, greenfield agentic workflow)

`[Jaya — updated from Prabina's refined talk-outline.md (2), which now names 10 explicit "Core Principles" mapped to sections/anti-patterns — a cleaner source than my earlier guesswork off the first draft. Two are genuinely new vs. the first draft: sensible defaults at ungated steps, and structured change summaries (a sharper, separate fix for reviewability than the "input propagation" I'd previously conflated it with). Status column still reflects her outline's own framing, not independent verification — Prabina, please correct/confirm.]`

| Problem | Principle (her numbering) | Pattern / Solution | Status |
|---|---|---|---|
| Context understood in one repo wasn't reliably carried to the next; same story interpreted differently depending on which repo picked it up first | #2 Analyze once, execute independently per unit of ownership | Shared analysis, separate execution — analyze the story once, then each affected repo designs/builds/tests independently from that shared analysis | Per her outline: found in production |
| Nothing stopped the agent from making significant cross-service/architectural changes without sign-off | #3 Gate irreversible/cross-cutting decisions on explicit human confirmation | Multi-repo confirmation gate — a human explicitly confirms which repositories are affected before any code is written | Per her outline: found in production |
| Gating every step causes fatigue and stalls the pipeline | #4 Apply a sensible default at every step that isn't gated | Low-stakes/optional inputs resolve to a defined default (e.g. skip → "None — confirmed") instead of blocking or silently guessing | New in refined outline — keeps the gates in #3 meaningful |
| Downstream steps silently dropped or assumed source material | #5 Make inputs traceable end to end | Input propagation — every downstream step must cite which original inputs it used | Per her outline: found in production |
| Agents rebuilding things that already exist | #6 Default to reuse-before-create | Check for existing components/contracts before building new ones | Per her outline: adopted in V2 |
| Shared contracts (API shapes, data models) rewritten silently | #7 Protect shared state with append-only contracts | Append-only shared docs — changing an existing entry requires a separate, human-approved step | Per her outline: anti-pattern → corrected |
| Large, cross-cutting diffs with no summary for reviewers (low reviewability) | #8 Make reviews easier, not just changes correct | Structured change summaries — every change ships with a generated summary tracing the diff back to acceptance criteria/blueprint decisions | New in refined outline — this is the actual fix for reviewability, distinct from input propagation (#5) |
| One agent writing both tests and the code it's tested against | #9 Give each agent a single responsibility | Split into separate agents, each with a single responsibility | Per her outline: anti-pattern → corrected |
| Agent built layers out of order | #10 Enforce incremental, bottom-up build order | One layer at a time, tests passing before moving on | Per her outline: anti-pattern → corrected |

---

## 3. Demos

**Jaya's two planned clips:**
1. **Guides in action** — same request, same model, run once with no scoped context (wrong pattern) and once with scoped instructions loaded (correct pattern). ~90 sec, pre-recorded.
2. **Sensors in action** — agent makes a mistake, claims done, a sensor catches it, agent self-corrects with no human involved. ~90 sec, pre-recorded.

`[Jaya — drafted from Prabina's talk-outline.md Section 7, which only specifies "live or recorded walkthrough of one real story through the pipeline" without detail. Proposed cut: one story walked end-to-end through her V2 pipeline — structured input collection → multi-repo confirmation gate → shared analysis → per-repo bottom-up build — landing on a guardrail catching something the agent would otherwise have gotten wrong. This covers a third angle (multi-service orchestration + human checkpoints) distinct from Jaya's two demos (scoped context, self-correcting sensors). Prabina — confirm this matches what you actually have recorded/available.]`

---

## 4. Metrics (need real numbers before we can commit to any of these on stage)

| Metric | Jaya's number | Prabina's number | Source / confidence |
|---|---|---|---|
| Small story completion time | *(mentioned in planning meeting: 1–2 hrs — confirm this is real, not aspirational)* | | `[fill in]` |
| Larger feature completion time | *(mentioned: ~1 day)* | | `[fill in]` |
| Bug/defect reduction | | | `[fill in]` |
| Review time / PR size change | | | `[fill in]` |

**Open question:** we'd previously decided to keep our own numbers directional/illustrative rather than presented as measured data (to avoid overclaiming without a controlled comparison). The planning meeting mentioned wanting to show real metrics instead. Need to align on which stance we're taking before finalizing slides — `[Kumar — any guidance on how rigorous these need to be?]`

---

## 5. Cookbook — "5 things to try this week" (the slide people photograph)

Jaya's draft (from ssi-ai-kit generalization):
1. Earn every rule — trace it to a real past failure, hand-written, never auto-generated.
2. The codebase wins — when a guideline and the code disagree, follow the code.
3. Structure in, structure out — ground the agent in real files/paths before it starts, don't let it start from a vague ask.
4. Sub-agents are context firewalls, not personas.
5. Treat the harness as software — version it, review it, revisit it as tools change.

`[Jaya — updated from Prabina's refined talk-outline.md (2): she now has her own authoritative, numbered "Core Principles" list (10 items) rather than the loose anti-pattern table I drew candidates from before. That's more than a 5-item slide can hold, so candidates below are the ones I'd shortlist against Jaya's 5 — but this should be Prabina's call, not a guess. Overlaps worth noting on stage: her #3 (gate irreversible/cross-cutting decisions) is a sharper, more concrete version of Jaya's "codebase wins" #2; her #1 (structure the workflow, don't just trust agent judgment) is essentially the same claim as Jaya's #5 (treat the harness as software), independently arrived at — worth saying explicitly, it's good validation. New since the first draft: #4 (sensible defaults at ungated steps) and #8 (structured change summaries) — both are strong, concrete, demo-able candidates. Prabina — pick/adjust rather than us guessing your priority order.]`

- Candidate A: Gate irreversible or cross-service decisions on an explicit human confirmation — don't let agent judgment alone decide blast radius. (her #3)
- Candidate B: Reuse before you create — make the agent check for existing components before building new ones. (her #6)
- Candidate C: Shared contracts are append-only — changing one is a separate, approved step, never a silent edit. (her #7)
- Candidate D: Build bottom-up, one layer at a time, with tests passing before the next layer starts. (her #10)
- Candidate E: A gate is only meaningful if most steps don't have one — give every other step a sensible default instead of blocking or guessing. (her #4, new)
- Candidate F: Ship every change with a summary tracing it back to the requirement it fulfills — make reviews easier, not just changes correct. (her #8, new)

---

## 6. Jargon glossary (build this live as we write — define every term before first use on stage)

| Term | One-line definition |
|---|---|
| Harness | Everything around the model — orchestration, tool permissions, guardrails, feedback loops — that turns raw model output into reliable behavior in your codebase |
| Guide | Anything that steers the agent *before* it acts — scoped instructions, specs, restricted agents, skills |
| Sensor | Anything that checks the agent's work *after* it acts — linters, type checks, tests, an independent review step |
| Context rot | Quality degradation as a session runs long, or as the knowledge base an agent trusts drifts from reality |
| Blast radius | The set of other repos/services/files a change silently affects, beyond the one being edited |
| Least privilege (for agents) | An agent's tool access is restricted to only what its role needs — enforced by tooling, not just requested in a prompt |

`[Jaya — added from Prabina's talk-outline.md; confirm definitions match her intent.]`

| Capability-level automation | Assigning an agent an entire feature/capability at once, rather than breaking it into smaller stories first |
| Confirmation gate | A point in the workflow where the agent must stop and get explicit human sign-off before proceeding (e.g. which repos are affected) |
| Append-only (shared contracts) | Existing shared definitions (API shapes, data models) can be added to but never silently rewritten — changing one requires a separate approval step |
| Unit of ownership | The boundary (e.g. a repo or service) within which an agent designs, builds, and tests independently, after a shared analysis step establishes common understanding across boundaries |
| Sensible default | The pre-defined, non-blocking resolution for a low-stakes or optional step, used so gates stay reserved for genuinely high-stakes decisions instead of firing on everything |
| Structured change summary | A generated write-up shipped with a change that traces the diff back to the acceptance criteria/decisions it fulfills, so a reviewer doesn't have to reconstruct intent from the diff alone |

---

## 7. Section ownership (draft split — adjust freely)

| Section | Owner (draft) |
|---|---|
| Hook / cold open | `[TBD]` |
| Core idea (Agent = Model + Harness) | `[TBD — shared]` |
| The problem, generalized | `[TBD — both, different examples]` |
| Guides | Jaya (unless Prabina wants to co-narrate) |
| Demo 1 | Jaya |
| Sensors | `[TBD]` |
| Demo 2 | `[TBD]` |
| Honest gaps / what's still unsolved | `[TBD — both]` |
| 5 principles / cookbook | Shared close |
| Recap + close | `[TBD]` |

---

## 8. Open questions

- [ ] Real vs. illustrative metrics — decide before slides are built.
- [ ] Who presents which sections — split time roughly 15/15, or interleave?
- [ ] Confirm with Kumar/Sanyam once the AIFSD shared drive exists — cross-check against the "knowledge fabric" talk.
- [ ] Prabina to review/correct Section 2 and 3 — Jaya drafted both from her `talk-outline.md` as a starting point, not from her direct input, so treat as unverified until she confirms. Also needs her call on the repo-scope discrepancy noted under Speakers, and on whether any of the Section 5 candidates should replace/join the shared cookbook.
- [ ] Align on one shared cookbook (Section 5) rather than two separate lists.
- [ ] **New:** Prabina's refined outline is now a fully self-contained talk in its own right — own title, alternate titles, abstract, and a numbered "Core Principles" spine — not just problem/solution notes anymore. Worth explicitly confirming with her whether the joint talk adopts her principles-first structure (numbered principles, each paired with its anti-pattern) rather than Jaya's narrative structure (harness → guides → sensors → demos), or blends both. This affects section ownership (Section 7) and probably needs settling before the shared cookbook (Section 5) can be finalized, since her 10 principles are really her own cookbook already.
