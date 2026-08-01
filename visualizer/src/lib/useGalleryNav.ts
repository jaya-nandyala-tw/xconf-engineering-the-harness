import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { groupedDeck } from "./deckNav";

// Gallery is "cards in a grid," not "beats in one scene" — deliberately separate from
// useBeats. Up/Down move across sections, Left/Right move within one, Enter/Space plays.
export function useGalleryNav() {
  const groups = groupedDeck();
  const [sectionIdx, setSectionIdx] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const group = groups[sectionIdx];
      if (!group) return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setItemIdx((i) => Math.min(i + 1, group.items.length - 1));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setItemIdx((i) => Math.max(i - 1, 0));
          break;
        case "ArrowDown":
          e.preventDefault();
          setSectionIdx((s) => Math.min(s + 1, groups.length - 1));
          setItemIdx(0);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSectionIdx((s) => Math.max(s - 1, 0));
          setItemIdx(0);
          break;
        case "Enter":
        case " ": {
          e.preventDefault();
          const item = group.items[itemIdx];
          if (item) navigate(item.kind === "interactive" ? item.route : `/deck/${item.id}`);
          break;
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [groups, sectionIdx, itemIdx, navigate]);

  return { groups, sectionIdx, itemIdx, setSectionIdx, setItemIdx };
}
