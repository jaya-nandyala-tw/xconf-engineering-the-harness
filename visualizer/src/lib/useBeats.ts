import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onSyncMessage, postSyncMessage } from "./presentationSync";

interface UseBeatsOptions {
  total: number;
  // Which beat to mount on — non-zero when arriving here via ← from the next scene in
  // the talk sequence, so backing up lands on the last beat instead of the first.
  initialBeat?: number;
  onExit?: () => void;
  // Fires instead of a no-op when → is pressed while already on the last beat — lets a
  // scene chain straight into the next one in a sequence without detouring through the menu.
  onPastEnd?: () => void;
  // Symmetric to onPastEnd: fires instead of a no-op when ← is pressed on the first beat.
  onPastStart?: () => void;
}

export function useBeats({ total, initialBeat = 0, onExit, onPastEnd, onPastStart }: UseBeatsOptions) {
  const [beat, setBeat] = useState(initialBeat);
  const navigate = useNavigate();
  const location = useLocation();

  // Read synchronously in `next` instead of inside the setBeat updater — calling
  // onPastEnd (often a router navigate(), itself a setState) from inside another
  // component's state updater trips React's "setState while rendering a different
  // component" warning.
  const beatRef = useRef(beat);
  beatRef.current = beat;

  // Beats are the one piece of presentation state that never reaches the URL (unlike scene
  // changes, which react-router already tracks) — broadcast/apply them explicitly so the
  // Presenter/Audience window pair stays in lockstep step-for-step, not just scene-for-scene.
  // Same "skip the echo" guard as the route-sync hook: set right before a remote message
  // drives our own setBeat, so that resulting change doesn't get broadcast right back out.
  const applyingRemoteBeat = useRef(false);

  useEffect(() => {
    if (applyingRemoteBeat.current) {
      applyingRemoteBeat.current = false;
      return;
    }
    postSyncMessage({ type: "beat", pathname: location.pathname, beat });
    // location.pathname intentionally omitted from deps — a pathname change means a
    // different scene entirely (this instance is about to unmount), not a beat to send.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat]);

  useEffect(() => {
    return onSyncMessage((message) => {
      if (message.type !== "beat") return;
      if (message.pathname !== location.pathname) return;
      if (message.beat === beatRef.current) return;
      applyingRemoteBeat.current = true;
      setBeat(message.beat);
    });
  }, [location.pathname]);

  const next = useCallback(() => {
    if (beatRef.current >= total - 1) {
      onPastEnd?.();
      return;
    }
    setBeat((b) => b + 1);
  }, [total, onPastEnd]);

  const prev = useCallback(() => {
    if (beatRef.current <= 0) {
      onPastStart?.();
      return;
    }
    setBeat((b) => b - 1);
  }, [onPastStart]);

  const restart = useCallback(() => setBeat(0), []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "Enter":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "r":
        case "R":
          restart();
          break;
        case "Escape":
          if (onExit) onExit();
          else navigate("/");
          break;
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev, restart, navigate, onExit]);

  return { beat, next, prev, restart, isFirst: beat === 0, isLast: beat === total - 1 };
}
