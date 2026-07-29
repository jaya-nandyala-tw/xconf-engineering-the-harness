# Slide Outline — "Engineering the Harness" (~22 slides / 30 min)

Roughly one slide per 1.3 minutes. Minimal text per slide — these are talking points for the speaker, not the audience's reading material. Big idea, big font, one visual.

| # | Section | Slide content | Visual |
|---|---|---|---|
| S1a | **Cold open** | Confession-wall montage — silent text-crawl of 3–4 anonymized one-line AI-coding-disaster confessions, ~20 sec, plays before you take the stage | Video/animated text crawl, no narration |
| S1 | Hook | Title + your name/role, nothing else | Full-bleed title |
| S2 | Hook | "Who's had an AI assistant confidently ignore every convention on their team?" | Blank / just the question |
| S3 | Agenda | 4 beats: What a harness is → Guides → Sensors → Take this home | Simple 4-icon row |
| S4 | Core idea | **"Agent = Model + Harness."** (verbatim, huge type) | Text only |
| S5 | Core idea | 3-layer nested diagram: Harness ⊃ Context ⊃ Prompt | Nested boxes diagram (see below) |
| S6 | Core idea | "A prompt can REQUEST safety. Only the harness can ENFORCE it." | Text only, quote-style |
| S7 | Problem | "The shape of the problem" — 5 pain points as a checklist (generalized, no company specifics) | Bullet list |
| S8 | Problem | Root cause, one sentence: "AI is only as good as the context it gets + the feedback loops that correct it" | Text only |
| S9 | Problem | Transition: "So we built two layers: Guides and Sensors" | Simple before/after arrow diagram |
| S10 | Guides | Definition: "Guides steer the agent *before* it acts" | Text + icon |
| S11 | Guides | Six primitives table (instructions, scoped instructions, agents, skills, prompts, specs) | Table |
| S12 | Guides | Callout: "Progressive disclosure — load only what's relevant to the 5 files being touched" | Diagram: file path → matching instruction file |
| S13 | Guides | Callout: "Least privilege — a read-only agent literally cannot edit files" | Diagram: 3 agent personas with different tool badges |
| S14 | **Demo 1** | Embedded video clip — "Guides in action" | Video |
| S15 | Sensors | Definition: "Sensors catch mistakes *after* the agent acts, and feed the error back" | Text + icon |
| S16 | Sensors | Feedback loop diagram: Guides → generate → Sensors → pass (silent) / fail (verbose) → agent fixes | Loop diagram |
| S17 | Sensors | Two rules, verbatim: "Silent success, verbose failure" / "Promote rules from docs into code" | Two large quote blocks |
| S18 | **Demo 2** | Embedded video clip — "Sensors in action" | Video |
| S19 | Honesty beat | "Bigger context windows don't fix this — they make the haystack bigger" | Text only |
| S20 | Honesty beat | 3 context-rot failure modes + the mitigation pattern (scoped memory, diff-based refresh) | 3-row table |
| S21 | Takeaway | 5 principles for any team (earn every rule / codebase wins / structure in-out / sub-agents as firewalls / harness as software) | Numbered list, this is the "photograph me" slide |
| S21b | **Live bit** | 5-question harness audit checklist, displayed while the room self-scores 0–5 on their fingers ("who's at a 5?" / "who's at a 0 or 1?") | Numbered checklist, no animation — leave it static so the room can read while scoring |
| S22 | Close | **"You can't prompt your way to a reliable AI coding agent. You have to engineer the harness around it."** + QR code to takeaway doc | Quote + QR code |

---

## Diagram specs (hand to whoever builds the deck, or build directly in slides/Figma)

### S5 — Nested layer diagram

```
┌─────────────────────────────────────────┐
│ HARNESS ENGINEERING (system) — "OS"      │
│  orchestration · tool permissions ·      │
│  guardrails · retry loops                │
│  ┌───────────────────────────────────┐   │
│  │ CONTEXT ENGINEERING (session)      │   │
│  │  — "Briefing packet"               │   │
│  │  retrieval · memory · summarization│   │
│  │  ┌─────────────────────────────┐   │   │
│  │  │ PROMPT ENGINEERING (message) │   │   │
│  │  │  — "Job description"         │   │   │
│  │  │  instructions · role · examples │  │
│  │  └─────────────────────────────┘   │   │
│  └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

Keep this exact nesting on screen for ~20 seconds while you narrate — it's the one diagram you want people to remember, so don't rush past it.

### S16 — Guides/Sensors feedback loop

```
 GUIDES (before)                         SENSORS (after)
 instructions → specs → skills   agent    type checks → linters →
 → agents → prompts        ───▶ generates ───▶ tests → arch rules
                              code                  │
                                                     ▼
                                        pass?  ── silent, done
                                        fail?  ── verbose error ──▶ agent fixes ──▶ (loop back to sensors)
```

### S20 — Context rot table (keep to 3 rows max on slide, more detail live in speech)

| Failure mode | One-line mitigation |
|---|---|
| Long-horizon drift | Scoped, persistent memory instead of one ever-growing session |
| Stale specs | Diff-based refresh tied to code changes, not calendar-based |
| Self-verification bias | Computational sensors override the agent's own "I'm done" claim |

---

## Design notes

- **Font size floor:** body text no smaller than what's readable from row 30 of a 400-seat room — when in doubt, cut words, don't shrink font.
- **One idea per slide.** If a slide needs a build/reveal to make sense, that's fine — better than cramming two ideas onto one slide.
- **Color/contrast:** confirm slides read on the venue's actual projector during the Aug 13 dry run — projected color often washes out darker palettes.
