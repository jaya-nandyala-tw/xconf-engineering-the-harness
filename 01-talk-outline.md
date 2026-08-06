# Talk Outline — "Engineering the Harness" (30 min)

Run-of-show for a 400+ person audience. This mirrors `visualizer/src/content/deck.ts`'s own `SECTIONS` array — 9 sections — and its `timeLabel`s, which is the deck's own claim about pacing, not a re-timed estimate. **Those time labels have not been stress-tested against how much the deck now contains.** The decision has been made to cut before the Aug 13 dry run rather than rehearse-then-cut — see the cut-candidates list at the bottom of this section table before that dry run, and actually pick from it.

**Resolved framing decision:** "Layer 3 — Make it reviewable" is no longer a standalone section. It's folded into Section 6 (Sensors) as a continuation — "sensors catch the mistake; can a human still tell what happened?" — so the talk's "two layers: guides and sensors" framing (stated in the hook, agenda, and the `nested-layers` scene) now holds end to end instead of being contradicted 80% through.

| # | Time | Section | Goal | Slide/scene ids | Demo? |
|---|---|---|---|---|---|
| 1 | 0:00–1:30 | Title + hook + agenda | Open cold with the pain, introduce both speakers, state the promise | `s1`, `s1b`, `s2`, `s3` | – |
| 2 | 1:30–5:00 | The core idea | Land "Agent = Model + Harness" and the 3-layer hierarchy as the mental model for the whole talk | `nested-layers` | – |
| 3 | 5:00–9:00 | The problem, generalized | Make the pain recognizable to *any* multi-repo team, then make it concrete with one worked example | `divider-problem`, `s7`, `workspace-wrapper`, `s8`, `s9` | ✅ `workspace-wrapper` |
| 4 | 9:00–13:00 | Layer 1 — Guides | Explain the seven primitives that steer an agent *before* it acts | `s10`–`s13b` | – |
| 5 | 13:00–15:30 | Ask Before Deciding | Show the same "gate the irreversible, default the rest" principle from Guides, concretely, on a greenfield project | `s14a`, `s14b` | ✅ `input-collection-gate` |
| 6 | 15:30–22:00 | Layer 2 — Sensors (incl. "make it reviewable") | Explain the feedback loop that makes an agent self-correct *after* it acts, run one real story through the whole 6-phase pipeline, then extend into whether what's left is still reviewable by a human | `s15`, `guides-sensors`, `s17a`–`s17d`, `s20b`, `s20c`, `s20d` | ✅ `guides-sensors` |
| 7 | 22:00–26:30 | Context rot — the open problem | Credibility beat: this isn't a solved-problem victory lap, it's ongoing engineering | `divider-context-rot`, `context-rot-problem`, `context-rot-solution-1`, `progressive-disclosure`, `s20` | ✅ 3 scenes |
| 8 | 26:30–29:00 | 5 principles for any team | The actionable takeaway — what to do Monday morning | `s21` | – |
| 9 | 29:00–30:00 | Self-score + recap + close | Interactive gut-check on the checklist, then land the one sentence you want remembered; hand off to Q&A | `s21b`, `s22` | – |

Section 6 is now the single largest block in the talk at 6:30 — it absorbed what used to be a separate 2:30 section. That makes it the section most worth timing precisely in rehearsal; it's also the one carrying the most content (a 15-beat interactive scene, 4 statement slides, 2 two-column slides, and a table).

**Open logistics question, still unresolved:** `11-collab-doc-draft.md` §7–8 lists "who presents which section — split 15/15, or interleave?" as open, and that's staying open per the last round of decisions — flagged for Prabina, not guessed at here. The section-by-section notes below still propose a split based on which speaker's project each section's content actually comes from, as a starting point for that conversation, not as a decision already made.

---

## Cut candidates for the "cut now, before the dry run" pass

The deck had ~2x the content the original 30-minute plan assumed. These are the specific things worth cutting, ranked by how little the talk loses if cut. **Only #1 is decided; the rest are still open — pick from this list and update the sections above and `deck.ts` once you have.**

