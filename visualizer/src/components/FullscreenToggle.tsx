import { useEffect, useState } from "react";

// Browsers only grant fullscreen from a real in-window user gesture — a window opened via
// window.open() (the Audience View) can't be fullscreened programmatically from the
// Presenter window that spawned it, so this button is the one click that actually works.
export function FullscreenToggle({ className = "" }: { className?: string }) {
  const [isFullscreen, setIsFullscreen] = useState(() => document.fullscreenElement != null);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(document.fullscreenElement != null);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen can be denied (e.g. no user-activation left in this tick) — nothing
        // useful to do beyond leaving the button clickable to try again.
      });
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition-colors hover:border-ink/25 hover:text-ink/90 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        {isFullscreen ? (
          <path d="M9 3v3.5A2.5 2.5 0 0 1 6.5 9H3M21 9h-3.5A2.5 2.5 0 0 1 15 6.5V3M15 21v-3.5a2.5 2.5 0 0 1 2.5-2.5H21M3 15h3.5A2.5 2.5 0 0 1 9 17.5V21" />
        ) : (
          <path d="M3 9V5.5A2.5 2.5 0 0 1 5.5 3H9M15 3h3.5A2.5 2.5 0 0 1 21 5.5V9M21 15v3.5a2.5 2.5 0 0 1-2.5 2.5H15M9 21H5.5A2.5 2.5 0 0 1 3 18.5V15" />
        )}
      </svg>
    </button>
  );
}
