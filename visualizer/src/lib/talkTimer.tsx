import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "xconf-talk-timer";

interface TimerState {
  // Wall-clock timestamp (ms) the clock was last (re)started, or null while paused/stopped.
  startedAt: number | null;
  // Accumulated elapsed seconds from all previous running spans.
  pausedElapsed: number;
}

interface TalkTimerContextValue {
  elapsedSeconds: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

const TalkTimerContext = createContext<TalkTimerContextValue | null>(null);

// Session-scoped (not localStorage) so each new tab/browser session starts the countdown
// clean by default — you don't have to remember to reset it before a fresh rehearsal — but
// a mid-rehearsal refresh doesn't lose elapsed time.
function readStoredState(): TimerState {
  if (typeof window === "undefined") return { startedAt: null, pausedElapsed: 0 };
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return { startedAt: null, pausedElapsed: 0 };
  try {
    const parsed = JSON.parse(raw);
    return { startedAt: parsed.startedAt ?? null, pausedElapsed: parsed.pausedElapsed ?? 0 };
  } catch {
    return { startedAt: null, pausedElapsed: 0 };
  }
}

export function TalkTimerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TimerState>(readStoredState);
  // Bumped once a second while running, purely to force elapsedSeconds (computed from
  // Date.now(), not incremented) to recompute and stay live on screen.
  const [tick, forceTick] = useState(0);

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.startedAt == null) return;
    const id = window.setInterval(() => forceTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [state.startedAt]);

  const value = useMemo<TalkTimerContextValue>(() => {
    const isRunning = state.startedAt != null;
    const elapsedSeconds = state.pausedElapsed + (isRunning ? (Date.now() - state.startedAt!) / 1000 : 0);

    return {
      elapsedSeconds,
      isRunning,
      start: () =>
        setState((s) => (s.startedAt != null ? s : { startedAt: Date.now(), pausedElapsed: s.pausedElapsed })),
      pause: () =>
        setState((s) =>
          s.startedAt == null
            ? s
            : { startedAt: null, pausedElapsed: s.pausedElapsed + (Date.now() - s.startedAt) / 1000 },
        ),
      reset: () => setState({ startedAt: null, pausedElapsed: 0 }),
    };
    // `tick` is a deliberate dependency, not dead code — it forces elapsedSeconds to
    // recompute every second even though `state` itself doesn't change while running.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, tick]);

  return <TalkTimerContext.Provider value={value}>{children}</TalkTimerContext.Provider>;
}

export function useTalkTimer(): TalkTimerContextValue {
  const ctx = useContext(TalkTimerContext);
  if (!ctx) throw new Error("useTalkTimer must be used within a TalkTimerProvider");
  return ctx;
}
