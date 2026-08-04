import type { StatementContent } from "../../../content/deck";

const PATHS = [
  { path: "src/api/**", loads: "api-conventions.md", match: true },
  { path: "src/components/**", loads: "component-style.md", match: true },
  { path: "infra/**", loads: "—", match: false },
];

export function SlideFilePathMatch({ content }: { content: StatementContent }) {
  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-10 text-center">
      <div>
        {content.eyebrow && <p className="text-base uppercase tracking-[0.3em] text-ink/40">{content.eyebrow}</p>}
        <h1 className="font-display mt-2 text-5xl font-bold text-ink">{content.title}</h1>
      </div>

      <div className="flex w-full flex-col gap-3">
        {PATHS.map((row) => (
          <div
            key={row.path}
            className={`flex items-center justify-between rounded-xl border px-6 py-5 ${
              row.match ? "border-flamingo/50 bg-flamingo/10" : "border-ink/10 bg-ink/[0.02] opacity-40"
            }`}
          >
            <code className="text-lg text-ink/80">{row.path}</code>
            <span className="text-ink/30">→</span>
            <code className={row.match ? "text-flamingo" : "text-ink/40"}>{row.loads}</code>
          </div>
        ))}
      </div>
      <p className="text-base text-ink/40">Editing a file under <code>src/api/</code> — only the matching guide loads.</p>
    </div>
  );
}
