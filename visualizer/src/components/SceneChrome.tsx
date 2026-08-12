import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BeatIndicator } from "./BeatIndicator";
import { ThemeToggle } from "./ThemeToggle";
import { FullscreenToggle } from "./FullscreenToggle";
import { PresenterPreviewBar } from "./PresenterPreviewBar";
import { useTheme } from "../lib/theme";
import { usePresentationMode } from "../lib/presentationMode";
import thoughtworksLogoLight from "../assets/brand/thoughtworks-wordmark-light.png";
import thoughtworksLogoDark from "../assets/brand/thoughtworks-wordmark-dark.png";

interface SceneChromeProps {
  label: string;
  totalBeats: number;
  currentBeat: number;
  // Omit on slides that carry their own full layout (cover, table, close) — the
  // rotating-caption strip only makes sense for scenes built around one big statement.
  caption?: ReactNode;
  children: ReactNode;
  // Optional full-height right rail — spans the entire viewport height, independent
  // of this scene's own header/footer, instead of living inside the centered `main`
  // column. Only Context Rot uses this today; omitting it keeps every other scene's
  // layout exactly as before.
  sidebar?: ReactNode;
  // Optional full-bleed layer behind header/main/footer, spanning the whole h-screen
  // w-screen root — for scenes whose diagram is an immersive backdrop rather than a
  // boxed element inside `main` (e.g. Nested Layers' zoom). Layered at z-0 under the
  // chrome column (z-10) so header/caption/beat-indicator text stays readable on top.
  // Only Nested Layers uses this today; omitting it keeps every other scene unchanged.
  background?: ReactNode;
  // Width of the sidebar wrapper, as a Tailwind width class. Defaults to the original
  // fixed w-80 so every existing consumer (e.g. ContextRotProblem) renders unchanged —
  // only scenes that explicitly opt in get a different width.
  sidebarClassName?: string;
  // Deep-links this scene to the next one in a sequence (e.g. Context Rot's Problem ->
  // Solution 1 -> Solution 2). Only rendered on the last beat, alongside the keyboard
  // hint that -> also chains forward via useBeats' onPastEnd.
  nextHref?: string;
  nextLabel?: string;
}

// nextHref/nextLabel stay in the props type so every scene can keep passing them
// (they still document the forward-chain target), but the visual "Next" button and
// keyboard-hint row that used to render them are hidden in the live presentation view —
// audience-facing, not a rehearsal aid.
export function SceneChrome({
  label,
  totalBeats,
  currentBeat,
  caption,
  children,
  sidebar,
  sidebarClassName = "w-80",
  background,
}: SceneChromeProps) {
  const { isLight } = useTheme();
  const { isPresenterMode } = usePresentationMode();

  return (
    <div className="relative flex h-screen w-screen bg-surface text-ink overflow-hidden">
      {background && (
        <div className="absolute inset-0 z-0">
          <AnimatePresence>{background}</AnimatePresence>
        </div>
      )}
      <div className="relative z-10 flex h-full min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-8 pt-6 text-xs uppercase tracking-[0.2em] text-ink/40">
          <Link to="/" className="flex items-center gap-3 opacity-90 transition-opacity hover:opacity-100">
            <img src={isLight ? thoughtworksLogoDark : thoughtworksLogoLight} alt="Thoughtworks" className="h-7 w-auto" />
            <span className="text-[16px] leading-none tracking-[0.2em] text-ink/50">XConf 2026</span>
          </Link>
          <span className="sr-only">{label}</span>
          <div className="flex items-center gap-4">
            <span>
              {currentBeat + 1} / {totalBeats}
            </span>
            {/* Presenter's own window has no use for either — fullscreen is for the
                audience screen, and the presenter already reads dark/light off their own
                setup, not something to fiddle with mid-talk. */}
            {!isPresenterMode && <FullscreenToggle />}
            <ThemeToggle />
          </div>
        </header>

        {isPresenterMode && <PresenterPreviewBar currentBeat={currentBeat} />}

        <main className="flex min-h-0 flex-1 items-center justify-center px-12">
          {children}
        </main>

        <footer className="flex flex-col items-center gap-6 pb-10">
          {caption != null && (
            <div className="min-h-[130px] max-w-6xl px-6 text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={String(caption)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="font-display text-3xl font-bold leading-tight text-ink/90"
                >
                  {caption}
                </motion.p>
              </AnimatePresence>
            </div>
          )}
          <BeatIndicator total={totalBeats} current={currentBeat} />
        </footer>
      </div>

      {sidebar && (
        <div className={`h-full ${sidebarClassName} shrink-0 border-l border-ink/10 bg-ink/[0.015] p-4`}>
          {sidebar}
        </div>
      )}
    </div>
  );
}
