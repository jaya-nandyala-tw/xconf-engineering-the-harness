# Talk Outline — "Engineering the Harness" (30 min)

Run-of-show for a 400+ person audience. Timings are cumulative — if you're behind at a checkpoint, cut from **Section 6 (context rot)** first; it's the most cuttable without breaking the arc. Never cut the demos — they're the proof, not decoration.

| # | Time | Section | Goal | Slide ref | Demo? |
|---|---|---|---|---|---|
| 1 | 0:00–1:30 | Confession-wall montage + hook + agenda | Get a physical reaction (nod/laugh) from the room; state the promise | S1a–S3 | – |
| 2 | 1:30–5:00 | The core idea | Land "Agent = Model + Harness" and the 3-layer hierarchy as the mental model for the whole talk | S4–S6 | – |
| 3 | 5:00–9:00 | The problem, generalized | Make the pain recognizable to *any* multi-repo team, not just yours | S7–S9 | – |
| 4 | 9:00–13:00 | Layer 1 — Guides | Explain the six primitives that steer an agent *before* it acts | S10–S13 | – |
| 5 | 13:00–16:00 | **Demo clip 1** | Show guides changing agent output from generic-plausible to codebase-correct | S14 | ✅ Clip 1 |
| 6 | 16:00–20:00 | Layer 2 — Sensors | Explain the feedback loop that makes an agent self-correct *after* it acts | S15–S17 | – |
| 7 | 20:00–23:00 | **Demo clip 2** | Show a sensor catching a mistake and the agent fixing it without a human | S18 | ✅ Clip 2 |
| 8 | 23:00–26:00 | Context rot — the gap nobody mentions | Credibility beat: this isn't a solved-problem victory lap, it's ongoing engineering | S19–S20 | – |
| 9 | 26:00–28:30 | Generalizing — 5 principles for any team | The actionable takeaway — what to do Monday morning | S21–S22 | – |
| 10 | 28:30–30:00 | Self-score live + recap + close | Interactive gut-check on the checklist, then land the one sentence you want remembered; hand off to Q&A | S21b, S23 | – |

---

## 1. Confession-wall montage + hook + agenda (0:00–1:30)

**Goal:** Everyone in the room has felt this. Open with the failure mode, not the solution — and open cold, before you've said a word.

**Confession-wall montage (0:00–0:20):** As the lights settle and before you speak, run a silent, fast text-crawl of 3–4 anonymized one-line AI-coding-disaster confessions, collected from colleagues ahead of time (see `03-demo-recording-script.md` for collection + format). No narration, no music needed — let the room read and react on its own. This is the true cold open; you haven't taken the mic yet.

**Your own confession (0:20–0:30):** Walk out as the montage ends and land, without preamble:

> "...and yes. One of those was mine."

Let that get its laugh/wince before you continue.

**Hook (0:30–1:00):**

> "Show of hands — who's used an AI coding assistant that gave you code that *looked* perfect, compiled, read well... and was completely wrong for your codebase?"

Pause for hands. Land the reframe:

> "That's not a model problem. Model quality has basically stopped being the bottleneck. That's a **harness** problem — and today I want to show you what a harness actually is, and how to build one."

**Agenda (1:00–1:30):** State it in one breath — what a harness is, the two layers that make one work (guides and sensors), two short clips of it running, and a checklist you can apply regardless of which AI tool you use.

## 2. The core idea (1:30–5:00)

Land the definition on a slide, verbatim, and pause on it:

> **Agent = Model + Harness.**
> The model provides intelligence. The harness makes it useful.

Then the 3-layer hierarchy (see `04-slide-outline.md` for the diagram):

- **Prompt engineering** (message level) — the job description. Instructions, role, formatting, examples.
- **Context engineering** (session level) — the briefing packet. What information loads, what gets summarized, what's remembered.
- **Harness engineering** (system level) — the operating system. Orchestration, tool permissions, guardrails, retry loops, lifecycle.

Key relationship to say out loud: *"A prompt can request safety. Only the harness can enforce it."* That line is the thesis of the whole talk — write it on the slide too.

## 3. The problem, generalized (5:00–9:00)

Don't tell your specific story — describe the *shape* of the problem so anyone with more than a couple of repos recognizes it immediately:

- Local dev setup differs per engineer, per repo — nobody's environment is the same, onboarding is tribal knowledge.
- Engineers work across many repos in separate windows — no single view of the system, constant context-switching.
- The AI assistant only sees the one open file/repo — it suggests the pattern it's seen most on the internet, not the pattern your team actually uses.
- The AI never checks its own work — it says "done" whether or not the code lints, type-checks, or passes tests.
- Planning misses cross-repo blast radius — a "small" change in one repo quietly requires three more PRs elsewhere that nobody surfaces until later.

Land the root cause as a single sentence — this is the pivot into the rest of the talk:

> "AI tools are only as good as the context they receive **and** the feedback loops that correct them. Without both, an AI can generate plausible-looking code that confidently ignores your team's conventions — at scale."

