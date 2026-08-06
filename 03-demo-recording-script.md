# Live Demo Scenes — Rehearsal & Fallback Notes

This doc used to be a recording script for 2 pre-produced video clips (plus a confession-wall montage). Neither exists in the deck anymore: `visualizer/src/content/deck.ts` has **zero** `video-placeholder` slides, and the confession-wall montage was cut entirely. Every demo in the current deck is a **live, routed React scene** (`visualizer/src/scenes/*.tsx`), driven beat-by-beat with ←/→ during the talk. This doc now covers what actually matters for that: rehearsal, timing, and what to do if a scene breaks on stage.

**Why this matters as a risk trade-off, explicitly:** the original video-clip plan existed specifically to remove network/model-flakiness risk on a 400+ person stage with a hard clock (see git history / prior version of this doc). Live scenes remove the model-flakiness risk too — nothing in any scene calls a live model; all content is pre-scripted data (`BEATS` arrays) rendered with Framer Motion — but they reintroduce **venue-hardware risk**: an unfamiliar laptop, an unfamiliar browser, an unfamiliar projector resolution, or a bad build. That's a different risk profile than video, not a smaller one. Treat the Aug 13 dry run as the point where you actually validate this trade-off, not just the slides.

---

## General rehearsal checklist (applies to every scene below)

- **Run the actual built app, not `localhost` from memory.** `cd visualizer && npm run build && npm run preview` (or whatever the current prod script is) — rehearse against what will actually run on the venue laptop, not the dev server.
- **Keyboard nav only.** Every scene advances on ←/→ (see `useBeats`/`useSceneNav`). Rehearse driving each scene with a keyboard or clicker, no mouse — that's what you'll do on stage.
- **Time each scene with a stopwatch**, not by estimate. `01-talk-outline.md`'s section time budgets were carried over from the deck's own `SECTIONS.timeLabel`s, which have **not** been validated against how long these scenes actually take to click through while narrating. Section 6 (`guides-sensors`, ~15 beats) and Section 7 (three scenes back to back) are the highest-risk for overrun.
- **Test on the actual venue laptop/projector combo at the Aug 13 dry run.** Browser rendering, animation performance, and font sizing at a distance are the most common failure points for a live web app on unfamiliar hardware — the equivalent of "codec/aspect-ratio mismatch" from the old video-clip plan.
- **Screen-record a dry run of each scene once**, even though nothing will be played back live — this gives you a fallback asset (see below) and lets you check pacing without burning a live rehearsal slot.
- **Zoom/browser chrome:** confirm the scene's text is legible from the back of a 400-seat room at whatever browser zoom level you'll present at — these were built and reviewed at normal laptop viewing distance, not tested from row 30.

---

## Per-scene notes

| Scene (route) | Section | Beats | What to watch for while narrating |
|---|---|---|---|
| `nested-layers` | 2 — Core idea | 6 | Hold beat 5 (harness ring pulsing) for ~20 sec while you say the "request vs. enforce" line — don't advance past it early. |
| `workspace-wrapper` | 3 — The problem | ~9 | Two halves in one scene: no-harness drift, then harness-plus-gate sync. Don't rush the drift half — the room needs to see the "wrong" state clearly before the fix means anything. |
| `input-collection-gate` | 5 — Ask Before Deciding | 9 | Chat-log auto-scrolls — give each bubble a beat to actually be read before advancing, especially the non-skippable gate line. |
| `guides-sensors` | 6 — Sensors | ~15 | The longest scene in the deck. Two loops fire in one run (human-confirm at Blueprint, auto-fix at Review) — call out explicitly that they're different *kinds* of loop, not just two repeats of the same thing. Budget the most rehearsal time here. |
| `context-rot-problem` | 7 — Context rot | ~8 | Token counter builds up — let the number actually land before talking over it, the "buried rule" point depends on the room seeing the count grow. Its own final beat's caption delivers the "haystack" line and previews both fixes — there's no separate slide for it anymore (removed a verbatim duplicate; see `04-slide-outline.md`). Let that last beat land before moving on. |
| `context-rot-solution-1` | 7 — Context rot | ~8 | Meant to be watched immediately after `context-rot-problem`, same session replayed — don't let another topic intervene between them. |
| `progressive-disclosure` | 7 — Context rot | ~6 | Tree traversal — pause on the two untouched sibling branches, that's the actual point (scoped ≠ arbitrarily restricted). |

---

## Backup plan if a scene breaks or won't load on the venue laptop

- **Screen-record each scene once during rehearsal** (per the checklist above) and keep those recordings on the presenting laptop and a USB backup, muted, ready to play as video if the live app fails. This is the one piece of the old video-clip plan worth keeping as insurance, not as the primary plan.
- **Have the relevant static slide's talking points memorized** (see `02-speaker-script.md` per section) so you can narrate the *concept* from memory without any visual if both the live scene and the recorded fallback fail.
- **Test the actual failure mode, not just the happy path**, during the Aug 13 dry run: kill the wifi, try a fresh browser profile, try it at the venue's actual resolution — a live React app has more ways to degrade than a video file does (blank white screen, console error, wrong viewport), and "just refresh" may not be available mid-talk.
- **Know the routes cold** (`/nested-layers`, `/workspace-wrapper`, `/input-collection-gate`, `/guides-sensors`, `/context-rot-problem`, `/context-rot-solution-1`, `/progressive-disclosure`) so you can navigate directly to a scene by URL if the Gallery/deck-nav UI itself misbehaves.

---

## Sanitization note (carried over from the old plan, still applies)

Every scene already uses placeholder repo/field names (`billing-service`, `checkout-bff`, `payments-service`, `storefront-web`, `PROJ-123`, `ui-constitution.md`, etc.) — confirmed by reading the scene source, not just assumed. No real company/project/repo names appear in any scene as currently built. If anyone edits scene content before the talk, keep it that way.
