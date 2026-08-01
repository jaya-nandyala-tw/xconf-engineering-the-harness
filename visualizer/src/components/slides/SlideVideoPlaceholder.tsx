import { motion } from "framer-motion";
import type { VideoPlaceholderContent } from "../../content/deck";
import { Icon } from "./Icon";

// revealCount counts calloutsShown + 1 (beat 0 is the setup line alone).
export function SlideVideoPlaceholder({
  content,
  revealCount,
}: {
  content: VideoPlaceholderContent;
  revealCount: number;
}) {
  const calloutsShown = Math.max(0, revealCount - 1);
  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-8 text-center">
      <h1 className="font-display text-5xl font-bold text-white">{content.heading}</h1>
      <p className="max-w-xl text-xl text-white/60">{content.setupLine}</p>

      {content.src ? (
        <video src={content.src} controls className="w-full rounded-2xl border border-white/10" />
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02]">
          <Icon name="video" className="h-12 w-12 text-white/25" />
          <p className="text-base uppercase tracking-[0.2em] text-white/30">Clip not yet recorded</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {content.callouts.map((callout, i) => (
          <motion.p
            key={callout}
            initial={false}
            animate={{ opacity: i < calloutsShown ? 1 : 0.1 }}
            transition={{ duration: 0.35 }}
            className="rounded-full border border-white/15 px-5 py-2 text-base text-white/80"
          >
            {callout}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
