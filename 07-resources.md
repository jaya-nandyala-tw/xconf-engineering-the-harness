# Research Resources — Harness Engineering

External sources gathered while prepping the talk. Kept here so every claim on stage can be traced back to something real. Add new links to the bottom as you find them — don't reorder, this is roughly chronological by when it entered the research.

---

## 1. [Harness Engineering for Coding Agents](https://martinfowler.com/articles/harness-engineering.html) — Birgitta Böckeler, martinfowler.com

**Why it matters for this talk specifically:** Böckeler is a Thoughtworks Distinguished Engineer — this is a Thoughtworks-authored article, on Thoughtworks' own publishing platform, on the exact topic of this talk, for a Thoughtworks conference audience. Worth naming her explicitly on stage — home-crowd credibility you don't get to use twice.

**Key extracted points:**
- Harness = "everything in an AI agent except the model itself," scoped to coding. Distinguishes **builder harness** (platform-provided) from **user harness** (what your team builds).
- Guides (feedforward) vs. Sensors (feedback) — same terms ssi-ai-kit already uses. Each splits into **computational** (deterministic, millisecond — linters, type checkers) and **inferential** (semantic AI judgment, slower) modes.
- **Harnessability**: not every codebase supports harnessing equally. "Ambient affordances" (strong typing, clear module boundaries) determine what sensors are even possible.
- Three regulation categories: **maintainability harness** (easiest — computational sensors catch structure reliably), **architecture fitness harness** (fitness functions + observability), **behaviour harness** (hardest — currently leans on AI-generated tests, which the article flags as "not good enough yet").
- Core humility line: a good harness should "direct human input to where it's most important," not eliminate it. Harness engineering is "an ongoing engineering practice, not a one-time configuration."

## 2. [Agent Harness Engineering](https://addyosmani.com/blog/agent-harness-engineering/) — Addy Osmani

**Key extracted points:**
- Same equation ssi-ai-kit already leads with: **Agent = Model + Harness**. Quotable line: "A decent model with a great harness beats a great model with a bad harness."
- **The Ratchet Principle**: "Every line in a good `AGENTS.md` should be traceable back to a specific thing that went wrong" — matches ssi-ai-kit's Principle 1 ("earn each rule") almost verbatim, good external validation.
- Concrete constraint: keep the rulebook under ~60 lines — "a pilot's checklist, not a style guide." Every line competes for attention.
- **Tool design discipline**: ~10 focused tools beats 50 overlapping ones; tool names/descriptions occupy prompt real estate, so treat MCP tool descriptions as trusted prompt text, not documentation.
- **Planner/generator/evaluator split**, because "agents reliably skew positive when grading their own work" — direct validation of why an independent `@verify`-style agent matters.
- "Harnesses don't shrink, they move" — as models improve, failure modes shift to new domains rather than disappearing; the harness needs periodic re-audit, not a one-time build.
- "Most failures are skill issues" — configuration problems, not model limitations. Reinforces: invest in the harness before waiting on a better model.

## 3. [Harness Engineering for Self-Improvement](https://lilianweng.github.io/posts/2026-07-04-harness/) — Lilian Weng

**Note:** mostly frontier-research territory (recursive self-improvement, evolutionary search, meta-harness optimization) — less directly actionable for a team harness, but a few ideas translate down well.

**Key extracted points:**
- Frames a harness as the layer that "orchestrates execution and decides how the model thinks and plans, calls tools and acts, perceives and manages context, stores artifacts, and evaluates results."
- **Agentic Context Engineering (ACE)**: treats context as "an evolving playbook" via three roles — **Generator** (produces trajectories), **Reflector** (distills insights), **Curator** (updates structured entries). This is a more formal version of what `@story`'s Phase 6 close-stage already does informally (capture lessons → surface rule candidates → archive).
- **Observability-first evolution**: three pillars — component observability (each harness piece has a file-system representation), experience observability (trajectory analysis), decision observability (every edit paired with a falsifiable prediction). Without this, "optimization loops become opaque."
- Caution worth keeping: read-only verification layers (verifiers, logs, configs) should sit **outside** any loop that lets an agent modify its own harness — otherwise you risk reward hacking.

## 4. [learn-harness-engineering](https://github.com/walkinglabs/learn-harness-engineering) — walkinglabs (GitHub course)

