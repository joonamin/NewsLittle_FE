import { Badge, DateGroupHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

import { attributionCopy } from "./copy";

/**
 * GLB-02 아카이브 규칙: 선택일별 제목·링크와 이용 중단·접근 실패 상태를 그룹
 * 헤더(DateGroupHeader)와 항목 배지(Badge)로 표시한다. 이용 중단·만료 자산은
 * 원문 링크 대신 허용된 상태 정보만 노출한다(제목·매체·게시일 생략).
 *
 * "보관 범위"(제목·원문 링크만 보관한다는 안내)는 날짜별 그룹이 아니라 아카이브
 * 페이지 전체에 한 번만 표시되는 서비스 정책이다(design/library/newslittle.lib.pen의
 * "상태 안내" 참고). 이 컴포넌트가 아니라 페이지에서 기존 StateNotice로 조합한다.
 */
export type ArchiveItemStatus = "available" | "discontinued" | "access-failed";

export type ArchiveGroupItem = {
  id: string;
  title: string | null;
  originalUrl: string | null;
  sourceName?: string | null;
  publishedLabel?: string | null;
  status: ArchiveItemStatus;
};

export type ArchiveGroupProps = {
  dateLabel: string;
  items: readonly ArchiveGroupItem[];
  expanded?: boolean;
  onToggleExpanded?: () => void;
  className?: string;
};

function ArchiveItemRow({ item }: { item: ArchiveGroupItem }) {
  const isAvailable = item.status === "available";
  // 이용 중단 자산은 호출부가 실수로 실제 제목을 넘기더라도 항상 허용된 안내 문구만 노출한다.
  const title =
    item.status === "discontinued"
      ? attributionCopy.archiveDiscontinuedTitle
      : (item.title ?? attributionCopy.originalUnavailableLabel);

  return (
    <li className="flex flex-col gap-2 border-b border-nl-border py-4 last:border-b-0">
      {isAvailable && item.originalUrl ? (
        <a href={item.originalUrl} target="_blank" rel="noreferrer" className="text-nl-caption font-bold text-nl-text">
          {title}
        </a>
      ) : (
        <span className="text-nl-caption font-bold text-nl-text">{title}</span>
      )}
      {isAvailable && item.sourceName && item.publishedLabel ? (
        <p className="text-nl-micro text-nl-muted">
          {attributionCopy.sourceLine(item.sourceName, item.publishedLabel)}
        </p>
      ) : null}
      {item.status === "discontinued" ? (
        <>
          <p className="text-nl-micro text-nl-muted">{attributionCopy.archiveDiscontinuedDescription}</p>
          <Badge tone="negative" className="self-start">
            {attributionCopy.archiveDiscontinuedLabel}
          </Badge>
        </>
      ) : null}
      {item.status === "access-failed" ? (
        <Badge tone="default" className="self-start">
          {attributionCopy.archiveAccessFailedLabel}
        </Badge>
      ) : null}
    </li>
  );
}

export function ArchiveGroup({
  dateLabel,
  items,
  expanded = true,
  onToggleExpanded,
  className,
}: ArchiveGroupProps) {
  return (
    <section className={cn("flex flex-col", className)}>
      <DateGroupHeader label={dateLabel} expanded={expanded} onClick={onToggleExpanded} />
      {expanded ? (
        <ul>
          {items.map((item) => (
            <ArchiveItemRow key={item.id} item={item} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
