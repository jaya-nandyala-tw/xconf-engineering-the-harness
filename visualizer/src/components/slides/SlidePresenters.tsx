import { motion } from "framer-motion";
import type { PresentersContent } from "../../content/deck";
import { accentForIndex, ACCENT_BORDER, ACCENT_TEXT } from "../../lib/accent";
import { Icon } from "./Icon";

function PhotoSlot({ photo, accent }: { photo?: string; accent: ReturnType<typeof accentForIndex> }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        className={`h-56 w-56 shrink-0 rounded-full border-4 object-cover sm:h-64 sm:w-64 ${ACCENT_BORDER[accent]}`}
      />
    );
  }
  return (
    <div
      className={`flex h-56 w-56 shrink-0 flex-col items-center justify-center gap-2 rounded-full border-4 border-dashed bg-ink/[0.03] text-ink/30 sm:h-64 sm:w-64 ${ACCENT_BORDER[accent]}`}
    >
      <Icon name="person" className="h-16 w-16" />
      <span className="text-xs uppercase tracking-[0.1em]">Photo pending</span>
    </div>
  );
}

// One presenter, stacked photo-first — a "hero card" rather than the old cramped
// photo+text row, since a bigger circular photo reads better centered above the name
// than squeezed beside three lines of text.
function PresenterCard({
  person,
  accent,
  delay,
}: {
  person: PresentersContent["people"][number];
  accent: ReturnType<typeof accentForIndex>;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex w-full max-w-lg flex-1 flex-col items-center gap-5 text-center"
    >
      <PhotoSlot photo={person.photo} accent={accent} />
      <div className="flex flex-col items-center gap-1.5">
        <p className="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">{person.name}</p>
        <p className={`text-base font-semibold uppercase tracking-[0.15em] ${ACCENT_TEXT[accent]}`}>
          {person.title}
        </p>
      </div>
      <p className="text-lg leading-relaxed text-ink/70">{person.bio}</p>
    </motion.div>
  );
}

// Single beat, not two — this is the fast-moving open (section 1 is a 1.5-minute
// name-check, not a lingering bio read), so both presenters get scaled up together
// rather than costing an extra advance. The "+" between them echoes the same equation
// motif used for "A + B" statements elsewhere (e.g. S8) — two presenters, one talk.
export function SlidePresenters({ content }: { content: PresentersContent }) {
  return (
    <div className="flex w-full max-w-10xl flex-col items-center gap-10">
      <p className="text-md uppercase tracking-[0.3em] text-ink/40 mb-8">Your presenters</p>
      {content.people.length > 1 ? (
        <div className="flex w-full items-start justify-evenly gap-10">
          <PresenterCard person={content.people[0]} accent={accentForIndex(0)} delay={0} />
          <PresenterCard person={content.people[1]} accent={accentForIndex(1)} delay={0.15} />
        </div>
      ) : (
        <PresenterCard person={content.people[0]} accent={accentForIndex(0)} delay={0} />
      )}
    </div>
  );
}
