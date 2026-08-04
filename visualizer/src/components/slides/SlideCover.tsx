import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CoverContent } from "../../content/deck";
import xconfMark from "../../assets/brand/xconf-mark-hero.png";

type CoverLook = "text" | "branded";

function LookToggle({ look, onToggle, className = "" }: { look: CoverLook; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full border border-ink/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] text-ink/40 transition-colors hover:border-ink/25 hover:text-ink/70 ${className}`}
    >
      {look === "text" ? "◈ XConf look" : "Aa Text look"}
    </button>
  );
}

export function SlideCover({ content }: { content: CoverContent }) {
  const [look, setLook] = useState<CoverLook>("text");
  const toggleLook = () => setLook((l) => (l === "text" ? "branded" : "text"));

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <AnimatePresence mode="wait">
        {look === "text" ? (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="flex w-full max-w-5xl flex-col items-center gap-6"
          >
            <LookToggle look={look} onToggle={toggleLook} />
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-base uppercase tracking-[0.3em] text-ink/40">{content.eyebrow}</p>
              <h1 className="font-display whitespace-nowrap text-6xl font-bold leading-tight text-ink sm:text-7xl">
                {content.title}
              </h1>
              {content.subtitle && <p className="max-w-2xl text-3xl text-ink/60">{content.subtitle}</p>}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="branded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex h-full w-full items-stretch"
          >
            <div className="flex w-1/2 flex-col items-start justify-center gap-5 py-10 pl-4 pr-10 text-left sm:pl-10">
              <LookToggle look={look} onToggle={toggleLook} />
              <p className="text-base uppercase tracking-[0.3em] text-ink/40">{content.eyebrow}</p>
              <h1 className="font-display text-5xl font-bold leading-tight text-ink sm:text-6xl">{content.title}</h1>
              {content.subtitle && <p className="max-w-md text-2xl text-ink/60">{content.subtitle}</p>}
            </div>

            <div className="relative h-full w-1/2 overflow-hidden">
              <img src={xconfMark} alt="XConf" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
