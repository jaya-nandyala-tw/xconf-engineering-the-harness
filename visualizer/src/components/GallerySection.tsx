import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { sectionTimeLabel, type GroupedSection } from "../lib/deckNav";
import { ACCENT_BG, ACCENT_BORDER, ACCENT_TEXT } from "../lib/accent";

interface GallerySectionProps {
  group: GroupedSection;
  groupIndex: number;
  activeItemIndex: number | null;
  onHoverItem: (itemIndex: number) => void;
}

export function GallerySection({ group, groupIndex, activeItemIndex, onHoverItem }: GallerySectionProps) {
  const { section, items } = group;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: groupIndex * 0.05 }}
      className="flex gap-5"
    >
      <div className={`w-1 shrink-0 rounded-full ${ACCENT_BG[section.accent]}`} />
      <div className="min-w-0 flex-1 pb-2">
        <div className="flex items-baseline gap-3">
          <span className={`font-display text-sm font-bold ${ACCENT_TEXT[section.accent]}`}>
            {String(section.id).padStart(2, "0")}
          </span>
          <h2 className="text-base font-semibold text-ink/85">{section.title}</h2>
          <span className="text-xs uppercase tracking-[0.15em] text-ink/30">{sectionTimeLabel(section)}</span>
          <span className="text-xs uppercase tracking-[0.15em] text-ink/30">· {section.presenter}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {items.map((item, i) => {
            const isActive = activeItemIndex === i;
            const href = item.kind === "interactive" ? item.route : `/deck/${item.id}`;
            return (
              <Link
                key={item.id}
                to={href}
                onMouseEnter={() => onHoverItem(i)}
                className={`min-w-[180px] flex-1 rounded-xl border px-4 py-3 transition-colors ${
                  isActive
                    ? `${ACCENT_BORDER[section.accent]} bg-ink/[0.06]`
                    : "border-ink/10 bg-ink/[0.02] hover:border-ink/25"
                }`}
              >
                <p className="font-display text-sm font-bold leading-snug text-ink">{item.navLabel}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-ink/35">
                  {item.kind === "interactive" ? "▶ interactive" : "slide"}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
