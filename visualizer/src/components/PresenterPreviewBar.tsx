import { formatMinSec, sectionPlannedStartSeconds, sectionTimeLabel, useCurrentSection } from "../lib/deckNav";
import { useTalkTimer } from "../lib/talkTimer";

// Anything within this many seconds either way reads as "on pace" rather than a false-alarm
// ahead/behind badge for drift too small to act on.
const ON_PACE_THRESHOLD_SECONDS = 15;

export function PresenterPreviewBar() {
  const section = useCurrentSection();
  const { elapsedSeconds, isRunning, start, pause, reset } = useTalkTimer();

  const plannedStart = section ? sectionPlannedStartSeconds(section.id) : 0;
  const deltaSeconds = elapsedSeconds - plannedStart;

  let paceLabel = "On pace";
  let paceClass = "text-ink/50";
  if (Math.abs(deltaSeconds) > ON_PACE_THRESHOLD_SECONDS) {
    if (deltaSeconds > 0) {
      paceLabel = `▲ ${formatMinSec(deltaSeconds)} behind`;
      paceClass = "text-flamingo";
    } else {
      paceLabel = `▼ ${formatMinSec(-deltaSeconds)} ahead`;
      paceClass = "text-jade";
    }
  }

  return (
    <div className="flex items-center justify-between gap-6 border-b border-ink/10 bg-ink/[0.03] px-8 py-2 text-xs">
      <div className="flex min-w-0 items-center gap-4 text-ink/70">
        {section ? (
          <>
            <span className="font-semibold text-ink/90">
              {String(section.id).padStart(2, "0")} · {section.title}
            </span>
            <span className="text-ink/40">Presenter: {section.presenter}</span>
            <span className="text-ink/40">Planned {sectionTimeLabel(section)}</span>
          </>
        ) : (
          <span className="text-ink/40">No section metadata for this slide</span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className={`font-semibold tabular-nums ${paceClass}`}>{paceLabel}</span>
        <span className="tabular-nums text-ink/70">Elapsed {formatMinSec(elapsedSeconds)}</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={isRunning ? pause : start}
            className="rounded-full border border-ink/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/60 transition-colors hover:border-ink/30 hover:text-ink/90"
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-ink/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/60 transition-colors hover:border-ink/30 hover:text-ink/90"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
