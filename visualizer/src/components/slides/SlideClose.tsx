import { motion } from "framer-motion";
import type { CloseContent } from "../../content/deck";
import { Icon } from "./Icon";

export function SlideClose({ content }: { content: CloseContent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex w-full max-w-5xl items-center justify-between gap-12"
    >
      <div className="flex-1 text-left">
        {content.icon && (
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-ink/15 bg-ink/[0.04] text-ink/70">
            <Icon name={content.icon} className="h-8 w-8" />
          </div>
        )}
        <p className="font-display text-5xl font-bold leading-tight text-ink sm:text-6xl">“{content.quote}”</p>
        <p className="mt-6 max-w-xl text-2xl text-ink/60">{content.recapLine}</p>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-2">
        <div className="flex h-36 w-36 items-center justify-center rounded-xl border-2 border-dashed border-ink/20 bg-ink/[0.03]">
          <span className="text-sm uppercase tracking-[0.15em] text-ink/30">
            {content.qrUrl ? "QR" : "QR TBD"}
          </span>
        </div>
        <p className="text-sm text-ink/30">Takeaway checklist</p>
      </div>
    </motion.div>
  );
}
