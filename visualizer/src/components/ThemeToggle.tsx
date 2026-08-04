import { useTheme } from "../lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { isLight, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition-colors hover:border-ink/25 hover:text-ink/90 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        {isLight ? (
          <>
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
          </>
        ) : (
          <path d="M20.5 14.5a8.5 8.5 0 1 1-9-13 7 7 0 0 0 9 13Z" />
        )}
      </svg>
    </button>
  );
}
