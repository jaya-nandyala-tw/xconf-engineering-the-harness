import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UseBeatsOptions {
  total: number;
  onExit?: () => void;
  // Fires instead of a no-op when → is pressed while already on the last beat — lets a
  // scene chain straight into the next one in a sequence without detouring through the menu.
  onPastEnd?: () => void;
}

export function useBeats({ total, onExit, onPastEnd }: UseBeatsOptions) {
  const [beat, setBeat] = useState(0);
  const navigate = useNavigate();

  const next = useCallback(() => {
    setBeat((b) => {
      if (b >= total - 1) {
        onPastEnd?.();
        return b;
      }
      return b + 1;
    });
  }, [total, onPastEnd]);

  const prev = useCallback(() => {
    setBeat((b) => Math.max(b - 1, 0));
  }, []);

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
