import type { Accent } from "../content/deck";

// Literal class strings (not template-interpolated) so Tailwind's scanner picks them up.
export const ACCENT_BG: Record<Accent, string> = {
  flamingo: "bg-turmeric",
  sapphire: "bg-sapphire",
  jade: "bg-jade",
  turmeric: "bg-turmeric",
  amethyst: "bg-amethyst",
};

export const ACCENT_TEXT: Record<Accent, string> = {
  flamingo: "text-turmeric",
  sapphire: "text-sapphire",
  jade: "text-jade",
  turmeric: "text-turmeric",
  amethyst: "text-amethyst",
};

export const ACCENT_BORDER: Record<Accent, string> = {
  flamingo: "border-turmeric",
  sapphire: "border-sapphire",
  jade: "border-jade",
  turmeric: "border-turmeric",
  amethyst: "border-amethyst",
};

// Sapphire is excluded here on purpose: it's teal-family, same as the `wave` background,
// so text/borders in it read as low-contrast on the actual dark-teal chrome. Keep it in
// ACCENT_BG/TEXT/BORDER above for completeness, just don't cycle it for pop elements.
// Flamingo (pink) replaced with turmeric for contrast — see deck.ts's ACCENT_CYCLE.
const ORDER: Accent[] = ["turmeric", "jade", "turmeric", "amethyst"];

export function accentForIndex(i: number): Accent {
  return ORDER[i % ORDER.length];
}
