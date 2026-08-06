# Speaker Script — Draft Narration

This is a draft to rehearse from and make your own — not a script to read verbatim on stage. Say it in your own words once you've internalized the beats. Bracketed cues `[LIKE THIS]` are stage directions, not spoken text.

This draft mirrors `01-talk-outline.md`'s 9 sections, which mirror `visualizer/src/content/deck.ts`. **`[SUGGESTED SPEAKER: ...]` tags mark a proposed two-person split based on which project each section's content actually comes from** — per `11-collab-doc-draft.md` §7–8, who presents which section is still an open question. Confirm the real split with Prabina, then replace these tags with actual names and add real handoff lines (right now the prose underneath is written speaker-neutral so it reads fine either way until that's settled).

**Resolved since the last draft:** "Layer 3 — Make it reviewable" is no longer a standalone section — it's folded into Section 6 (Sensors) as a continuation, so the talk's "two layers" framing holds end to end. Section 6 is now the biggest block in the talk (6:30) — budget rehearsal time for it accordingly.

---

### 1. Hook + agenda — 0:00–1:30

`[WALK OUT / LIGHTS UP]`

"Show of hands — who's used an AI coding assistant that gave you code that *looked* perfect... read well, compiled clean... and was completely wrong for your codebase?"

`[pause, scan the room]`

"That's not a model problem anymore. Model quality basically stopped being the bottleneck a while ago. That's a **harness** problem. And today the two of us want to show you what a harness actually is, and how to build one — in a way that works no matter which AI tool you're using."

`[SLIDE: presenters — s1b]`

"[NAME] — [one line: brownfield, multi-repo platform]. [NAME] — [one line: greenfield, agentic workflow tool]. Same problem, opposite starting points. We didn't compare notes until after we'd both landed on the same fixes — that's most of why this is worth 30 minutes of your time instead of one blog post."

`[SLIDE: agenda — s3]`

"Here's where we're going: what a harness is, the two layers that make one actually work — guides and sensors — whether what's left is something a human can still review, and a checklist you can apply Monday morning."

---

### 2. The core idea — 1:30–5:00

`[SUGGESTED SPEAKER: shared/either — this is the joint mental model, not either project specifically]`

"Here's the one sentence we want you to leave with, if nothing else sticks:"

`[SCENE: nested-layers, beat 0 — title card]`

"**Agent equals Model plus Harness.** The model provides the intelligence. The harness is what makes that intelligence *useful* — reliable, correct, safe, in your specific system.

There are three layers here, nested inside each other."

`[SCENE: nested-layers, beat 1 — zoom to harness ring]`

"At the outermost layer, **harness engineering**, system level — think of it as the operating system. Orchestration, tool permissions, guardrails, retry loops, the whole lifecycle."

`[SCENE: nested-layers, beat 2 — zoom to context ring]`

"One layer in, **context engineering**, session level — think of it as the briefing packet. What information actually gets retrieved, summarized, remembered."

`[SCENE: nested-layers, beat 3 — zoom to prompt ring]`

"Innermost, **prompt engineering**, message level — think of it as the job description. Instructions, role, formatting, a few examples."

`[SCENE: nested-layers, beat 4 — zoom out, all three nested]`

"Three layers, nested — not three separate systems, one system with more or less reach."

`[SCENE: nested-layers, beat 5 — harness ring pulses. HOLD HERE for ~20 sec, this is the one diagram to not rush past]`

"And here's the relationship that matters most: a prompt can *ask* the model to be careful. Only the harness can actually *guarantee* it."

---

### 3. The problem, generalized — 5:00–9:00

`[SUGGESTED SPEAKER: shared — the 7-item list is generic; the workspace-wrapper demo is Jaya's material]`

"Let me describe a shape of problem — see if it sounds familiar.

`[SLIDE: s7, reveal sequentially]`

Everyone's local dev setup is slightly different and slightly broken — onboarding is tribal knowledge. Engineers work across repos in separate windows with no single view of the system. The AI assistant only sees the one file that's open, so it suggests the pattern it's seen most across the whole internet — not the pattern *your* team actually uses. It never checks its own work — it says 'done' whether the code lints or not. Planning misses cross-repo impact — a 'small' change quietly needs three more PRs nobody saw coming, or on a greenfield build, ships a cross-service change with nobody signing off at all. And it's not as simple as 'add more human checkpoints' either — gate every single step and you just trade silently-wrong output for a pipeline that never finishes. Meanwhile the diffs an agent produces are big and fast enough that review itself becomes the bottleneck — a human either misses something buried in a 40-file change, or just rubber-stamps it.

If any part of that sounded familiar — that's the point. Let me make one of those concrete."

`[SCENE: workspace-wrapper]`

"Three repos. One of them, `billing-service`, owns a field. Two others, `checkout`, `invoicing`, just read it. Watch what happens when an agent renames that field — with no shared harness in place."

`[run through the scene: agent renames the field in billing-service only, the other two silently drift]`

"Nobody told the other two repos anything changed. They're still reading a field that no longer means what they think it means — and nothing caught it. Now watch the same request, once these repos are wrapped in a shared workspace with a confirmation gate."

`[run the second half: shared analysis, blocking gate, all three update together]`

"Same request. Different harness. Nobody drifts.

Here's the root cause, in one sentence:"

`[SLIDE: s8]`

"AI tools are only as good as the context they receive **and** the feedback loops that correct them. Miss either one, and AI can generate plausible-looking code that confidently ignores your team's conventions — at scale.

`[SLIDE: s9]`

So we built two layers to fix this: **Guides**, and **Sensors**."

---

### 4. Layer 1 — Guides — 9:00–13:00

`[SUGGESTED SPEAKER: Jaya — ssi-ai-kit material]`

"Guides steer the agent *before* it acts. There are seven primitives now — one more than we started with — and I'll walk through the three that generalize the furthest."

`[SLIDE: s11 — seven primitives table, name them quickly, don't dwell]`

"First: **progressive disclosure**. Don't load everything, always. Scope your instructions by file path, so when someone opens a file in one part of the system, the agent only sees the rules relevant to *that* domain.

`[SLIDE: s12 bespoke — file-path match]`

Second: **least privilege for agents**. A read-only Q&A agent literally cannot edit a file — it doesn't have the tool. A planning agent can't push code. That's not a polite request in a prompt — it's a restriction enforced by the harness.

`[SLIDE: s13 bespoke — agent personas]`

Third — and this is new since we last talked about this in public: **gate only what's irreversible, and default everything else**.

`[SLIDE: s13b]`

A confirmation gate on repo scope, on cross-service changes — the decisions you genuinely can't cheaply undo. Everything else resolves to a visible, explicit default instead of stopping the whole pipeline to ask a human something low-stakes.

`[HANDOFF CUE]` That's the principle in the abstract. Let me show you what it looks like when there's no existing codebase to fall back on at all."

---

### 5. Ask Before Deciding — 13:00–15:30

`[SUGGESTED SPEAKER: Prabina — ai-workflows material]`

`[SLIDE: s14a]`

"Same rule you just heard — gate the irreversible, default the rest — applied before a single line of code exists, to constrain the agent from the very first message.

`[SCENE: input-collection-gate]`

This is real, trimmed wording from our own `story-analysis-agent` skill — not a script we wrote for this talk. Watch the order: a fixed intake sequence, not left to the agent's judgment."

`[run through: /story-analysis PROJ-123 → structured intake → optional tech-doc field still gets asked → human types "Skip" → blocking, non-skippable confirmation gate → confirm → skipped input resolves to a written default]`

"Notice what didn't happen: the agent didn't silently skip the optional field, and it didn't silently guess what to do when the human skipped it. It wrote down 'None — user confirmed no technical doc' and moved on. That's the difference between a default and a guess — one is visible and one isn't."

---

### 6. Layer 2 — Sensors, including "make it reviewable" — 15:30–22:00

`[SUGGESTED SPEAKER: shared — the two design rules are joint, the pipeline demo is Prabina's ai-workflows material]`

`[SLIDE: s15]`

"Guides get you most of the way. But guides alone can't catch every mistake — you also need **Sensors**: checks that run *after* the agent acts, and feed errors back so it self-corrects. This is the layer most teams skip entirely.

Two rules I'd put on a sticky note:"

`[SLIDE: s17a]`

"**Silent success, verbose failure.** A sensor that passes produces zero output — don't make a human read 'all good!' fifty times a day. A sensor that fails surfaces the *exact* error, so the agent can fix it without a person in the loop.

`[SLIDE: s17b]`

**Promote rules from docs into code.** If you keep writing the same instruction in prose and the agent keeps ignoring it — that's the signal to escalate it to a linter or a test. Prose is the starting point. Mechanical enforcement is the destination.

Let me show you both rules running as an actual pipeline, not just a design principle."

`[SCENE: guides-sensors — this is the longest scene in the deck, budget for it]`

"One story: let customers save a card and reuse it at checkout. It touches three repos — the storefront UI, the checkout BFF, and the payments domain service. Watch the whole thing run."

`[run through: ANALYZE (structured intake confirmed) → BLUEPRINT (Architect finds 3 repos, blocks on the Multi-Repo Confirmation Gate, a human approves) → RED (tests written, all fail — correct) → GREEN (implementation, tests pass) → REFACTOR (structure improves, tests re-run) → REVIEW (finds a coverage gap on AC-4 — no human needed, loops back to RED/GREEN automatically) → REVIEW again, clean → Outcome, PR opened]`

"Two different loops, closed two different ways, in the same run. A person confirmed the blast radius before any code was written — that's Guides. The agent found its own coverage gap and closed it without waiting for a human — that's Sensors. Only *then* does it stop, for a person, with a PR."

`[SLIDE: s17c]`

"Phase gates: an automatic pass/fail verdict before the next phase is even allowed to start. That's 'silent success, verbose failure' running as the actual pipeline you just watched, not just a slide."

`[SLIDE: s17d — divider card, "Make it reviewable." This is a visual separator for pacing, not a new numbered section — you're still inside Sensors]`

"One more honest gap, and this one we found independently, on two completely different codebases. Sensors catch the mistake. But can a human still tell what happened? Neither guides nor sensors makes a 40-file diff reviewable.

`[SLIDE: s20b]`

On my side" `[or: "on Jaya's side"]` "— `ssi-ai-kit`'s own docs say, in writing, 'promote rules from docs into code.' The flagship candidate for that — import and architecture boundaries — is still prose. Nobody built the linter yet.

On my side" `[or: "on Prabina's side"]` "— `ai-workflows`'s own roadmap says shared contracts should be append-only. Nothing currently stops an agent from silently rewriting one.

Neither of us knew the other had written down almost the same unfinished promise, in almost the same words, until we compared notes for this talk."

`[SLIDE: s20c]`

"And it's not just us. PRs at scale regularly exceed 20 files and a thousand lines — code volume is up 30% by Salesforce Engineering's own numbers. And across the industry, 61% of agent-authored pull requests get no recorded human review at all.

`[SLIDE: s20d]`

So: guides steer the agent, sensors catch its mistakes — but if what comes out the other end is a 40-file diff nobody can hold in their head, none of that matters. The fix we're both converging on: ship every change with a structured summary that traces the diff back to the acceptance criteria it satisfies — not just the diff itself."

---

### 7. Context rot — the open problem — 22:00–26:30

`[SUGGESTED SPEAKER: shared — problem framing is joint; sub-agents generalize Jaya's material, progressive disclosure is the same primitive from Section 4]`

`[SLIDE: divider-context-rot]`

"I want to be honest about something: this isn't a finished-product story, it's an ongoing engineering discipline. There's a real problem called **context rot** — reasoning quality degrades as context fills with noise. Let me show you what that actually looks like, before I tell you what it means."

`[SCENE: context-rot-problem — its own final beat lands the "haystack" line and previews both fixes; there's no separate slide for this anymore, it was a verbatim duplicate of this scene's own last caption]`

"One rule, stated once, early: never store tokens in localStorage, always use httpOnly cookies. Seventy tokens. Now watch what it costs to act on that rule later in the same session."

`[run through: a question about the rule triggers a full 6,000-line spec read, 54,000 tokens, then more exploration piles on — grep, file reads, a test run — crossing the 40% 'dumb zone' threshold]`

"By the time a quick follow-up shows up — 'add the httpOnly cookie thing we discussed' — that seventy-token rule is buried under tens of thousands of tokens of exploration."

`[the scene's last beat says it for you: "Bigger context windows don't fix this — they just make the haystack bigger." Two fixes, next.]`

"Same session. Now watch the fix."

`[SCENE: context-rot-solution-1]`

"Same session, replayed. That entire exploration burst — the grep, the file reads, the test run — now happens inside a sub-agent instead of the main conversation."

`[run through: sub-agent returns a ~340-token summary instead of dumping everything in]`

"That's not a persona. That's a context firewall — it does the work, and hands back a condensed answer instead of the raw mess."

`[SCENE: progressive-disclosure]`

"Same idea you saw in Guides — progressive disclosure — applied to a much bigger problem. A 6,000-line policy document, split into an index tree instead of one monolith. Watch one real task walk it."

`[run through: task traverses 5 files down one branch, two sibling branches and one deeper file never touched]`

"The tree doesn't force loading anything the task doesn't need — not one hop short, not one hop past.

`[SLIDE: s20]`

Three failure modes worth knowing: sessions drift the longer they run. Specs your agent trusts drift away from what the code actually does. And agents are *optimistic* about their own work — which is exactly why sensors have to override self-assessment, not just supplement it."

---

### 8. Generalizing — 26:30–29:00

`[SUGGESTED SPEAKER: shared close]`

"So — strip away the specifics, what actually transfers to *your* team, whatever you're building, whatever tool you use?"

`[SLIDE: s21 — this is the photo-op slide, give it a beat]`

"One. **Earn every rule.** Trace it to a real past failure, write it by hand — auto-generated rules measurably hurt output quality.

Two. **Gate only the irreversible.** Human confirmation on the decisions with real blast radius. A sensible default everywhere else — you saw this twice already, in Guides and in Ask Before Deciding, because it's the one we'd both put at the top of our own list independently.

Three. **Ground the agent in what's real.** Structure in, structure out. Reuse before you create. The codebase — and confirmed inputs — win over guesswork.

Four. **Sub-agents are single-purpose firewalls, not personas.** Isolate context or responsibility, hand back a condensed result.

Five. **Treat the harness as software.** Version it. Review it in pull requests. Refactor it when it drifts. And make what it produces auditable — a rule that rots exactly like a stale test if nobody revisits it."

---

### 9. Self-score live + recap + close — 29:00–30:00

`[SLIDE: s21b — 5-question harness audit checklist]`

"Before we close — quick gut check, no mic needed. Score your own team, right now, zero to five, on your fingers, on this checklist.

`[pause ~5 sec, let people actually do it]`

Who's at a five?"

`[scan the room — there will be almost no hands; let that silence sit for a beat, don't fill it]`

"Who's at a zero or a one?"

`[more hands, likely a knowing laugh — don't editorialize, just nod and move on]`

"Model plus harness. Guides before it acts, sensors after, and make what comes out the other end auditable. Two of us, two completely different codebases — and we converged on the same principles without comparing notes until it was almost too late to put this talk together.

`[SLIDE: s22 — closing quote]`

"You can't prompt your way to a reliable AI coding agent. You have to engineer the harness around it.

We've put a one-page checklist and today's slides at this link — happy to go deeper in Q&A, or grab either of us after. Thank you."

`[hold for applause, transition to Q&A]`
