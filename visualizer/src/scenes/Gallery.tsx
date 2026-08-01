import { Link } from "react-router-dom";
import { useGalleryNav } from "../lib/useGalleryNav";
import { GallerySection } from "../components/GallerySection";

export function Gallery() {
  const { groups, sectionIdx, itemIdx, setSectionIdx, setItemIdx } = useGalleryNav();
  const firstItem = groups[0]?.items[0];
  const firstHref = firstItem && (firstItem.kind === "interactive" ? firstItem.route : `/deck/${firstItem.id}`);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="max-w-xl text-sm text-white/50">
          The whole talk, in order. <kbd className="rounded bg-white/10 px-1.5 py-0.5">↑↓←→</kbd> to browse,{" "}
          <kbd className="rounded bg-white/10 px-1.5 py-0.5">enter</kbd> to play. Esc always brings you back here.
        </p>
        {firstHref && (
          <Link
            to={firstHref}
            className="shrink-0 rounded-full bg-flamingo px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90"
          >
            ▶ Play from the top
          </Link>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-7">
        {groups.map((group, gi) => (
          <GallerySection
            key={group.section.id}
            group={group}
            groupIndex={gi}
            activeItemIndex={gi === sectionIdx ? itemIdx : null}
            onHoverItem={(i) => {
              setSectionIdx(gi);
              setItemIdx(i);
            }}
          />
        ))}
      </div>
    </div>
  );
}
