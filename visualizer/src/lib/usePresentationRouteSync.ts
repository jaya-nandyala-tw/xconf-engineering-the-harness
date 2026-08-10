import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onSyncMessage, postSyncMessage } from "./presentationSync";

// Mounted once at the app root. Keeps the URL itself in sync across the Presenter/Audience
// window pair — scene-to-scene navigation, Gallery clicks, Escape-to-home, anything that
// changes location. Beat-level sync (the sub-step within a scene) is handled separately in
// useBeats, since that state never reaches the URL.
export function usePresentationRouteSync(): void {
  const location = useLocation();
  const navigate = useNavigate();

  // Set right before a remote "nav" message drives our own navigate() call, so the
  // resulting location-change effect below knows not to broadcast it right back out —
  // without this, the two windows would volley the same navigation back and forth forever.
  const applyingRemote = useRef(false);

  useEffect(() => {
    if (applyingRemote.current) {
      applyingRemote.current = false;
      return;
    }
    postSyncMessage({ type: "nav", pathname: location.pathname, search: location.search });
  }, [location.pathname, location.search]);

  useEffect(() => {
    return onSyncMessage((message) => {
      if (message.type !== "nav") return;
      if (message.pathname === location.pathname && message.search === location.search) return;
      applyingRemote.current = true;
      navigate({ pathname: message.pathname, search: message.search });
    });
    // Resubscribed whenever location changes so the closure's "current location" (used to
    // decide whether an incoming nav is actually new) never goes stale.
  }, [location.pathname, location.search, navigate]);
}
