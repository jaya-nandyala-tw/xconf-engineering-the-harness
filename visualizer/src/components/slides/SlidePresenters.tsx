import { motion } from "framer-motion";
import type { PresentersContent } from "../../content/deck";
import { accentForIndex, ACCENT_BORDER } from "../../lib/accent";
import { Icon } from "./Icon";

function PhotoSlot({ photo, accent }: { photo?: string; accent: ReturnType<typeof accentForIndex> }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        className={`h-24 w-24 rounded-full border-2 object-cover ${ACCENT_BORDER[accent]}`}
      />
    );
  }
  return (
    <div
      className={`flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed bg-white/[0.03] text-white/30 ${ACCENT_BORDER[accent]}`}
    >
      <Icon name="person" className="h-8 w-8" />
      <span className="text-[9px] uppercase tracking-[0.1em]">Photo pending</span>
    </div>
  );
}

export function SlidePresenters({ content }: { content: PresentersContent }) {
  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-10 text-center">
      <p className="text-base uppercase tracking-[0.3em] text-white/40">Your presenters</p>
      <div className={`grid w-full gap-6 ${content.people.length > 1 ? "sm:grid-cols-2" : "max-w-sm"}`}>
        {content.people.map((person, i) => (
          <motion.div
            key={person.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8"
          >
            <PhotoSlot photo={person.photo} accent={accentForIndex(i)} />
            <div>
              <p className="font-display text-3xl font-bold text-white">{person.name}</p>
              <p className="mt-1 text-lg text-white/50">{person.title}</p>
            </div>
            <p className="text-lg leading-snug text-white/70">{person.bio}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
