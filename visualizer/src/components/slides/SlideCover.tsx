import { motion } from "framer-motion";
import type { CoverContent } from "../../content/deck";

export function SlideCover({ content }: { content: CoverContent }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex w-full max-w-5xl flex-col items-center gap-6"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-base uppercase tracking-[0.3em] text-ink/40">{content.eyebrow}</p>
          <h1 className="font-display whitespace-nowrap text-6xl font-bold leading-tight text-ink sm:text-7xl">
            {content.title}
          </h1>
          {content.subtitle && <p className="max-w-2xl text-3xl text-ink/60">{content.subtitle}</p>}
        </div>
      </motion.div>
    </div>
  );
}