1. **`progressive-disclosure` (`SpecSplitTree`) scene, inside Context Rot — cut candidate #1.** It's the third demonstration of progressive disclosure in the deck (`s12` in Guides, then this one) and doesn't pair as tightly with `context-rot-problem`/`context-rot-solution-1` as those two pair with each other. Cutting it saves a full scene (~60–90 sec) and leaves the sub-agent before/after pair as Context Rot's one solution beat instead of two. **Not decided — still open, not cut.**
2. **`s20d` (structured change summary table) — cut or fix, not left as-is.** Its rows are still literal placeholders (`"AC-1: ..."`, `"test_..."`). Either cut it (the point is already made by `s20b`'s honesty beat and `s20c`'s stats) or fill it in with a real example — don't let placeholder content reach the stage.
3. **`s17c` (phase gates recap slide).** It restates what `guides-sensors` just showed, in one sentence, with no new information. Could be cut as a slide and folded into the spoken transition out of the `guides-sensors` scene instead — saves a slide transition, not real content.
4. **Section 3's `s7` list, items 6–7.** "Gating everything isn't the fix" and "large diffs bottleneck review" were added specifically to set up Section 5 and the reviewability beat. If either of those downstream sections gets cut, drop the matching setup bullet here too so it doesn't dangle.
5. **Do not cut:** `workspace-wrapper`, `input-collection-gate`, or `guides-sensors` — these are the concrete proof for Guides, Ask Before Deciding, and Sensors respectively, not decoration. `01-talk-outline.md`'s original guidance to protect the demos still applies.

---

## 1. Title + hook + agenda (0:00–1:30)

**Goal:** Everyone in the room has felt this. Open with the failure mode, not the solution.

**Hook (0:00–0:30):**

> "Show of hands — who's used an AI coding assistant that gave you code that *looked* perfect, compiled, read well... and was completely wrong for your codebase?"

Pause for hands. Land the reframe:

> "That's not a model problem. Model quality has basically stopped being the bottleneck. That's a **harness** problem — and today I want to show you what a harness actually is, and how to build one."

**Presenters (`s1b`):** introduce both speakers and their projects in one breath — brownfield multi-repo platform vs. greenfield agentic workflow tool — since the contrast is the reason this is a joint talk, not a scheduling accident.

**Agenda (`s3`):** state it in one breath — what a harness is, guides, sensors, make it reviewable. "Take this home" was cut from the agenda slide itself; the spoken line can still close on a Monday-morning-checklist promise without it needing its own bullet. "Make it reviewable" stays on the agenda even though it's not its own section anymore — it's still a distinct thing the audience will hear about, just inside Sensors now.

## 2. The core idea (1:30–5:00)

Land the definition verbatim, then run the `nested-layers` scene start to finish — do not rush the final beat:

> **Agent = Model + Harness.**
> The model provides intelligence. The harness makes it useful.

Walk the zoom through all three rings — prompt engineering (message level, "job description"), context engineering (session level, "briefing packet"), harness engineering (system level, "operating system") — then let it zoom back out to all three nested before the final pulse beat.

Key relationship to say out loud on that last beat — the thesis of the whole talk:

> "A prompt can request safety. Only the harness can enforce it."

## 3. The problem, generalized (5:00–9:00)

Don't tell one company's story — describe the *shape* of the problem, then make it concrete with one worked example.

Walk the 7-item list on `s7` (full text in `04-slide-outline.md`) — it's grown by two items since the original draft, specifically to set up Section 5 and the reviewability beat inside Section 6: "gating everything isn't the fix either" and "large AI-generated diffs turn review into the bottleneck."

Then run `workspace-wrapper`: three repos, one shared field, an agent that renames it in the repo it happens to land in, and two sibling repos that silently drift because nothing told them. Replay the same request with a shared workspace and a confirmation gate in place — all three update together. This is "planning misses cross-repo blast radius" made physical, not just asserted.

Land the root cause as a single sentence — the pivot into the rest of the talk:

> "AI is only as good as the context it gets **and** the feedback loops that correct it."

