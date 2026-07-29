# Speaker Script — Draft Narration

This is a draft to rehearse from and make your own — not a script to read verbatim on stage. Say it in your own words once you've internalized the beats. Bracketed cues `[LIKE THIS]` are stage directions, not spoken text.

---

### 1. Confession-wall montage + hook + agenda — 0:00–1:30

`[LIGHTS DOWN / SLIDE: confession-wall montage plays — silent text-crawl, 3–4 anonymized one-line AI-coding-disaster confessions, ~20 sec, no narration — you are not on stage yet]`

`[walk out as the montage ends]`

"...and yes. One of those was mine."

`[pause for the laugh/wince — don't rush past it]`

"Show of hands — who's used an AI coding assistant that gave you code that *looked* perfect... read well, compiled clean... and was completely wrong for your codebase?"

`[pause, scan the room]`

"That's not a model problem anymore. Model quality basically stopped being the bottleneck a while ago. That's a **harness** problem. And today I want to show you what a harness actually is, and how to build one — in a way that works no matter which AI tool you're using.

Here's where we're going: what a harness is, the two layers that make one actually work, two short clips of it running for real, and a checklist you can apply Monday morning."

---

### 2. The core idea — 1:30–5:00

"Here's the one sentence I want you to leave with, if nothing else sticks:"

`[SLIDE: Agent = Model + Harness]`

"**Agent equals Model plus Harness.** The model provides the intelligence. The harness is what makes that intelligence *useful* — reliable, correct, safe, in your specific system.

There are three layers here, nested inside each other."

`[SLIDE: nested diagram, hold for ~20 sec]`

"At the message level, there's **prompt engineering** — think of it as the job description. Instructions, role, formatting, a few examples.

Wrap that in **context engineering**, at the session level — think of it as the briefing packet. What information actually gets retrieved, summarized, remembered.

And wrap *that* in **harness engineering**, at the system level — think of it as the operating system. Orchestration, tool permissions, guardrails, retry loops, the whole lifecycle.

And here's the relationship that matters most:"

`[SLIDE: "A prompt can REQUEST safety. Only the harness can ENFORCE it."]`

"A prompt can *ask* the model to be careful. Only the harness can actually *guarantee* it."

---

### 3. The problem, generalized — 5:00–9:00

"Let me describe a shape of problem — see if it sounds familiar.

A platform with dozens of repos. A team that's not huge. Before any of this: everyone's local dev setup is slightly different and slightly broken. Engineers work across repos in separate windows with no single view of the system. The AI assistant only sees the one file that's open, so it suggests the pattern it's seen most across the whole internet — not the pattern *your* team actually uses. It never checks its own work — it says 'done' whether the code lints or not. And planning misses cross-repo impact — a 'small' change quietly needs two more PRs nobody saw coming.

If any part of that sounded familiar — that's the point. This isn't one team's story, it's what happens to *any* multi-repo codebase without a harness.

Here's the root cause, in one sentence:"

`[SLIDE: root cause]`

"AI tools are only as good as the context they receive **and** the feedback loops that correct them. Miss either one, and AI can generate plausible-looking code that confidently ignores your team's conventions — at scale.

So we built two layers to fix this: **Guides**, and **Sensors**."

---

### 4. Layer 1 — Guides — 9:00–13:00

"Guides steer the agent *before* it acts. There are six primitives, and I'll walk through the two that generalize the furthest."

`[SLIDE: six primitives table — name them quickly, don't dwell]`

"First idea: **progressive disclosure**. Don't load everything, always. Scope your instructions by file path, so when someone opens a file in one part of the system, the agent only sees the rules relevant to *that* domain — not the noise from thirty other repos.

Second idea: **least privilege for agents**. A read-only Q&A agent literally cannot edit a file — it doesn't have the tool. A planning agent can't push code. That's not a polite request in a prompt — it's a restriction enforced by the harness. That distinction matters more than almost anything else in this talk."

---

### 5. Demo clip 1 — 13:00–16:00

"Let me show you, not tell you. Watch what happens to the *exact same request*, once with no scoped context, and once with it."

`[PLAY CLIP 1 — muted, narrate live over it per 03-demo-recording-script.md]`

"Same model. Same prompt. Different harness. Different — correct — output."

---

### 6. Layer 2 — Sensors — 16:00–20:00

"Guides get you most of the way. But guides alone can't catch every mistake — you also need **Sensors**: checks that run *after* the agent acts, and feed errors back so it self-corrects. This is the layer most teams skip entirely.

Two rules I'd put on a sticky note:"

`[SLIDE: two quotes]`

"**Silent success, verbose failure.** A sensor that passes produces zero output — don't make a human read 'all good!' fifty times a day. A sensor that fails surfaces the *exact* error, so the agent can fix it without a person in the loop.

**Promote rules from docs into code.** If you keep writing the same instruction in prose and the agent keeps ignoring it — that's the signal to escalate it to a linter or a test. Prose is the starting point. Mechanical enforcement is the destination."

---

### 7. Demo clip 2 — 20:00–23:00

"Now watch the agent make a mistake — and catch it itself, before any human ever sees it."

`[PLAY CLIP 2 — muted, narrate live over it per 03-demo-recording-script.md]`

"Nobody reviewed that. The sensor did. And the agent fixed it in the same turn."

---

### 8. Context rot — 23:00–26:00

"I want to be honest about something: this isn't a finished product story, it's an ongoing engineering discipline. There's a real problem called **context rot** — reasoning quality degrades as context fills with noise. And a bigger context window doesn't fix it. It just makes the haystack bigger.

Three failure modes worth knowing: sessions drift the longer they run. Specs your agent trusts drift away from what the code actually does. And agents are *optimistic* about their own work — which is exactly why sensors have to override self-assessment, not just supplement it.

The mitigation pattern, in general terms: scoped, persistent memory instead of one giant growing conversation. Refreshing your knowledge base based on what changed in the code, not on a calendar."

---

### 9. Generalizing — 26:00–28:30

"So — strip away the specifics, what actually transfers to *your* team, whatever you're building, whatever tool you use?"

`[SLIDE: 5 principles — this is the photo-op slide, give it a beat]`

"One. **Earn every rule.** Trace it to a real past failure, write it by hand — auto-generated rules measurably hurt output quality.

Two. **The codebase wins.** When a guideline and the actual code disagree, the agent follows the code. The code is the source of truth, not the doc.

Three. **Structure in, structure out.** Real file paths and real symbol names in — correct code out. Vague prompts get vague, or wrong, code.

Four. **Sub-agents are context firewalls, not personas.** Use them to isolate context and hand back a condensed answer — not to role-play a character.

Five. **Treat the harness as software.** Version it. Review it in pull requests. Refactor it when it drifts. A stale prompt rots exactly like a stale test."

---

### 10. Self-score live + recap + close — 28:30–30:00

`[SLIDE: 5-question harness audit checklist]`

"Before I close — quick gut check, no mic needed. Score your own team, right now, zero to five, on your fingers, on this checklist.

`[pause ~5 sec, let people actually do it]`

Who's at a five?"

`[scan the room — there will be almost no hands; let that silence sit for a beat, don't fill it]`

"Who's at a zero or a one?"

`[more hands, likely a knowing laugh — don't editorialize, just nod and move on]`

"So — model plus harness. Guides before it acts, sensors after. Treat both like software, not like a one-time setup.

`[SLIDE: closing quote]`

"You can't prompt your way to a reliable AI coding agent. You have to engineer the harness around it.

I've put a one-page checklist and today's slides at this link — happy to go deeper in Q&A, or grab me after. Thank you."

`[hold for applause, transition to Q&A]`
