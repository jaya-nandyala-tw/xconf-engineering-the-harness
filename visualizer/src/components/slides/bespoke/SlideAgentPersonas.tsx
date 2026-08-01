import type { StatementContent } from "../../../content/deck";

const PERSONAS = [
  { name: "Read-only Q&A agent", allowed: ["Read", "Grep"], denied: ["Write", "Execute"] },
  { name: "Planning agent", allowed: ["Read", "Write plan"], denied: ["Execute"] },
  { name: "Execution agent", allowed: ["Read", "Write", "Execute"], denied: [] },
];

export function SlideAgentPersonas({ content }: { content: StatementContent }) {
  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-10 text-center">
      <div>
        {content.eyebrow && <p className="text-base uppercase tracking-[0.3em] text-white/40">{content.eyebrow}</p>}
        <h1 className="font-display mt-2 text-5xl font-bold text-white">{content.title}</h1>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
        {PERSONAS.map((persona) => (
          <div key={persona.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left">
            <p className="font-display text-xl font-bold text-white">{persona.name}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {persona.allowed.map((tool) => (
                <span key={tool} className="rounded-full bg-jade px-3 py-1.5 text-sm font-medium text-white">
                  {tool}
                </span>
              ))}
              {persona.denied.map((tool) => (
                <span key={tool} className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-white/30 line-through">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