## 4. Layer 1 — Guides (9:00–13:00)

Guides steer the agent **before** it acts. Introduce the six primitives as a table (slide), then narrate the two or three that matter most for a live audience:

| Primitive | What it does | When it loads |
|---|---|---|
| Global instructions | Rules that always apply | Every interaction |
| Scoped instructions | Domain rules tied to file path | When editing matching files |
| Agents | Restricted personas (read-only, execute-only, etc.) | When explicitly invoked |
| Skills | Repeatable multi-step workflows | When explicitly invoked |
| Prompts | Single-task focused templates | When explicitly invoked |
| Specs | The architecture knowledge base | When referenced by the above |

Call out the two ideas that generalize furthest:

1. **Progressive disclosure** — don't load everything all the time. Scope instructions by file path so the agent only sees what's relevant to the 5 files it's touching, not all 30+ repos.
2. **Least privilege for agents** — a read-only Q&A agent literally cannot edit files. A planning agent can't push code. Restricting tools is a harness decision, not a prompt request.

## 5. Demo clip 1 — Guides in action (13:00–16:00)

Play the clip (see `03-demo-recording-script.md` for the shot list). Before playing, set up what to watch for in one sentence:

> "Watch what happens to the *same* request, once with no scoped context, once with it."

After the clip, land it in one sentence: *"Same model. Same prompt. Different harness. Different — correct — output."*

## 6. Layer 2 — Sensors (16:00–20:00)

Sensors catch mistakes **after** the agent acts, and feed the failure back so the agent fixes itself. This is the layer most teams skip entirely — say that explicitly, it's a credibility beat.

Two design rules worth putting on a slide verbatim (they're quotable and useful on their own):

> **Silent success, verbose failure.** A sensor that passes produces zero output. A sensor that fails surfaces the exact error, so the agent can self-correct without a human in the loop.

> **Promote rules from docs into code.** If you keep writing the same instruction in prose and the agent keeps ignoring it, that's a signal to escalate it to a linter or a structural test — prose is the starting point, mechanical enforcement is the destination.

Give the mini feedback-loop diagram: Guides → agent generates code → Sensors (type check → lint → test → architecture rule) → silent on pass / error on fail → agent fixes → done.

## 7. Demo clip 2 — Sensors in action (20:00–23:00)

Set up: *"Now watch the agent make a mistake — and catch it itself before a human ever sees it."*

After the clip: *"Nobody reviewed that. The sensor did — and the agent fixed it in the same turn."*

## 8. Context rot — the open problem (23:00–26:00)

This section exists to keep the talk honest — you're not selling a finished product, you're describing an engineering discipline with real unsolved edges. That honesty is what makes the rest of the talk credible to a room full of senior engineers.

> "Bigger context windows don't fix this — they just make the haystack bigger."

Name 2–3 concrete failure modes (pick from your own experience, generalized):

- **Long-horizon drift** — quality degrades the longer a single session runs.
- **Stale specs** — the knowledge base the agent trusts drifts from what the code actually does.
- **Self-verification bias** — agents are optimistic about their own work; computational checks have to override self-assessment, not just supplement it.

State the mitigation pattern generically: scoped, session-persistent memory instead of one giant growing conversation; diff-based refresh instead of "write it once and hope."

## 9. Generalizing — 5 principles for any team (26:00–28:30)

This is the slide people photograph. Keep it to 5, each one sentence:

1. **Earn every rule.** Every instruction should trace to a real past failure — hand-written, never auto-generated (auto-generated rules measurably hurt output quality).
2. **The codebase wins.** When a guideline and the existing code disagree, the agent follows the code — the codebase is the source of truth, not the doc.
3. **Structure in, structure out.** Real file paths and real symbol names in, correct code out. Vague prompts get vague — or wrong — code.
4. **Sub-agents are context firewalls, not personas.** Use them to isolate context and return a condensed answer, not to role-play a character.
5. **Treat the harness as software.** Version it, review it in PRs, refactor it when it drifts. A stale prompt rots exactly like a stale test.

## 10. Recap + close (28:30–30:00)

**Live bit — self-score the checklist (28:30–29:10):** Project the 5-question harness audit from `06-audience-takeaway.md`. Ask the room to silently score their own team 0–5 on their fingers, no mic needed. *"Who's at a 5?"* — pause, scan for hands (there will be almost none — that's the point, let the silence land). *"Who's at 0 or 1?"* — more hands, knowing laugh. Don't editorialize the result; let the room feel it, then move straight into the recap.

One breath recap: *"Model plus harness. Guides before, sensors after. Treat both as software, not as a one-time setup."*

Close on the line you want quoted:

> **"You can't prompt your way to a reliable AI coding agent. You have to engineer the harness around it."**

Hand off: *"I've put a one-page checklist and today's slides at [link] — happy to go deeper in Q&A or after."*
