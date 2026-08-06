import type { StatementContent } from "../../../content/deck";

interface FileChange {
  path: string;
  additions: number;
  deletions: number;
}

// Illustrative mockup data only — not a real repo/PR. Numbers are picked to read as
// "obviously too big to review", consistent with s20c's own "20 files / 1,000+ lines" stat.
const FILES: FileChange[] = [
  { path: "src/auth/session.ts", additions: 214, deletions: 88 },
  { path: "src/billing/invoice.ts", additions: 176, deletions: 52 },
  { path: "src/onboarding/wizard.tsx", additions: 301, deletions: 40 },
  { path: "src/api/routes/users.ts", additions: 98, deletions: 61 },
  { path: "src/components/Modal.tsx", additions: 45, deletions: 210 },
  { path: "migrations/2026_08_add_billing_v2.sql", additions: 88, deletions: 0 },
  { path: "tests/integration/checkout.spec.ts", additions: 132, deletions: 12 },
];

const TOTAL_FILES = 47;
const MORE_FILES = TOTAL_FILES - FILES.length;
const TOTAL_ADDITIONS = 2184;
const TOTAL_DELETIONS = 956;

// Mimics GitHub's own file-list diffstat: 5 blocks, colored green/red in proportion
// to additions vs. deletions for that file.
function DiffBar({ additions, deletions }: { additions: number; deletions: number }) {
  const total = additions + deletions;
  const greenBlocks = total === 0 ? 0 : Math.max(1, Math.min(4, Math.round((additions / total) * 5)));
  const redBlocks = 5 - greenBlocks;
  return (
    <div className="flex shrink-0 gap-0.5">
      {Array.from({ length: greenBlocks }).map((_, i) => (
        <span key={`g${i}`} className="h-2.5 w-2.5 rounded-[2px] bg-jade" />
      ))}
      {Array.from({ length: redBlocks }).map((_, i) => (
        <span key={`r${i}`} className="h-2.5 w-2.5 rounded-[2px] bg-flamingo" />
      ))}
    </div>
  );
}

export function SlidePRDiff({ content }: { content: StatementContent }) {
  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-8 text-center">
      <div>
        {content.eyebrow && <p className="text-base uppercase tracking-[0.3em] text-ink/40">{content.eyebrow}</p>}
        <h1 className="font-display mt-2 text-5xl font-bold text-ink">{content.title}</h1>
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-ink/10 bg-ink/[0.03] text-left">
        <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-6 py-4">
          <div className="min-w-0">
            <p className="font-display truncate text-lg font-bold text-ink">
              feat: rewrite auth, billing, and onboarding flows
            </p>
            <p className="mt-1 text-sm text-ink/40">#482 opened by an agent · {TOTAL_FILES} files changed</p>
          </div>
          <div className="flex shrink-0 items-center gap-3 font-mono text-base">
            <span className="text-jade">+{TOTAL_ADDITIONS.toLocaleString()}</span>
            <span className="text-flamingo">−{TOTAL_DELETIONS.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col">
          {FILES.map((file) => (
            <div
              key={file.path}
              className="flex items-center justify-between gap-4 border-b border-dotted border-ink/10 px-6 py-3"
            >
              <code className="min-w-0 truncate text-sm text-ink/75">{file.path}</code>
              <div className="flex shrink-0 items-center gap-3 font-mono text-xs text-ink/40">
                <span>
                  +{file.additions} −{file.deletions}
                </span>
                <DiffBar additions={file.additions} deletions={file.deletions} />
              </div>
            </div>
          ))}
          <div className="px-6 py-3 text-sm italic text-ink/35">… and {MORE_FILES} more files</div>
        </div>
      </div>

      <p className="text-base text-ink/40">Somewhere in here is the one line that breaks production.</p>
    </div>
  );
}
