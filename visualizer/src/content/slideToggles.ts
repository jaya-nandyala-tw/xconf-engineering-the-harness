// Feature toggles for the live talk sequence — flip an id to `false` to pull it out of
// the Gallery, keyboard chaining (←/→), and /deck/:id resolution WITHOUT deleting its
// content from deck.ts. Flip back to `true` (or delete the line) to bring it back.
//
// Any id not listed here defaults to enabled — see isEnabled() below.
export const SLIDE_TOGGLES: Record<string, boolean> = {
  // Confession-wall lines aren't collected yet (needs real anonymized one-liners).
  // Re-enable once 03-demo-recording-script.md's collection step is done.
  s1a: false, // Cold open — confession-wall crawl

  // Demo clips aren't recorded yet — presenting the guides-sensors / context-rot
  // visualizations live in their place instead. Re-enable once real clips exist.
  s14: false, // Demo 1 — Guides in action
  s18: false, // Demo 2 — Sensors in action
};

export function isEnabled(id: string): boolean {
  return SLIDE_TOGGLES[id] !== false;
}
