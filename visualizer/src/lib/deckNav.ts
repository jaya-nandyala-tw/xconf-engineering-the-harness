import { DECK, SECTIONS, type DeckItem, type DeckSection } from "../content/deck";
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

function hrefFor(item: DeckItem): string {
  return item.kind === "interactive" ? item.route : `/deck/${item.id}`;
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
