import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "xconf-theme";

interface ThemeContextValue {
  theme: Theme;
  isLight: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isLight: theme === "light",
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

// For the handful of scenes that animate plain CSS-color strings via framer-motion
// (not Tailwind classes, so the --color-ink swap above can't reach them) — the "off/
// neutral" state in those diagrams is a translucent white on the dark wave background;
// on light mist it needs to be a translucent wave instead to stay visible at the same alpha.
// This is for decorative use (background tints, borders, SVG strokes) where matching the
// dark-mode alpha 1:1 is the right call — for text, use inkTextRgba below instead.
export function inkRgba(isLight: boolean, alpha: number): string {
  return isLight ? `rgba(0, 61, 79, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
}

// --- Contrast-matched alpha for TEXT specifically -------------------------------------
// Same asymmetry as the text-ink/NN CSS overrides in index.css, but for scenes that
// compute a color as a plain rgba() string (framer-motion animate targets, inline
// style={{color}}) rather than a Tailwind class the CSS overrides can catch. Blending a
// light color toward transparent over a dark bg gains contrast fast; blending a dark
// color toward transparent over a light bg gains it slowly — so the same alpha reads much
// fainter as ink-on-mist than it did as white-on-wave. This solves for the light-mode
// alpha that reproduces the original dark-mode contrast at a given alpha, so "muted" text
// stays equally muted-but-legible in both themes instead of nearly invisible in light mode.
const WAVE_RGB: [number, number, number] = [0, 61, 79];
const MIST_RGB: [number, number, number] = [237, 241, 243];
const WHITE_RGB: [number, number, number] = [255, 255, 255];

function srgbToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : ((cs + 0.055) / 1.055) ** 2.4;
}
function relLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const l1 = relLuminance(a), l2 = relLuminance(b);
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
function blendRgb(
  fg: [number, number, number],
  bg: [number, number, number],
  alpha: number,
): [number, number, number] {
  return [
    fg[0] * alpha + bg[0] * (1 - alpha),
    fg[1] * alpha + bg[1] * (1 - alpha),
    fg[2] * alpha + bg[2] * (1 - alpha),
  ];
}

const lightAlphaCache = new Map<number, number>();

function lightAlphaFor(alpha: number): number {
  const key = Math.round(alpha * 1000);
  const cached = lightAlphaCache.get(key);
  if (cached !== undefined) return cached;

  const target = contrastRatio(blendRgb(WHITE_RGB, WAVE_RGB, alpha), WAVE_RGB);
  let p = alpha;
  while (p < 0.95) {
    if (contrastRatio(blendRgb(WAVE_RGB, MIST_RGB, p), MIST_RGB) >= target) break;
    p += 0.01;
  }
  p = Math.min(p, 0.95);
  lightAlphaCache.set(key, p);
  return p;
}

export function inkTextRgba(isLight: boolean, alpha: number): string {
  if (!isLight) return `rgba(255, 255, 255, ${alpha})`;
  return `rgba(0, 61, 79, ${Math.round(lightAlphaFor(alpha) * 1000) / 1000})`;
}

// Same idea for the flat near-white neutral hex some diagrams use as a "default/inactive"
// marker color (e.g. "#e5e7eb") — invisible against a light backdrop, needs a dark-slate
// equivalent instead.
export function inkHex(isLight: boolean): string {
  return isLight ? "#445a63" : "#e5e7eb";
}

// The animated diagram scenes label state (pinned/safe/dumbzone, pass/fail, etc.) with
// pastel-300/200 Tailwind text colors sitting directly on the page background — readable
// on the dark wave backdrop, but too low-contrast on light mist. Same hue, darker shade
// in light mode, so the state's meaning (color) stays intact and legible in both themes.
// Literal class strings (not template-interpolated) so Tailwind's scanner picks them up —
// same reasoning as lib/accent.ts's ACCENT_BG/TEXT/BORDER maps.
export type ToneHue = "blue" | "emerald" | "orange" | "amber" | "violet";

const TONE_TEXT: Record<ToneHue, { dark: string; light: string }> = {
  blue: { dark: "text-blue-300", light: "text-blue-700" },
  emerald: { dark: "text-emerald-300", light: "text-emerald-700" },
  orange: { dark: "text-orange-300", light: "text-orange-700" },
  amber: { dark: "text-amber-300", light: "text-amber-700" },
  violet: { dark: "text-violet-300", light: "text-violet-700" },
};

export function toneText(isLight: boolean, hue: ToneHue): string {
  return isLight ? TONE_TEXT[hue].light : TONE_TEXT[hue].dark;
}

// Same idea as toneText, but for the diagram scenes that pick their own literal hex
// (not a Tailwind class) for a data-driven color — e.g. GuidesSensorsPipeline's per-stage
// STAGES colors, NestedLayers' per-layer colors. Each of these read fine as text at full
// saturation on the dark wave background (contrast 4.3-7:1) but drop to 1.5-2.4:1 on light
// mist — measured, not assumed. Darkened, same-hue replacements below restore >4.5:1.
// Falls through to the original hex for any color not in the map (e.g. already-dark hues,
// or decorative fills/borders that don't need the swap).
const DIAGRAM_TEXT_HEX_LIGHT: Record<string, string> = {
  "#a78bfa": "#7448f7", // violet
  "#4ade80": "#177d3c", // green
  "#fb923c": "#b15204", // orange
  "#fde68a": "#836902", // pale yellow
  "#fbbf24": "#8a5a05", // amber
};

export function diagramTextHex(hex: string, isLight: boolean): string {
  if (!isLight) return hex;
  return DIAGRAM_TEXT_HEX_LIGHT[hex] ?? hex;
}
