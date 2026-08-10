import type { StatementContent } from "../../../content/deck";

// Illustrative mockup only — the same fictional PR #482 shown in SlidePRDiff (s20c3),
// so this slide reads as "here's that scary diff's structured summary", not a new
// unrelated example. Mirrors the auto-pr skill's own MR/PR body template (Context,
// Summary, Changes, AC Coverage, Risk, Reviewer Checklist).
const PR = {
  title: "feat: rewrite auth, billing, and onboarding flows",
  meta: "#482 · opened by an agent",
  context: ["Jira: PROJ-482", "Blueprint: PROJ-482-blueprint.md", "Readiness: PROJ-482-readiness.md"],
  summary:
    "Rewrites session handling, invoicing, and the onboarding wizard behind one shared pipeline, replacing three separate ad-hoc flows.",
  changes: [
    "Session tokens now rotate on password change — AC-1",
    "Invoice totals recalculated server-side, not trusted from the client — AC-2",
    "Onboarding wizard resumes from the last completed step — AC-3",
  ],
  acCoverage: [
    { ac: "AC-1", test: "rotates session token on password change", status: "PASS" },
    { ac: "AC-2", test: "recomputes invoice total from line items", status: "PASS" },
    { ac: "AC-3", test: "resumes onboarding from last completed step", status: "PASS" },
  ],
  risk: {
    level: "Medium",
    note: "Session rotation could log out active users mid-rollout — shipped behind a flag; rollback is disabling the flag, no data migration.",
  },
  checklist: ["Business logic matches story ACs", "No architectural violations", "Existing sessions unaffected until rollout"],
};

function SectionLabel({ children }: { children: string }) {
  return <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/35">{children}</p>;
}

export function SlidePRSummary({ content }: { content: StatementContent }) {
  return (
    <div className="flex w-full max-w-6xl flex-col items-center gap-8 text-center">
      <div>
        {content.eyebrow && <p className="text-base uppercase tracking-[0.3em] text-ink/40">{content.eyebrow}</p>}
        <h1 className="font-display mt-2 text-6xl font-bold text-ink">{content.title}</h1>
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-ink/10 bg-ink/[0.03] text-left">
        <div className="border-b border-ink/10 px-8 py-5">
          <p className="font-display text-2xl font-bold text-ink">{PR.title}</p>
          <p className="mt-1 text-base text-ink/40">{PR.meta}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-6 px-8 py-6">
          <div className="col-span-2 flex flex-wrap gap-x-6 gap-y-1">
            {PR.context.map((line) => (
              <code key={line} className="text-sm text-ink/40">
                {line}
              </code>
            ))}
          </div>

          <div className="col-span-2">
            <SectionLabel>Summary</SectionLabel>
            <p className="mt-2 text-lg leading-snug text-ink/85">{PR.summary}</p>
          </div>

          <div>
            <SectionLabel>Changes</SectionLabel>
            <ul className="mt-2 flex flex-col gap-2">
              {PR.changes.map((change) => (
                <li key={change} className="text-base leading-snug text-ink/70">
                  {change}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionLabel>AC Coverage</SectionLabel>
            <div className="mt-2 flex flex-col gap-2">
              {PR.acCoverage.map((row) => (
                <div key={row.ac} className="flex items-baseline gap-2 text-base">
                  <span className="shrink-0 font-mono text-ink/50">{row.ac}</span>
                  <span className="truncate text-ink/70">{row.test}</span>
                  <span className="ml-auto shrink-0 font-semibold text-jade">{row.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Risk</SectionLabel>
            <p className="mt-2 text-base leading-snug text-ink/70">
              <span className="font-semibold text-turmeric">{PR.risk.level}</span> — {PR.risk.note}
            </p>
          </div>

          <div>
            <SectionLabel>Reviewer Checklist</SectionLabel>
            <ul className="mt-2 flex flex-col gap-2">
              {PR.checklist.map((item) => (
                <li key={item} className="flex items-start gap-2 text-base leading-snug text-ink/70">
                  <span className="text-jade">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="text-2xl text-ink/50">Same 6 sections, every time — traceable, not just a diff.</p>
    </div>
  );
}
