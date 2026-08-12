import { motion } from "framer-motion";
import type { ListContent } from "../../content/deck";

function Marker({ style, index }: { style: ListContent["style"]; index: number }) {
  if (style === "numbered") {
    return (
      <span className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-turmeric text-lg font-bold text-white">
        {index + 1}
      </span>
    );
  }
  if (style === "check") {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ink/25 text-lg text-ink/50">
        {index + 1}
      </span>
    );
  }
  return <span className="mt-4 h-3 w-3 shrink-0 rounded-full bg-ink/40" />;
}

export function SlideList({ content, revealCount }: { content: ListContent; revealCount: number }) {
  return (
    <div className="w-full max-w-5xl">
      <h1 className="font-display mb-3 text-6xl font-bold text-ink">{content.heading}</h1>
      {content.subheading && <p className="mb-8 text-2xl text-ink/50">{content.subheading}</p>}
      <ul className="mt-8 flex flex-col gap-7">
        {content.items.map((item, i) => {
          const visible = i < revealCount;
          return (
            <motion.li
              key={item}
              initial={false}
              animate={{ opacity: visible ? 1 : 0.12, x: visible ? 0 : -6 }}
              transition={{ duration: 0.35 }}
              className="flex items-start gap-4 text-left"
            >
              <Marker style={content.style} index={i} />
              <span className="text-3xl leading-snug text-ink/90">{item}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
