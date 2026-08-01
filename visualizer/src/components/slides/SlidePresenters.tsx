import { motion } from "framer-motion";
import type { PresentersContent } from "../../content/deck";
import { accentForIndex, ACCENT_BG, ACCENT_BORDER } from "../../lib/accent";
import { Icon } from "./Icon";

function PhotoSlot({ photo, accent }: { photo?: string; accent: ReturnType<typeof accentForIndex> }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        className={`h-28 w-28 shrink-0 rounded-full border-2 object-cover ${ACCENT_BORDER[accent]}`}
      />
    );
  }
  return (
    <div
      className={`flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed bg-white/[0.03] text-white/30 ${ACCENT_BORDER[accent]}`}
    >
      <Icon name="person" className="h-9 w-9" />
      <span className="text-[9px] uppercase tracking-[0.1em]">Photo pending</span>
    </div>
  );
}

export function SlidePresenters({ content }: { content: PresentersContent }) {
  return (
    <div className="flex w-full max-w-6xl flex-col items-center gap-10 text-center">
      <p className="text-base uppercase tracking-[0.3em] text-white/40">Your presenters</p>
      <div className={`grid w-full gap-8 ${content.people.length > 1 ? "sm:grid-cols-2" : "max-w-xl"}`}>
        {content.people.map((person, i) => {
          const accent = accentForIndex(i);
          return (
            <motion.div
              key={person.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative flex items-center gap-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-left"
            >
              <span className={`absolute inset-x-0 top-0 h-1 ${ACCENT_BG[accent]}`} />
              <PhotoSlot photo={person.photo} accent={accent} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl font-bold leading-tight text-white">{person.name}</p>
                <p className="mt-1 text-base text-white/50">{person.title}</p>
                <div className="my-3 h-px w-full bg-white/10" />
                <p className="text-base leading-relaxed text-white/70">{person.bio}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
