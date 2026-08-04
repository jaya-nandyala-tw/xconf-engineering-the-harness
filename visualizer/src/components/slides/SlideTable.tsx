import type { TableContent } from "../../content/deck";

export function SlideTable({ content }: { content: TableContent }) {
  return (
    <div className="w-full max-w-5xl">
      <h1 className="font-display mb-8 text-5xl font-bold text-ink">{content.heading}</h1>
      <div className="flex gap-4 text-sm uppercase tracking-[0.15em] text-ink/40">
        {content.columns.map((col, i) => (
          <span key={col} className={i === 0 ? "w-1/3" : "flex-1"}>
            {col}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-col">
        {content.rows.map((row) => (
          <div key={row[0]} className="flex items-baseline gap-4 border-b border-dotted border-ink/15 py-5">
            {row.map((cell, i) => (
              <span
                key={i}
                className={
                  i === 0
                    ? "w-1/3 text-xl font-semibold text-ink"
                    : "flex-1 text-lg leading-snug text-ink/70"
                }
              >
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
