import { useLocation } from "react-router-dom";
import { DECK, SECTIONS, type DeckItem, type DeckSection, type Notes } from "../content/deck";
import { isEnabled } from "../content/slideToggles";

// The effective talk sequence — everything downstream (Gallery, keyboard chaining,
// /deck/:id lookups) reads through this, never DECK directly, so a toggle in
// slideToggles.ts takes effect everywhere in one place.
const ENABLED_DECK: DeckItem[] = DECK.filter((item) => isEnabled(item.id));

export interface GroupedSection {
  section: DeckSection;
  items: DeckItem[];
}

// Grouped by SECTIONS order, each section's items in DECK order — the shape the Gallery
// renders directly, and what useGalleryNav's {section, index} cursor walks.
export function groupedDeck(): GroupedSection[] {
  return SECTIONS.map((section) => ({
    section,
    items: ENABLED_DECK.filter((item) => item.section === section.id),
  })).filter((group) => group.items.length > 0);
}

export function getItem(id: string): DeckItem | undefined {
  return ENABLED_DECK.find((item) => item.id === id);
}

export function getIndex(id: string): number {
  return ENABLED_DECK.findIndex((item) => item.id === id);
}

export function hrefFor(item: DeckItem): string {
  return item.kind === "interactive" ? item.route : `/deck/${item.id}`;
}

// --- Planned schedule, derived from SECTIONS' plannedMinutes --------------------------
// Single-sourced from plannedMinutes so rebalancing one section's length during a sync-up
// automatically shifts every downstream planned start time and the pace math in Presenter
// Preview — nothing here is hand-maintained.

export const TOTAL_PLANNED_SECONDS = SECTIONS.reduce((sum, s) => sum + s.plannedMinutes * 60, 0);

export function sectionPlannedStartSeconds(sectionId: number): number {
  return SECTIONS.filter((s) => s.id < sectionId).reduce((sum, s) => sum + s.plannedMinutes * 60, 0);
}

export function formatMinSec(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function sectionTimeLabel(section: DeckSection): string {
  const start = sectionPlannedStartSeconds(section.id);
  const end = start + section.plannedMinutes * 60;
  return `${formatMinSec(start)}–${formatMinSec(end)}`;
}

// Which section is currently on screen, derived from the route rather than threaded through
// every scene/slide component as a prop — works for both static slides (/deck/:id) and
// interactive scenes (their own dedicated routes) since both resolve through hrefFor.
export function useCurrentSection(): DeckSection | undefined {
  const location = useLocation();
  const item = ENABLED_DECK.find((i) => hrefFor(i) === location.pathname);
  return item ? SECTIONS.find((s) => s.id === item.section) : undefined;
}

// Same route-matching as useCurrentSection, one level more specific — the deck item itself
// rather than its section. Used to look up per-slide presenter notes.
export function useCurrentDeckItem(): DeckItem | undefined {
  const location = useLocation();
  return ENABLED_DECK.find((i) => hrefFor(i) === location.pathname);
}

// Resolves which note to show for the current beat — a beat-specific override if the
// item has one, else the item's whole-scene fallback. Undefined for both means no note
// at all, which the presenter bar treats as "render nothing."
export function notesForBeat(item: DeckItem | undefined, beat: number): Notes | undefined {
  return item?.beatNotes?.[beat] ?? item?.notes;
}

export interface NavTarget {
  href: string;
  label: string;
}

export function getNextTarget(id: string): NavTarget | null {
  const index = getIndex(id);
  if (index === -1 || index >= ENABLED_DECK.length - 1) return null;
  const next = ENABLED_DECK[index + 1];
  return { href: hrefFor(next), label: next.navLabel };
}

export function getPrevTarget(id: string): NavTarget | null {
  const index = getIndex(id);
  if (index <= 0) return null;
  const prev = ENABLED_DECK[index - 1];
  return { href: hrefFor(prev), label: prev.navLabel };
}
