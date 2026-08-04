import { motion } from "framer-motion";
import type { StatementContent } from "../../content/deck";
import { Icon } from "./Icon";

// A clause can itself carry a "\n" for a forced line break (e.g. S8's first clause
// breaking before "the context it gets") — rendered as stacked spans, not a <br/>
// string, so leading/trailing whitespace around the break can't sneak in.
function Clause({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </>
  );
}

// "A + B" statements (e.g. S8's root-cause line) stack as three centered lines with
// the "+" on its own line in flamingo, instead of wrapping as one dense paragraph.
function PlusTitle({ title }: { title: string }) {
  const parts = title.split(" + ");
  if (parts.length !== 2) {
    return <h1 className="font-display text-6xl font-bold leading-tight text-ink sm:text-7xl">{title}</h1>;
  }
  return (
    <h1 className="font-display flex flex-col items-center gap-3 text-5xl font-bold leading-tight text-ink sm:text-6xl">
      <Clause text={parts[0]} />
      <span className="text-flamingo text-6xl sm:text-7xl">+</span>
      <Clause text={parts[1]} />
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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-ink/15 bg-ink/[0.04] text-ink/70">
          <Icon name={content.icon} className="h-8 w-8" />
        </div>
      )}
      {content.eyebrow && <p className="text-base uppercase tracking-[0.3em] text-ink/40">{content.eyebrow}</p>}
      {content.highlightPlus ? (
        <PlusTitle title={content.title} />
      ) : (
        <h1 className="font-display text-6xl font-bold leading-tight text-ink sm:text-7xl">{content.title}</h1>
      )}
      {content.subtitle && <p className="max-w-2xl text-2xl text-ink/60">{content.subtitle}</p>}
    </motion.div>
  );
}
