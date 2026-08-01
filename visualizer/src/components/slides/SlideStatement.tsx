import { motion } from "framer-motion";
import type { StatementContent } from "../../content/deck";
import { Icon } from "./Icon";

// "A + B" statements (e.g. S8's root-cause line) stack as three centered lines with
// the "+" on its own line in flamingo, instead of wrapping as one dense paragraph.
function PlusTitle({ title }: { title: string }) {
  const parts = title.split(" + ");
  if (parts.length !== 2) {
    return <h1 className="font-display text-6xl font-bold leading-tight text-white sm:text-7xl">{title}</h1>;
  }
  return (
    <h1 className="font-display flex flex-col items-center gap-3 text-5xl font-bold leading-tight text-white sm:text-6xl">
      <span>{parts[0]}</span>
      <span className="text-flamingo text-6xl sm:text-7xl">+</span>
      <span>{parts[1]}</span>
    </h1>
  );
}

export function SlideStatement({ content }: { content: StatementContent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex max-w-4xl flex-col items-center gap-6 text-center"
    >
      {content.icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] text-white/70">
          <Icon name={content.icon} className="h-8 w-8" />
        </div>
      )}
      {content.eyebrow && <p className="text-base uppercase tracking-[0.3em] text-white/40">{content.eyebrow}</p>}
      {content.highlightPlus ? (
        <PlusTitle title={content.title} />
      ) : (
        <h1 className="font-display text-6xl font-bold leading-tight text-white sm:text-7xl">{content.title}</h1>
      )}
      {content.subtitle && <p className="max-w-2xl text-2xl text-white/60">{content.subtitle}</p>}
    </motion.div>
  );
}
