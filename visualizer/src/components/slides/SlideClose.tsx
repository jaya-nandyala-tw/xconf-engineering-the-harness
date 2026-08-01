import { motion } from "framer-motion";
import type { CloseContent } from "../../content/deck";

export function SlideClose({ content }: { content: CloseContent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex w-full max-w-5xl items-center justify-between gap-12"
    >
      <div className="flex-1 text-left">
        <p className="font-display text-5xl font-bold leading-tight text-white sm:text-6xl">“{content.quote}”</p>
        <p className="mt-6 max-w-xl text-2xl text-white/60">{content.recapLine}</p>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-2">
        <div className="flex h-36 w-36 items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/[0.03]">
          <span className="text-sm uppercase tracking-[0.15em] text-white/30">
            {content.qrUrl ? "QR" : "QR TBD"}
          </span>
        </div>
        <p className="text-sm text-white/30">Takeaway checklist</p>
      </div>
    </motion.div>
  );
}
