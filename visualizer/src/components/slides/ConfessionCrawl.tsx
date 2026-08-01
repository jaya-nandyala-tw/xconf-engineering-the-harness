import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ConfessionCrawlContent } from "../../content/deck";

const LINE_DURATION_MS = 4500;

// Auto-advances on a timer (no narration per 03-demo-recording-script.md) — → / Esc still
// work via useBeats' own keydown listener, so a presenter can skip ahead if it runs long.
export function ConfessionCrawl({
  content,
  beat,
  next,
}: {
  content: ConfessionCrawlContent;
  beat: number;
  next: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(next, LINE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [beat, next]);

  return (
    <div className="flex h-40 w-full max-w-3xl items-center justify-center text-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={beat}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl font-bold text-white/90 sm:text-4xl"
        >
          {content.lines[beat]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
