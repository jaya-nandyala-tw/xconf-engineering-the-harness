// Feature toggles for the live talk sequence — flip an id to `false` to pull it out of
// the Gallery, keyboard chaining (←/→), and /deck/:id resolution WITHOUT deleting its
// content from deck.ts. Flip back to `true` (or delete the line) to bring it back.
//
// Any id not listed here defaults to enabled — see isEnabled() below.
export const SLIDE_TOGGLES: Record<string, boolean> = {};

export function isEnabled(id: string): boolean {
  return SLIDE_TOGGLES[id] !== false;
}
