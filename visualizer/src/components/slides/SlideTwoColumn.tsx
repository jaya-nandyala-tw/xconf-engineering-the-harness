import type { TwoColumnContent } from "../../content/deck";

export function SlideTwoColumn({ content }: { content: TwoColumnContent }) {
  return (
    <div className="w-full max-w-5xl">
      <h1 className="font-display mb-10 text-center text-5xl font-bold text-ink">{content.heading}</h1>
      <div className="flex items-center gap-6">
        <div className="flex-1 rounded-2xl border border-ink/10 bg-ink/[0.03] p-9 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/40">{content.left.label}</p>
          <p className="mt-4 text-2xl leading-snug text-ink/80">{content.left.body}</p>
        </div>
        <span className="font-display text-4xl text-ink/30">→</span>
        <div className="flex-1 rounded-2xl border border-flamingo/40 bg-flamingo/10 p-9 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-flamingo">{content.right.label}</p>
          <p className="mt-4 text-2xl leading-snug text-ink/90">{content.right.body}</p>
        </div>
      </div>
    </div>
  );
}