**Key extracted points:**
- Cites the same before/after data point as source #5 below: the same model (Opus 4.5) failed in 20 minutes with no harness, but built a working game in 6 hours with one.
- **Five harness subsystems** — a clean audit checklist: **Instructions** (what to do, what order), **State** (persist progress across sessions), **Verification** (only passing tests = done), **Scope** (one feature at a time, explicit "done" definition), **Lifecycle** (init → execute → wrap up → commit clean).
- **Repository as single source of truth** — critical info can't live only in prompts or human memory; everything state-relevant must be disk-persisted for multi-session continuity to work automatically.
- Concrete starter artifacts worth naming: `AGENTS.md` (operating manual), `init.sh` (environment health check run *by the agent* before work starts), `feature_list.json` (machine-readable scope boundary, not a prose description), `progress.md` (session-by-session record).
- "Confidence ≠ correctness" — an agent claiming victory without a passing full-pipeline test run is a **harness gap**, not a model failure.

## 5. [Harness Design for Long-Running Application Development](https://www.anthropic.com/engineering/harness-design-long-running-apps) — Anthropic Engineering

**Why it matters for this talk specifically:** this has a real, publicly citable, non-proprietary metric — safe to quote on stage without needing our own validated numbers.

**Key extracted points:**
- **The headline stat**: same model, "Retro Game Maker" task — solo agent, no harness: 20 minutes, $9, broken core gameplay. Full harness: 6 hours, $200, functional app with 16 features across 10 sprints. Directly usable, attributed, real number for the talk.
- **Context anxiety**: a named failure mode where a model "begins wrapping up work prematurely as they approach what they believe is their context limit" — observed specifically in Claude Sonnet 4.5, reduced in Opus 4.5. Concrete, vivid, and not currently named in ssi-ai-kit's context-rot list.
- **Context reset vs. compaction**: two distinct mitigations — compaction summarizes in place; a reset clears the window entirely and hands off via a structured artifact. Which one helps is model-dependent.
- **GAN-inspired Generator/Evaluator architecture**: separate agents for producing work vs. grading it, because "agents tend to respond by confidently praising [their own] work — even when, to a human observer, the quality is obviously mediocre." The Evaluator negotiates a **"sprint contract"** — an agreed definition of "done" — *before* any code is written, and in one experiment used Playwright MCP to actually click through the running app like a user, not just read the diff.
- Explicit engineering discipline: "every component in a harness encodes an assumption about what the model can't do on its own... worth stress-testing... because they can quickly go stale as models improve." When a new model (Opus 4.6) arrived, the author literally removed a load-bearing harness construct (the sprint system) to test whether it was still needed.

## 6. [What Is AI Harness Engineering? Your Guide to Controlling Autonomous Systems](https://medium.com/be-open/what-is-ai-harness-engineering-your-guide-to-controlling-autonomous-systems-30c9c8d2b489) — Medium (Be Open)

**Note:** a different angle from the other five — this one comes from the AI-safety/alignment world (broad autonomous systems), not specifically coding-agent harnesses. Less directly actionable, but a couple of ideas transfer well, and one is genuinely useful for the talk.

**Key extracted points:**
- Frames harness engineering as "the discipline of building a safe and effective partnership with powerful artificial intelligence" — shifting the engineer's role from programmer to something closer to a "dragon trainer" designing the operating environment, not hand-coding every behavior.
- **Reward hacking**: AI achieves the *stated* objective through an unintended method — the article's example is an agent that "solves" bad service by deleting the complaints server instead of improving service. Directly relevant to coding-agent sensors: nothing stops an agent from making a failing test go silent by deleting or skipping it rather than fixing the underlying bug.
- **Value brittleness** ("sawdust sandwich problem"): following the literal spec while missing the intent behind it.
- Four control layers: **agent architecture** (plan → act via limited pre-approved tools → reflect on results → persist lessons to memory), **reward engineering** (shape incentives, explicitly ask "what's the laziest, most creatively lazy way an AI could satisfy this goal?"), **constraints/guardrails** (automated monitoring as "a digital immune system"), **human-in-the-loop** ("the big red STOP button" for high-stakes decisions).
- Interesting naming resonance: the article's "Constitutional AI" (one AI supervising another against a set of core principles) is the same word ssi-ai-kit already uses for its `specs/*/constitution.md` files — different purpose (domain architecture rules vs. behavioral alignment), but the term isn't a coincidence; both borrow from the same lineage.
- Candid limitation acknowledged by the author: the underlying alignment problem "remains unsolved" and effective harness engineering ultimately needs governance/consensus, not just more technical layers — a useful honesty beat if you want a second one beyond context rot.

---

## How these map back to the talk

See [`08-lessons-and-gaps.md`](./08-lessons-and-gaps.md) for the concrete additions proposed to the talk content and the corresponding gaps proposed for the `ssi-ai-kit` system itself.
