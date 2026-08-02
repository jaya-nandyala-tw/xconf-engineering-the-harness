import { Navigate, useParams } from "react-router-dom";
import { getItem } from "../lib/deckNav";
import { useSceneNav } from "../lib/useSceneNav";
import { useBeats } from "../lib/useBeats";
import { SceneChrome } from "../components/SceneChrome";
import type {
  AgendaContent,
  CloseContent,
  ConfessionCrawlContent,
  CoverContent,
  DividerContent,
  ListContent,
  PresentersContent,
  StatementContent,
  StaticDeckItem,
  TableContent,
  TwoColumnContent,
  VideoPlaceholderContent,
} from "../content/deck";
import { SlideCover } from "../components/slides/SlideCover";
import { SlidePresenters } from "../components/slides/SlidePresenters";
import { SlideStatement } from "../components/slides/SlideStatement";
import { SlideAgenda } from "../components/slides/SlideAgenda";
import { SlideList } from "../components/slides/SlideList";
import { SlideTable } from "../components/slides/SlideTable";
import { SlideTwoColumn } from "../components/slides/SlideTwoColumn";
import { SlideVideoPlaceholder } from "../components/slides/SlideVideoPlaceholder";
import { SlideClose } from "../components/slides/SlideClose";
import { SlideDivider } from "../components/slides/SlideDivider";
import { ConfessionCrawl } from "../components/slides/ConfessionCrawl";

function totalBeatsFor(item: StaticDeckItem): number {
  switch (item.slideKind) {
    case "agenda":
      return item.revealMode === "sequential" ? (item.content as AgendaContent).items.length : 1;
    case "list":
      return item.revealMode === "sequential" ? (item.content as ListContent).items.length : 1;
    case "video-placeholder":
      return (item.content as VideoPlaceholderContent).callouts.length + 1;
    case "confession-crawl":
      return (item.content as ConfessionCrawlContent).lines.length;
    default:
      return 1;
  }
}

function SlideBody({ item, beat, next }: { item: StaticDeckItem; beat: number; next: () => void }) {
  switch (item.slideKind) {
    case "cover":
      return <SlideCover content={item.content as CoverContent} />;
    case "presenters":
      return <SlidePresenters content={item.content as PresentersContent} />;
    case "statement":
      return <SlideStatement content={item.content as StatementContent} />;
    case "agenda":
      return <SlideAgenda content={item.content as AgendaContent} revealCount={beat + 1} />;
    case "list": {
      const content = item.content as ListContent;
      const revealCount = item.revealMode === "sequential" ? beat + 1 : content.items.length;
      return <SlideList content={content} revealCount={revealCount} />;
    }
    case "table":
      return <SlideTable content={item.content as TableContent} />;
    case "two-column":
      return <SlideTwoColumn content={item.content as TwoColumnContent} />;
    case "video-placeholder":
      return <SlideVideoPlaceholder content={item.content as VideoPlaceholderContent} revealCount={beat + 1} />;
    case "close":
      return <SlideClose content={item.content as CloseContent} />;
    case "confession-crawl":
      return <ConfessionCrawl content={item.content as ConfessionCrawlContent} beat={beat} next={next} />;
    case "divider":
      return <SlideDivider content={item.content as DividerContent} />;
    case "bespoke": {
      const Bespoke = item.bespokeComponent;
      return Bespoke ? <Bespoke content={item.content as StatementContent} /> : null;
    }
    default:
      return null;
  }
}

export function SlidePlayer() {
  const { id = "" } = useParams();
  const item = getItem(id);

  if (!item) return <Navigate to="/" replace />;
  if (item.kind === "interactive") return <Navigate to={item.route} replace />;

  return <StaticSlidePlayer item={item} />;
}

function StaticSlidePlayer({ item }: { item: StaticDeckItem }) {
  const total = totalBeatsFor(item);
  const { initialBeat, onPastEnd, onPastStart, nextHref, nextLabel } = useSceneNav(item.id, total);
  const { beat, next } = useBeats({ total, initialBeat, onPastEnd, onPastStart });

  return (
    <SceneChrome
      label={item.navLabel}
      totalBeats={total}
      currentBeat={beat}
      nextHref={nextHref}
      nextLabel={nextLabel}
    >
      <SlideBody item={item} beat={beat} next={next} />
    </SceneChrome>
  );
}
