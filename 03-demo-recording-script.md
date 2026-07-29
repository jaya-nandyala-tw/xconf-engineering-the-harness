# Demo Recording Script — 3 assets: cold-open montage + 2 clips

All three are **pre-produced**, embedded as video in the slide deck (not switched to live). This removes network/model-flakiness risk on a 400+ person stage with a hard clock.

## Recording ground rules (apply to both clips)

- **Sanitize before recording:** use a scratch/sample repo layout with placeholder names (`platform-ui`, `platform-service`, `order-lambda`, `infra-module`) — never real company/project/repo names, ticket IDs, internal URLs, or `.env` contents. Assume the recording could end up public.
- **Resolution/format:** record at 1080p minimum, 16:9, terminal + editor font size bumped to at least 18pt so text reads from the back of a 400-seat room.
- **Length discipline:** hard cap 90 seconds per clip. Cut dead air (typing, thinking pauses, model latency) in editing — the room should never watch a spinner.
- **Captions:** burn in 2–4 short on-screen text callouts (not full narration) at the key moments — you'll narrate live over the clip, callouts are a memory aid for the back row, not a transcript.
- **Audio:** record with mic off / no live narration baked into the clip — you narrate live in the room over a muted or ambient-only clip. This lets you adjust pacing to the room instead of being locked to a fixed voiceover.

---

## Clip 0 — "Confession-wall montage" (used in Section 1, ~0:00–0:20)

**Point to prove:** everyone in this room has been burned by confidently-wrong AI code — before you say a single word, make that visceral and a little funny.

**Collection plan (do this first, needs the most lead time):**

1. Ask 6–10 colleagues (Slack DM or a shared doc) for their **worst AI-coding-disaster one-liner** — one sentence, no context needed beyond the line itself. Give them your own as an example to calibrate tone: honest, a little embarrassing, not bitter or tool-bashing.
2. Pick the **4 strongest** — optimize for variety of failure mode (wrong pattern, broke prod, deleted something, confidently hallucinated an API) over raw shock value, and for brevity: each line should read in under 3 seconds.
3. **Anonymize fully** — no names, no team names, no company/tool names (don't single out a specific AI product; the talk's point is the harness, not any one tool's failure). Rewrite as needed to keep them punchy and generic, e.g. *"It told me the migration was 'safe.' It was not."*
4. Get a quick thumbs-up from each contributor on the final anonymized wording before using it — even anonymized, confirm they're fine with their story being read by 400 people.

**Format:**

- Simple animated text crawl or fade-sequence, **no screen recording needed** — this is typography, not a product demo. Dark background, large centered type, one line at a time, ~4–5 sec per line.
- **No narration, no voiceover, no music** — silence is part of the effect; let the room read and react on its own before you've taken the mic.
- Total length: **~18–20 seconds**, 4 lines. Do not let this run long — it's a cold open, not a segment.
- Last line fades out to black just as you walk on stage, so your live line ("...and yes, one of those was mine") lands into a clean silence, not over trailing animation.

**Backup:** if it can't be produced as animation in time, a plain black slide with the 4 lines revealed on manual clicks (one per click, no transition) achieves the same effect — resist the urge to add clip art or icons, the bareness is what makes it land.

---

## Clip 1 — "Guides in action" (used in Section 5, ~13:00–16:00)

**Point to prove:** the exact same request to the exact same model produces a wrong-pattern answer with no scoped context, and a codebase-correct answer once scoped instructions + specs are in place.

**Shot list:**

1. *(0:00–0:20)* Split-screen or sequential: show a request like "add a new API endpoint for X" with **no scoped instructions loaded** — agent produces a generic/legacy-pattern answer (e.g. wrong folder, wrong structure for this codebase).
   - On-screen callout: `No scoped context → generic pattern`
2. *(0:20–0:35)* Cut to: the same workspace, but now show the file-path-scoped instruction file briefly (just enough for the room to see it exists and that it's short — a "navigation index," not a wall of text).
   - On-screen callout: `Scoped instructions load automatically by file path`
3. *(0:35–0:70)* Same request again — agent now produces output matching the actual codebase pattern (right folder, right structure, references the real spec). Scroll to show it lands in the correct location / follows the correct convention.
   - On-screen callout: `Same model. Same prompt. Different harness.`
4. *(0:70–0:85)* Quick zoom on the generated file/structure — visually confirm it matches existing sibling files in the repo.

**What to say live (over the muted clip):** see `02-speaker-script.md` Section 5.

---

## Clip 2 — "Sensors in action" (used in Section 7, ~20:00–23:00)

**Point to prove:** the agent makes a plausible mistake, a sensor (lint/type-check/test/review skill) catches it, and the agent self-corrects — with zero human intervention.

**Shot list:**

1. *(0:00–0:15)* Agent finishes a task and reports something like "Done" / "Implementation complete."
   - On-screen callout: `Agent claims: done`
2. *(0:15–0:40)* Cut to the sensor running automatically (a lint error, a failing test, or a code-review-skill finding a violation) — let the actual error output show on screen, don't paraphrase it.
   - On-screen callout: `Sensor disagrees`
3. *(0:40–0:70)* Agent reads the sensor's failure output and fixes it in the same turn — show the diff or the corrected file.
   - On-screen callout: `Agent self-corrects — no human review yet`
4. *(0:70–0:85)* Sensor re-runs, passes silently (brief green check / clean output) — reinforce "silent success."
   - On-screen callout: `Silent on pass`

**What to say live (over the muted clip):** see `02-speaker-script.md` Section 7.

---

## Backup plan if a clip breaks or plays wrong on the venue AV system

- Have a **static 3-slide fallback** for each clip (before screenshot → sensor/error screenshot → after screenshot) ready in the deck as hidden slides, so you can narrate over stills instead of a broken video without an awkward stage pause.
- Test both clips on the **actual venue laptop/projector combo** during the August 13 dry run — codec/aspect-ratio mismatches are the single most common conference AV failure.
