import { motion } from "framer-motion";
import type { DividerContent } from "../../content/deck";
import { ACCENT_BG } from "../../lib/accent";

// A chapter card between major sections — solid accent color bar + big title, matching
// the real slide template's own "Section divider" convention, so a topic switch reads
// as an intentional chapter break instead of an unexplained jump in content.
export function SlideDivider({ content }: { content: DividerContent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex w-full max-w-4xl flex-col items-center gap-6 text-center"
    >
      <div className={`h-1.5 w-24 rounded-full ${ACCENT_BG[content.accent]}`} />
      <h1 className="font-display text-6xl font-bold leading-tight text-white sm:text-7xl">{content.title}</h1>
      {content.subtitle && <p className="max-w-2xl text-2xl text-white/60">{content.subtitle}</p>}
    </motion.div>
  );
}
