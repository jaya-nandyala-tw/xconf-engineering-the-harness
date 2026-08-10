import { motion } from "framer-motion";
import type { CloseContent } from "../../content/deck";
import { Icon } from "./Icon";

export function SlideClose({ content }: { content: CloseContent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex w-full max-w-7xl items-center gap-12"
    >
      <div className="basis-7/10 text-left">
        {content.icon && (
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-ink/15 bg-ink/[0.04] text-ink/70">
            <Icon name={content.icon} className="h-8 w-8" />
          </div>
        )}
        <p className="font-display text-5xl font-bold leading-tight text-ink sm:text-6xl">“{content.quote}”</p>
        <p className="mt-6 max-w-3xl text-3xl text-ink/60">{content.recapLine}</p>
      </div>
      <div className="flex basis-3/10 flex-col items-center justify-center gap-3 border-l border-ink/10 pl-12 text-center">
        <span className="font-display text-8xl font-bold text-ink">Q&amp;A</span>
        <p className="text-2xl text-ink/50">Questions?</p>
      </div>
    </motion.div>
  );
}
