import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type PresentationMode = "slideshow" | "presenter";

const STORAGE_KEY = "xconf-mode";

interface PresentationModeContextValue {
  mode: PresentationMode;
  isPresenterMode: boolean;
  setMode: (mode: PresentationMode) => void;
}

const PresentationModeContext = createContext<PresentationModeContextValue | null>(null);

// Set on the popup URL when Presenter View opens the Audience window (?mode=audience) —
// takes priority over localStorage so a stale "presenter" value saved from a previous
// single-window session can never leak presenter-only UI into the audience screen. Read
// once at module load, not per-render: it describes how *this window* was opened, which
// doesn't change over its lifetime.
const modeOverride = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("mode");
const isAudienceWindow = modeOverride === "audience";

function readStoredMode(): PresentationMode {
  if (isAudienceWindow) return "slideshow";
  if (typeof window === "undefined") return "slideshow";
  return window.localStorage.getItem(STORAGE_KEY) === "presenter" ? "presenter" : "slideshow";
}

export function PresentationModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PresentationMode>(readStoredMode);

  useEffect(() => {
    // The audience window never persists its mode — it's always forced to slideshow by the
    // URL, and would otherwise clobber whatever the presenter's own window last saved.
    if (isAudienceWindow) return;
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo<PresentationModeContextValue>(
    () => ({
      mode,
      isPresenterMode: mode === "presenter",
      // No-op on the audience window — nothing in this app calls setMode there today, but
      // this is the one guarantee that actually matters: presenter-only UI (the pace bar,
      // speaker notes) can never end up on the audience screen no matter what calls this.
      setMode: isAudienceWindow ? () => {} : setMode,
    }),
    [mode],
  );

  return <PresentationModeContext.Provider value={value}>{children}</PresentationModeContext.Provider>;
}

export function usePresentationMode(): PresentationModeContextValue {
  const ctx = useContext(PresentationModeContext);
  if (!ctx) throw new Error("usePresentationMode must be used within a PresentationModeProvider");
  return ctx;
}
