import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BeatIndicator } from "./BeatIndicator";
import thoughtworksLogo from "../assets/brand/thoughtworks-wordmark-light.png";

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
  // Deep-links this scene to the next one in a sequence (e.g. Context Rot's Problem ->
  // Solution 1 -> Solution 2). Only rendered on the last beat, alongside the keyboard
  // hint that -> also chains forward via useBeats' onPastEnd.
  nextHref?: string;
  nextLabel?: string;
}

export function SceneChrome({
  label,
  totalBeats,
  currentBeat,
  caption,
  children,
  sidebar,
  nextHref,
  nextLabel,
}: SceneChromeProps) {
  const isLast = currentBeat === totalBeats - 1;
  return (
    <div className="relative flex h-screen w-screen bg-wave text-white overflow-hidden">
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-8 pt-6 text-xs uppercase tracking-[0.2em] text-white/40">
          <Link to="/" className="hover:text-white/70 transition-colors">
            ← gallery
          </Link>
          <span>{label}</span>
          <span>
            {currentBeat + 1} / {totalBeats}
          </span>
        </header>

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
                  className="font-display text-5xl font-bold leading-tight text-white/90"
                >
                  {caption}
                </motion.p>
              </AnimatePresence>
            </div>
          )}
          <BeatIndicator total={totalBeats} current={currentBeat} />

          {isLast && nextHref ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Link
                to={nextHref}
                className="rounded-full border border-white/20 bg-white/[0.04] px-5 py-2 text-xs uppercase tracking-[0.15em] text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                {nextLabel ?? "Next →"}
              </Link>
            </motion.div>
          ) : null}

          <p className="text-[11px] uppercase tracking-[0.15em] text-white/30">
            {isLast && nextHref
              ? <>→ / space next flow &nbsp;·&nbsp; ← back &nbsp;·&nbsp; r restart &nbsp;·&nbsp; esc gallery</>
              : <>→ / space next &nbsp;·&nbsp; ← back &nbsp;·&nbsp; r restart &nbsp;·&nbsp; esc gallery</>}
          </p>
        </footer>

        <div className="pointer-events-none absolute bottom-6 left-8 flex items-center gap-3 opacity-80">
          <img src={thoughtworksLogo} alt="Thoughtworks" className="h-4 w-auto" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">XConf 2026</span>
        </div>
      </div>

      {sidebar && (
        <div className="h-full w-80 shrink-0 border-l border-white/10 bg-white/[0.015] p-4">
          {sidebar}
        </div>
      )}
    </div>
  );
}
