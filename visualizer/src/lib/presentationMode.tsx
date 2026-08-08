import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type PresentationMode = "slideshow" | "presenter";

const STORAGE_KEY = "xconf-mode";

interface PresentationModeContextValue {
  mode: PresentationMode;
  isPresenterMode: boolean;
  setMode: (mode: PresentationMode) => void;
}

const PresentationModeContext = createContext<PresentationModeContextValue | null>(null);

function readStoredMode(): PresentationMode {
  if (typeof window === "undefined") return "slideshow";
  return window.localStorage.getItem(STORAGE_KEY) === "presenter" ? "presenter" : "slideshow";
}

export function PresentationModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PresentationMode>(readStoredMode);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo<PresentationModeContextValue>(
    () => ({
      mode,
      isPresenterMode: mode === "presenter",
      setMode,
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
