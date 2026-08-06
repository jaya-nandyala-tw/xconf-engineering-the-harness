# Slide Outline — "Engineering the Harness"

This mirrors `visualizer/src/content/deck.ts` exactly — every row below is one `DeckItem`, in array order, using its real `id`. If you change the deck, update this table in the same commit; if you change this table, that's a proposal for `deck.ts`, not yet reality.

Two kinds of rows:
- **Static** — a slide rendered by `SlidePlayer`/`SlideBody` from data (`slideKind` in the table).
- **Interactive** — a routed React scene (`visualizer/src/scenes/*.tsx`), driven live, beat-by-beat, with ←/→.

**Resolved:** the deck used to have a standalone "Layer 3 — Make it reviewable" section, which contradicted the "two layers: Guides and Sensors" framing stated in the hook, agenda, and `nested-layers` scene. Decision: fold it into Sensors as a continuation, not a third co-equal layer — see `s17d` below. There are now 9 sections, not 10.

| id | Section | Kind | Slide content | Notes |
|---|---|---|---|---|
| `s1` | 1 — Title + hook + agenda | cover | "Engineering the Harness" / "Making AI Coding Agents Actually Reliable" | Full-bleed title. True cold open — no confession-wall montage. |
| `s1b` | 1 | presenters | Both speakers' name, title, bio, photo | Two-person deck. Which sections each speaker presents is still unresolved — flagged for Prabina, see `01-talk-outline.md`. |
| `s2` | 1 | statement | "Who's had an AI assistant confidently ignore every convention on their team?" | Hook question. |
| `s3` | 1 | agenda (sequential) | 4 beats: What a harness is → Guides → Sensors → Make it reviewable | "Take this home" was cut. "Make it reviewable" stays on the agenda as its own bullet even though it's no longer its own numbered section — it's still a distinct beat the audience will get, just delivered inside Sensors. "Ask Before Deciding" and "Context rot" remain unpreviewed by design. |
| `nested-layers` | 2 — The core idea | interactive `/nested-layers` | 6-beat zoom-through diagram: title card ("Agent = Model + Harness") → harness ring → context ring → prompt ring → all three nested → harness ring pulses on the "request vs. enforce" line | Covers the old static S4/S5/S6 slides in one continuous scene — hold on the final pulse beat. |
| `divider-problem` | 3 — The problem, generalized | divider | "The problem, generalized" / "Not one team's mess — the shape any multi-repo (or multi-service) codebase runs into." | Turmeric accent. |
| `s7` | 3 | list (sequential) | 7-item "shape of the problem" checklist (see below) | Grew from 5 items to 7 — now includes "gating everything isn't the fix either" and "large AI-generated diffs turn review into the bottleneck," which seed sections 5 and the reviewability beat inside Section 6. |
| `workspace-wrapper` | 3 | interactive `/workspace-wrapper` | Cross-repo blast radius demo: 3 repos (billing-service owns a `pct` field, checkout-service and invoicing-service consume it) → an agent renames the field in billing only → the other two silently drift → same request replayed inside a shared wrapper (`ai-kit`) with a confirmation gate → all three update together | Concrete, worked example of "planning misses cross-repo blast radius" from `s7`. |
| `s8` | 3 | statement (highlightPlus) | "AI is only as good as the context it gets + the feedback loops that correct it." | Root cause, one sentence. |
| `s9` | 3 | two-column | Before: "One prompt, hoping the model guesses your conventions right." / After: "Guides steer it before it acts. Sensors catch it after." | Transition into the two-layer frame — now the *only* frame the talk uses, end to end. |
| `s10` | 4 — Layer 1: Guides | statement | "Guides steer the agent before it acts." | |
| `s11` | 4 | table | **Seven** primitives: global instructions, scoped instructions, agents, skills, prompts, specs, **confirmation gates** | |
| `s12` | 4 | bespoke (`SlideFilePathMatch`) | "Progressive disclosure — load only what's relevant to the 5 files being touched." | |
| `s13` | 4 | bespoke (`SlideAgentPersonas`) | "Least privilege — a read-only agent literally cannot edit files." | |
| `s13b` | 4 | statement | "Gate only what's irreversible. Default everything else." — confirmation gate on repo scope / cross-service changes, visible defaults elsewhere | `icon: "lock"`. Same idea gets a full concrete demo in Section 5, and reappears as principle #2 in `s21`. Decision: leave the repetition as-is, no added callback line — see `01-talk-outline.md`. The repeated `lock` icon on this slide, `s14a`, and `s17c` is a deliberate silent callback tying the three together visually. |
| `s14a` | 5 — Ask Before Deciding | statement | "Ask Before Deciding" — "Guide with input gates. A structured intake, a blocking gate, a visible default — applied before any codebase exists to constrain the agent." | `icon: "lock"` — same glyph as `s13b`, on purpose. `ai-workflows` (Prabina's) concrete mirror of `s13b`'s principle, on a greenfield project instead of a brownfield one. |
| `s14b` | 5 | interactive `/input-collection-gate` | `GreenfieldIntake` scene: `/story-analysis PROJ-123` → structured intake (Jira required, tech doc optional) → agent asks for the optional doc anyway → human types "Skip" → blocking confirmation gate ("Confirm? (non-skippable)") → human confirms → skipped input resolves to a written default ("None — user confirmed no technical doc") | Real, trimmed wording from `ai-workflows`'s `story-analysis-agent` skill, not invented dialogue. 9 beats, chat-log style, auto-scrolling. |
| `s15` | 6 — Layer 2: Sensors | statement | "Sensors catch mistakes after the agent acts, and feed the error back." | |
| `guides-sensors` | 6 | interactive `/guides-sensors` | `GuidesSensorsPipeline`: one story ("let customers save a card and reuse it at checkout," spanning `storefront-web` / `checkout-bff` / `payments-service`) run through the real `ai-workflows` 6-phase pipeline — ANALYZE → BLUEPRINT (blocked on the Multi-Repo Confirmation Gate, a human approves 3 repos) → RED → GREEN → REFACTOR → REVIEW (finds a coverage gap, loops back to RED/GREEN on its own, no human) → Outcome (PR opened) | ANALYZE/BLUEPRINT are the Guides half, RED/GREEN/REFACTOR/REVIEW are the Sensors half; both feedback loops (human-confirm and auto-fix) occur inside the one story. ~15 beats — the longest scene in the deck. |
| `s17a` | 6 | statement | "Silent success, verbose failure." | `icon: "check"` — new glyph added to `Icon.tsx` for this slide (a checkmark in a circle, distinct from `checklist`'s task-list glyph). |
| `s17b` | 6 | statement | "Promote rules from docs into code." | `icon: "code"` — new glyph added to `Icon.tsx` for this slide (a `</>` bracket mark). |
| `s17c` | 6 | statement | "Phase gates — an automatic pass/fail verdict before the next phase is even allowed to start." RED→GREEN→REFACTOR→REVIEW as "silent success, verbose failure" running as the actual pipeline | `icon: "lock"` — same glyph as `s13b`/`s14a`, completing the 3-way visual thread across the deck's three "gate the irreversible" moments. Recaps what `guides-sensors` just showed, in one sentence. |
| `s17d` | 6 | divider | "Make it reviewable" — "Sensors catch the mistake. Can a human still tell what happened? Two of us hit the same gap, on two different codebases." | Still a `divider` visually (chapter-card treatment, for pacing), but `section: 6` — same `SECTIONS` entry as the rest of Sensors, not a new numbered chapter. Accent is `jade`, matching Section 6's own cycled color, not a fresh accent — deliberately reads as a beat within Sensors, not a new top-level section the way `divider-problem`/`divider-context-rot` do. |
| `s20b` | 6 | two-column | "Two teams, same shape of gap" — Jaya's side (ssi-ai-kit): "promote rules from docs into code" stated but the flagship linter never built · Prabina's side (ai-workflows): "append-only shared contracts" named but unenforced | Both speakers' own honesty-beat admissions, side by side. |
| `s20c` | 6 | two-column | "The reviewer's problem" — PRs regularly exceed 20 files/1,000+ lines, code volume up 30% (Salesforce Engineering) · 61% of agent-authored PRs get no recorded human review (industry study, sourced in `10-external-problems.md` §4) | External, citable numbers — the only outside citations used anywhere in the deck. |
| `s20d` | 6 | table | "Structured change summary — not just a diff" — acceptance criterion / test / result rows | Rows are still literally `"AC-1: ..."` / `"test_..."` placeholders — needs a real filled-in example before this is stage-ready. |
| `divider-context-rot` | 7 — Context rot | divider | "Context rot — the open problem" / "Guides and sensors both still run inside a context window. Now, the honest part." | Turmeric accent. |
| `context-rot-problem` | 7 | interactive `/context-rot-problem` | Token-budget bar filling up over a real session: system prompt + tool defs + repo rule (pinned, ~1.8%) → a 70-token rule stated → 54,000 tokens spent re-reading a 6,000-line spec file to answer one question about that rule → more exploration (grep, file reads, test runs) piles on → crosses the "40% = dumb zone" threshold → a quick follow-up ("add the httpOnly cookie thing we discussed") now competes with tens of thousands of buried tokens → **final beat's own caption:** "Bigger context windows don't fix this — they just make the haystack bigger." + a preview of both solution scenes | The standalone `s19` statement slide that used to carry this exact line was cut — it duplicated this scene's own final beat verbatim. `coversSlides: ["S19", "S20"]` on this entry already documented the overlap; the standalone slide was the redundant copy, not the scene. |
| `context-rot-solution-1` | 7 | interactive `/context-rot-solution-1` | Same session, replayed: the exploration burst (grep + 4 file reads + test run, ~44K tokens) now happens inside a sub-agent, which returns a ~340-token summary ("httpOnly cookies already implemented — reuse `setAuthCookie()`") instead of dumping everything into the main context | Sub-agents as context firewalls, with a real before/after token count. |
| `progressive-disclosure` | 7 | interactive `/progressive-disclosure` | `SpecSplitTree`: a 6,000-line monolithic `business-workflows.md` vs. the same content split into a 6-level index tree — one task ("what's the SLA exception policy for a stuck approval?") traverses only 5 of those files and stops, never touching sibling branches or the one file deeper than it needs | Second, independent illustration of progressive disclosure — same primitive as `s12`, applied to the context-rot problem. |
| `s20` | 7 | table | 3 context-rot failure modes + one-line mitigations: long-horizon drift, stale specs, self-verification bias | |
| `s21` | 8 — 5 principles | list (sequential, numbered) | 5 principles "merged from both projects": earn every rule · gate only the irreversible · ground the agent in what's real · sub-agents as firewalls · treat the harness as software (and make it auditable) | Principle #2 is the third full treatment of "gate the irreversible" in this deck (`s13b`, all of Section 5, here). Decided: leave as-is, no added commentary. |
| `s21b` | 9 — Self-score + recap + close | list (static — do not add `revealMode: "sequential"`) | 5-question self-audit, identical wording to `06-audience-takeaway.md` | Confirmed in sync with the takeaway doc — keep it that way if either changes. |
| `s22` | 9 | close | Quote: "You can't prompt your way to a reliable AI coding agent. You have to engineer the harness around it." Recap: "Model plus harness. Guides before, sensors after, and make what comes out the other end auditable. Two of us, two completely different codebases, and we converged on the same principles." | `icon: "flag"` — `CloseContent`/`SlideClose` were extended with an optional `icon` field to support this; `flag` was previously only used on the agenda's now-cut "Take this home" bullet, so this reuses it rather than leaving it dead. `qrUrl` is still `undefined` — fill in the takeaway-doc link before Aug 14. |

---

## The 7-item "shape of the problem" list (`s7`)

1. Local dev setup differs per engineer, per repo — onboarding is tribal knowledge.
2. Engineers work across many repos in separate windows — no single view of the system.
3. The AI assistant only sees the one open file — it suggests the internet's pattern, not your team's.
4. The AI never checks its own work — it says "done" whether or not it lints, type-checks, or passes tests.
5. Planning misses cross-repo blast radius — a "small" change quietly needs three more PRs elsewhere, or, on a greenfield build, ships a cross-service change with no sign-off at all.
6. Gating everything isn't the fix either — a pipeline that stops for a human at every step just trades silent wrong changes for nothing finishing.
7. Large, fast AI-generated diffs turn review into the bottleneck — a human misses something buried in a 40-file change, or rubber-stamps it.

Items 6 and 7 exist specifically to set up Section 5 and the reviewability beat inside Section 6.

---

## What each interactive scene actually shows (for rehearsal, not for a slide designer — these are live, built React routes)

### `nested-layers` — replaces the old static S5/S6 nested-box diagram

The three layers are concentric rings, not nested rectangles. The "camera" zooms into whichever ring is focused:

```
Beat 0: title card, no diagram — "Agent = Model + Harness."
Beat 1: zoom to outer ring  — Harness Engineering (system) — orchestration, tool permissions, guardrails, retry loops
Beat 2: zoom to middle ring — Context Engineering (session) — retrieval, memory, summarization
Beat 3: zoom to inner ring  — Prompt Engineering (message) — instructions, role, examples
Beat 4: zoom out — all three visible at once, none emphasized — "not separate systems, one with more or less reach"
Beat 5: harness ring pulses — "A prompt can REQUEST safety. Only the harness can ENFORCE it."
```

Hold beat 5 — it's the one thing you want the room to remember from this scene.

### `guides-sensors` — the ai-workflows 6-phase pipeline, one story end to end

```
 GUIDES (before)                        SENSORS (after — one phase gate each)
 ┌─────────┐   ┌───────────┐            ┌─────┐   ┌───────┐   ┌──────────┐   ┌────────┐
 │ ANALYZE │──▶│ BLUEPRINT │──────────▶ │ RED │──▶│ GREEN │──▶│ REFACTOR │──▶│ REVIEW │──▶ Outcome
 └─────────┘   └───────────┘            └─────┘   └───────┘   └──────────┘   └────┬───┘
                     ▲  Multi-Repo Confirmation        ▲                          │
                     │  Gate — blocks on a human            coverage gap found ───┘
                     └── (human-confirm loop)               ── loops back, no human needed (auto-fix loop)
```

Story: "Let customers save a card and reuse it at checkout," spanning `storefront-web` (UI), `checkout-bff` (BFF), `payments-service` (domain). Both feedback loops actually fire in this one run: BLUEPRINT blocks until a human confirms all 3 repos are affected; REVIEW finds a missing test for AC-4 (graceful decline when `payments-service` is unreachable), and RED/GREEN/REVIEW re-run automatically with no human — closing two different kinds of loop two different ways is the point of the scene.

### `context-rot-problem` → `context-rot-solution-1` — a matched pair, watch them back to back

Same session, same 70-token rule ("never store tokens in localStorage — always httpOnly cookies"), same eventual follow-up question. In the Problem scene, answering a question about that rule costs 54,000 tokens (a full 6,000-line spec read) plus another ~18,000 tokens of exploration (grep, file reads, a test run) — crossing the 40%-of-window "dumb zone" threshold well before the follow-up question ever arrives. In the Solution scene, the same exploration burst runs inside a sub-agent and returns a ~340-token summary instead — the scene computes and displays the actual percentage saved.

### `progressive-disclosure` (`SpecSplitTree`) — the same primitive as `s12`, second worked example

A 6,000-line monolithic policy doc vs. a 6-level index tree. One concrete task ("what's the SLA exception policy for a stuck approval?") walks exactly 5 files down one branch and stops — two sibling top-level branches (asset provisioning, vendor management) and one file deeper (`sla-exception-appeals.md`) are visibly never touched. The scene computes the savings percentage live.

### `workspace-wrapper` — cross-repo blast radius, with and without a gate

3 repos, one shared field (`pct`) owned by `billing-service`, consumed by `checkout-service` and `invoicing-service`. Run once with no shared harness: the agent renames the field in `billing-service` only, the other two silently drift (shown as a red "drift" state). Run again with the repos wrapped in a shared `ai-kit` workspace plus a confirmation gate: the same request triggers one shared analysis, a blocking gate ("a confirmation gate before the agent touches a single file"), and — once a human approves — all three repos update together.

### `input-collection-gate` (`GreenfieldIntake`) — Prabina's mirror of Guides

A chat-log-style scene using real, trimmed wording from `ai-workflows`'s `story-analysis-agent` skill: fixed-order structured intake → an optional field still gets *asked*, never silently skipped → the human's "Skip" gets recorded, not guessed at → a blocking, non-skippable confirmation gate → only after confirmation does anything downstream start → the skipped input resolves to a visible written default, not silence.

---

## Framing decisions already made (kept here for context, not as open questions)

1. **"Two layers," not three.** Resolved: "Make it reviewable" is folded into Sensors (`s17d`, `s20b`, `s20c`, `s20d`) rather than introduced as a standalone third layer. The title, hook, agenda, and `nested-layers` scene's "two layers" framing now holds for the whole talk.
2. **Confirmation gates, said three times.** `s13b` (Guides), all of Section 5 (Ask Before Deciding), and `s21` principle #2 all state the same "gate the irreversible, default the rest" idea. Decided: leave as-is, no added callback line calling attention to the repetition.

## Still-open question

**Timing.** The deck has ~2x the content the original 30-minute plan assumed (7 live scenes + ~28 static slides vs. 2 clips + ~22 slides). Decided: cut before the Aug 13 dry run rather than rehearse-then-cut — but *what* to cut hasn't been chosen yet. See `01-talk-outline.md`'s cut-candidates list.

## Design notes

- **Font size floor:** body text no smaller than what's readable from row 30 of a 400-seat room — when in doubt, cut words, don't shrink font. Applies to the static slides; the interactive scenes' captions were built at a comparable size — recheck live at the Aug 13 dry run, not just on a laptop screen.
- **One idea per slide.** If a slide needs a build/reveal to make sense, that's fine — better than cramming two ideas onto one slide.
- **Color/contrast:** confirm slides read on the venue's actual projector during the Aug 13 dry run — projected color often washes out darker palettes.
- **Live scenes are live.** Every interactive scene above is a routed React page, driven with ←/→ during the talk, not embedded video — there is no pre-rendered fallback if a scene fails to load on the venue laptop. See `03-demo-recording-script.md` for what to do if one breaks on stage.
