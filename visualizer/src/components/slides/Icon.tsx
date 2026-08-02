export type IconName =
  | "layers"
  | "compass"
  | "loop"
  | "checklist"
  | "flag"
  | "video"
  | "sparkle"
  | "lock"
  | "map"
  | "person"
  | "folder";

const PATHS: Record<IconName, React.ReactNode> = {
  layers: (
    <>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m14.5 9.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  loop: (
    <>
      <path d="M4 12a8 8 0 0 1 14.5-4.7M20 12a8 8 0 0 1-14.5 4.7" />
      <path d="M18.5 3v4.3H14.2M5.5 21v-4.3h4.3" />
    </>
  ),
  checklist: (
    <>
      <path d="m4 7 2 2 3-3" />
      <path d="M11 7h9" />
      <path d="m4 14 2 2 3-3" />
      <path d="M11 14h9" />
    </>
  ),
  flag: (
    <>
      <path d="M5 3v18" />
      <path d="M5 4h13l-3 4.5L18 13H5" />
    </>
  ),
  video: (
    <>
      <rect x="2.5" y="5" width="14" height="14" rx="2.5" />
      <path d="m21.5 8-5 3 5 3V8Z" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
      <path d="m5 5 3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  map: (
    <>
      <path d="M9 3v15M15 6v15" />
      <path d="M3 5.5 9 3l6 3 6-2.5v15.5L15 21l-6-3-6 2.5V5.5Z" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </>
  ),
  folder: <path d="M3 6.5a1.5 1.5 0 0 1 1.5-1.5h4l2 2h9a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5Z" />,
};

export function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
