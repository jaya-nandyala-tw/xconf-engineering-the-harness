import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  // Read synchronously in `next` instead of inside the setBeat updater — calling
  // onPastEnd (often a router navigate(), itself a setState) from inside another
  // component's state updater trips React's "setState while rendering a different
  // component" warning.
  const beatRef = useRef(beat);
  beatRef.current = beat;

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