Then the two-layer transition (`s9`): "So we built two layers: Guides and Sensors." This is now the frame for the *entire* rest of the talk — the reviewability content in Section 6 no longer breaks it.

## 4. Layer 1 — Guides (9:00–13:00)

*Proposed: Jaya's section — all of this is ssi-ai-kit-flavored material.*

Guides steer the agent **before** it acts. Introduce the seven primitives as a table (`s11` — confirmation gates are the seventh, new since the original six), then narrate the ones that matter most for a live audience:

1. **Progressive disclosure** (`s12`) — don't load everything all the time. Scope instructions by file path so the agent only sees what's relevant to the files it's touching.
2. **Least privilege for agents** (`s13`) — a read-only Q&A agent literally cannot edit files. A planning agent can't push code. Restricting tools is a harness decision, not a prompt request.
3. **Gate only what's irreversible, default the rest** (`s13b`) — a confirmation gate on repo scope and cross-service changes; everything else resolves to a visible, explicit default instead of stopping the pipeline.

That third point is the bridge into Section 5 — consider saying so explicitly: "Here's what that actually looks like end to end, on a project built from scratch." *(Note: this idea repeats two more times later — Section 5 in full, and as principle #2 in `s21`. Decided: no added callback line drawing attention to the repetition — just let it land three times on its own.)*

## 5. Ask Before Deciding (13:00–15:30)

*Proposed: Prabina's section — this is the ai-workflows mirror of the Guides principle you just heard.*

This section didn't exist in the original talk plan — it replaced what was going to be a pre-recorded "Guides in action" demo clip with a live scene instead. Frame it explicitly as the same rule as `s13b`, applied before any codebase even exists: a structured intake, a blocking confirmation gate, and a skipped input that resolves to a visible default rather than a silent guess.

Run `input-collection-gate` (the `GreenfieldIntake` scene) — real, trimmed wording from `ai-workflows`'s `story-analysis-agent` skill, not invented dialogue. Watch for: the optional tech-doc field still gets *asked* even though it's optional; the human's "Skip" gets written down, not assumed; the gate is explicitly non-skippable; nothing downstream starts until it's confirmed.

Land it in one sentence: *"Same principle you just saw in Guides. Different codebase, built from nothing. Same rule."*

## 6. Layer 2 — Sensors, including "make it reviewable" (15:30–22:00)

*Proposed: shared — the two design rules and the reviewability beat are joint material, but the pipeline demo is Prabina's ai-workflows.*

This is now the biggest section in the talk (6:30) — it absorbed what used to be a separate section. Budget rehearsal time accordingly.

Sensors catch mistakes **after** the agent acts, and feed the failure back so the agent fixes itself. Say explicitly that this is the layer most teams skip entirely.

Two design rules, verbatim (`s17a`, `s17b`):

> **Silent success, verbose failure.** A sensor that passes produces zero output. A sensor that fails surfaces the exact error, so the agent can self-correct without a human in the loop.

> **Promote rules from docs into code.** If you keep writing the same instruction in prose and the agent keeps ignoring it, that's a signal to escalate it to a linter or a structural test.

Then run `guides-sensors` — the real `ai-workflows` 6-phase pipeline (ANALYZE → BLUEPRINT → RED → GREEN → REFACTOR → REVIEW) on one story spanning three repos (`storefront-web`, `checkout-bff`, `payments-service`). Two feedback loops actually fire in this one run: a human-confirm loop at BLUEPRINT (the Multi-Repo Confirmation Gate blocks until a person signs off on all 3 repos being touched) and an auto-fix loop at REVIEW (a coverage gap loops back to RED/GREEN with no human needed). Close with `s17c`: phase gates are "silent success, verbose failure" running as the actual pipeline, not just a design rule. *(`s17c` is a cut candidate if you're short on time — see the list above.)*

**Then, on a divider card that stays inside Section 6 — no new numbered section, just a visual separator for pacing (`s17d`):** "Make it reviewable" — "Sensors catch the mistake. Can a human still tell what happened?" Guides steer it, sensors catch it — but neither makes a 40-file diff reviewable.

`s20b`: both speakers admit the same gap in their own harness's own docs — "promote rules from docs into code" (Jaya, ssi-ai-kit) and "protect shared state with append-only contracts" (Prabina, ai-workflows) are both *named* principles with no enforcement built yet. This is a genuine, unscripted honesty beat — say so.

`s20c`: two external, citable numbers — PRs at scale regularly exceed 20 files/1,000+ lines with code volume up 30% (Salesforce Engineering, their own data), and 61% of agent-authored PRs get no recorded human review at all (sourced in `10-external-problems.md` §4). These are the only outside citations used anywhere in the deck — worth naming the sources out loud for credibility.

`s20d`: a structured change summary — a PR that ships with acceptance-criteria-to-test traceability, not just a diff. **Still placeholder rows — see cut candidate #2 above; fix or cut before this is stage-ready.**

## 7. Context rot — the open problem (22:00–26:30)

*Proposed: shared — the problem framing is joint; the two solution scenes each generalize one speaker's primitive (sub-agents, progressive disclosure).*

This section exists to keep the talk honest — you're not selling a finished product, you're describing an engineering discipline with real unsolved edges.

Run `context-rot-problem` — a real session's token budget filling up: a 70-token rule gets stated, then answering one question about it costs 54,000 tokens (a full spec-file read) plus another ~18,000 tokens of exploration, crossing the "40% = dumb zone" threshold well before a quick follow-up question arrives and gets lost in the noise. **The scene's own final beat already lands the line and previews both fixes** — there is no separate `s19` slide anymore; it was cut because it duplicated this exact caption verbatim:

> "Bigger context windows don't fix this — they just make the haystack bigger." Solution 1: sub-agents. Solution 2: progressive disclosure.

Then `context-rot-solution-1` — the identical exploration burst, replayed inside a sub-agent, returning a ~340-token summary instead of dumping everything into the main context. The scene computes the actual percentage saved live.

Then `progressive-disclosure` (`SpecSplitTree`) — the second worked example of the same primitive from `s12`. **Top cut candidate if you're short on time** — see the list above.

Close with the 3-row recap table (`s20`): long-horizon drift, stale specs, self-verification bias, each with a one-line mitigation.

## 8. Generalizing — 5 principles for any team (26:30–29:00)

This is the slide people photograph. `s21`, "merged from both projects":

1. **Earn every rule.** Every instruction should trace to a real past failure — hand-written, never auto-generated.
2. **Gate only the irreversible.** Human confirmation on decisions with real blast radius; a sensible default everywhere else.
3. **Ground the agent in what's real.** Structure in, structure out, and reuse before you create — the codebase, and confirmed inputs, win over guesswork.
4. **Sub-agents are single-purpose firewalls, not personas.** Isolate context or responsibility, return a condensed result.
5. **Treat the harness as software.** Version it, review it, refactor it when it drifts, and make what it produces auditable.

Principle 2 is the third full treatment of "gate the irreversible" in this deck (`s13b`, all of Section 5, here). Decided: no added commentary — let it land as its own repetition.

## 9. Self-score live + recap + close (29:00–30:00)

**Live bit — self-score the checklist (`s21b`):** Project the 5-question harness audit (identical wording to `06-audience-takeaway.md` — keep them in sync). Ask the room to silently score their own team 0–5 on their fingers, no mic needed. *"Who's at a 5?"* — pause, scan for hands. *"Who's at 0 or 1?"* — more hands, knowing laugh. Don't editorialize the result; let the room feel it, then move straight into the recap.

One breath recap: *"Model plus harness. Guides before, sensors after, and make what comes out the other end auditable. Two of us, two completely different codebases, and we converged on the same principles."*

Close on the line you want quoted (`s22`):

> **"You can't prompt your way to a reliable AI coding agent. You have to engineer the harness around it."**

Hand off: *"I've put a one-page checklist and today's slides at [link] — happy to go deeper in Q&A or after."* (`qrUrl` in `s22` is still unset — fill it in before Aug 14.)
