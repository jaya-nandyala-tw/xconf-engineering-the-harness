import { useLocation, useNavigate } from "react-router-dom";
import { getNextTarget, getPrevTarget } from "./deckNav";

interface ArrivalState {
  // Set when navigating here via ← from the next scene — see onPastStart below.
  fromEnd?: boolean;
}

// Turns "position in the master DECK sequence" into the onPastEnd/onPastStart/nextHref
// props useBeats and SceneChrome already know how to consume — see the plan doc for why
// this generalizes the Context Rot trio's existing chaining instead of replacing it.
//
// `total` is this scene's own beat count — needed so backing in from the *next* scene
// can land on the last beat instead of always restarting at 0.
export function useSceneNav(deckId: string, total = 1) {
  const navigate = useNavigate();
  const location = useLocation();
  const nextTarget = getNextTarget(deckId);
  const prevTarget = getPrevTarget(deckId);

  const state = location.state as ArrivalState | null;
  const initialBeat = state?.fromEnd ? Math.max(total - 1, 0) : 0;

  return {
    initialBeat,
    onPastEnd: nextTarget ? () => navigate(nextTarget.href) : undefined,
    onPastStart: prevTarget
      ? () => navigate(prevTarget.href, { state: { fromEnd: true } satisfies ArrivalState })
      : undefined,
    nextHref: nextTarget?.href,
    nextLabel: nextTarget?.label,
  };
}
