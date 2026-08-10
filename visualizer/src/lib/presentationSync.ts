// Cross-window sync for the Presenter View / Audience View split — two browser windows,
// same origin, kept in lockstep over a BroadcastChannel (no server, no shared React tree).
// Two message kinds cover everything: which route we're on (scene-to-scene, gallery
// clicks, Escape-to-home — anything that changes the URL), and which beat we're on within
// a scene (a sub-step that only ever lives in local component state, never the URL).
// Both windows run identical broadcast/apply logic, so control works symmetrically from
// either side — there's no special-cased "driver" window.

export type SyncMessage =
  | { type: "nav"; pathname: string; search: string }
  | { type: "beat"; pathname: string; beat: number };

const CHANNEL_NAME = "xconf-presentation-sync";

let channel: BroadcastChannel | null = null;

// BroadcastChannel isn't available in every environment (SSR, very old browsers) — callers
// treat a null channel as "sync is a no-op," never as an error.
function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

export function postSyncMessage(message: SyncMessage): void {
  getChannel()?.postMessage(message);
}

// Returns the unsubscribe function, matching the shape every caller needs for a
// useEffect cleanup.
export function onSyncMessage(handler: (message: SyncMessage) => void): () => void {
  const ch = getChannel();
  if (!ch) return () => {};
  const listener = (event: MessageEvent<SyncMessage>) => handler(event.data);
  ch.addEventListener("message", listener);
  return () => ch.removeEventListener("message", listener);
}

// Builds the absolute URL for a same-app route, honoring Vite's BASE_URL (the app is
// served from a subpath in production) — window.open needs a full URL, not a router path.
export function buildAppUrl(pathname: string, search: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${window.location.origin}${base}${pathname}${search}`;
}
