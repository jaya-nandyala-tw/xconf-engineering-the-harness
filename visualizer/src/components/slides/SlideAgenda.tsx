import { motion } from "framer-motion";
import type { AgendaContent } from "../../content/deck";
import { accentForIndex, ACCENT_BG } from "../../lib/accent";
import { Icon } from "./Icon";

export function SlideAgenda({ content, revealCount }: { content: AgendaContent; revealCount: number }) {
  return (
    <div className="grid w-full max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
      {content.items.map((item, i) => {
        const visible = i < revealCount;
        const accent = accentForIndex(i);
        return (
          <motion.div
            key={item.label}
            initial={false}
            animate={{ opacity: visible ? 1 : 0.15, y: visible ? 0 : 8, scale: visible ? 1 : 0.96 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 p-8 text-center"
          >
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-white ${ACCENT_BG[accent]}`}>
              <Icon name={item.icon} className="h-10 w-10" />
            </div>
            <p className="font-display text-2xl font-bold text-white">{item.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
