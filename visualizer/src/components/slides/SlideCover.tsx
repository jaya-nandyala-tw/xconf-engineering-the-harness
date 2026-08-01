import { motion } from "framer-motion";
import type { CoverContent } from "../../content/deck";

export function SlideCover({ content }: { content: CoverContent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex max-w-4xl flex-col items-center gap-6 text-center"
    >
      <p className="text-base uppercase tracking-[0.3em] text-white/40">{content.eyebrow}</p>
      <h1 className="font-display text-7xl font-bold leading-tight text-white sm:text-8xl">{content.title}</h1>
      {content.subtitle && <p className="max-w-2xl text-3xl text-white/60">{content.subtitle}</p>}
    </motion.div>
  );
}
