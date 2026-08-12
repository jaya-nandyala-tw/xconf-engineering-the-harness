import { useLocation } from "react-router-dom";
import {
  formatMinSec,
  notesForBeat,
  sectionPlannedStartSeconds,
  sectionTimeLabel,
  useCurrentDeckItem,
  useCurrentSection,
} from "../lib/deckNav";
import { useTalkTimer } from "../lib/talkTimer";
import { buildAppUrl } from "../lib/presentationSync";

// Anything within this many seconds either way reads as "on pace" rather than a false-alarm
// ahead/behind badge for drift too small to act on.
const ON_PACE_THRESHOLD_SECONDS = 15;

// A stable target name, not "_blank" — clicking the button again focuses the existing
// window instead of spawning duplicates, and the sync in useBeats/usePresentationRouteSync
// only ever needs to talk to one audience window at a time anyway.
const AUDIENCE_WINDOW_TARGET = "xconf-audience";

function openAudienceView(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  params.set("mode", "audience");
  const url = buildAppUrl(pathname, `?${params.toString()}`);
  const { availWidth, availHeight } = window.screen;
  const win = window.open(
    url,
    AUDIENCE_WINDOW_TARGET,
    `width=${availWidth},height=${availHeight},left=0,top=0`,
  );
  win?.focus();
}

interface PresenterPreviewBarProps {
  // Which beat/step is currently on screen — threaded down from SceneChrome so notes
  // can track a scene's actual sub-steps instead of staying fixed for the whole item.
  currentBeat: number;
}

export function PresenterPreviewBar({ currentBeat }: PresenterPreviewBarProps) {
  const section = useCurrentSection();
  const deckItem = useCurrentDeckItem();
  const location = useLocation();
  const { elapsedSeconds, isRunning, start, pause, reset } = useTalkTimer();
  const notes = notesForBeat(deckItem, currentBeat);
  const noteBullets = notes == null ? [] : Array.isArray(notes) ? notes : [notes];

  const plannedStart = section ? sectionPlannedStartSeconds(section.id) : 0;
  const deltaSeconds = elapsedSeconds - plannedStart;

  let paceLabel = "On pace";
  let paceClass = "text-ink/50";
  if (Math.abs(deltaSeconds) > ON_PACE_THRESHOLD_SECONDS) {
    if (deltaSeconds > 0) {
      paceLabel = `▲ ${formatMinSec(deltaSeconds)} behind`;
      paceClass = "text-turmeric";
    } else {
      paceLabel = `▼ ${formatMinSec(-deltaSeconds)} ahead`;
      paceClass = "text-jade";
    }
  }

  return (
    <div className="border-b border-ink/10 bg-ink/[0.03] px-8 py-2 text-xs">
      <div className="flex items-center justify-between gap-6">
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
            {/* Opens (or refocuses) the audience window at wherever this window currently
                is — the two then stay in sync via BroadcastChannel (usePresentationRouteSync
                for scene changes, useBeats for steps within a scene). */}
            <button
              type="button"
              onClick={() => openAudienceView(location.pathname, location.search)}
              className="rounded-full border border-turmeric/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-turmeric transition-colors hover:border-turmeric/70"
            >
              ▣ Open Audience View
            </button>
          </div>
        </div>
      </div>

      {noteBullets.length > 0 && (
        <div className="mt-2.5 max-w-4xl rounded-lg border border-turmeric/25 bg-turmeric/[0.06] px-4 py-2.5">
          <span className="mb-1 block font-semibold uppercase tracking-[0.15em] text-turmeric/70">
            Speaker notes
          </span>
          {noteBullets.length === 1 ? (
            <p className="text-sm leading-snug text-ink/80">{noteBullets[0]}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {noteBullets.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm leading-snug text-ink/80">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-turmeric/60" />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
