import type { ReactNode } from "react";
import { AccordionHeader, Badge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

import { attributionCopy } from "./copy";

/**
 * GLB-02 아카이브 규칙: 선택일별 제목·링크와 상태(원문 접근 실패·파생물 만료·이용 중단)를
 * 그룹 헤더(AccordionHeader)와 항목 배지(Badge)로 표시한다. 이용 중단·만료 자산은
 * 원문 링크 대신 허용된 상태 정보만 노출한다.
 *
 * "보관 범위"(제목·원문 링크만 보관한다는 안내)는 날짜별 그룹이 아니라 아카이브
 * 페이지 전체에 한 번만 표시되는 서비스 정책이다(design/library/newslittle.lib.pen의
 * "상태 안내" 참고). 이 컴포넌트가 아니라 페이지에서 직접 조합한다.
 *
 * 삭제는 SCR-07(FR-10·FR-15)의 계정 관리 기능이라 이 컴포넌트는 콜백만 받는다.
 * 신고는 GLB-03 전역 모달의 접점이며, 권리·원문 접근 실패만 다룬다(제목·링크만
 * 보관하는 항목 특성상 내용 오류·판정 오류는 대상이 아니다).
 */
export type ArchiveItemStatus = "available" | "access-failed" | "derivative-expired" | "discontinued";

export type ArchiveGroupItem = {
  id: string;
  /** 신고 대상 articleId. "discontinued"라 실제 기사를 특정할 수 없으면 null이고,
   * 이 경우 신고 접점을 렌더링하지 않는다(BE가 articleId 없이는 신고를 받을 수 없다). */
  articleId: string | null;
  title: string | null;
  originalUrl: string | null;
  sourceName?: string | null;
  publishedLabel?: string | null;
  status: ArchiveItemStatus;
  /** status가 "discontinued"일 때의 사유. 생략하면 일반 안내 문구를 쓴다. */
  discontinuedReason?: string | null;
};

export type ArchiveGroupProps = {
  /** 기존 단일 라벨 호환용 (title, dateText, p1, p2, p3 미제공 시 fallback) */
  dateLabel?: string;
  /** 1순위 정보: 목록 제목 */
  title?: string | null;
  /** 2순위 정보: 날짜 라벨 (예: '2026. 9. 20. 선택') */
  dateText?: string;
  /** 3순위 정보: 수량/개수 라벨 (생략 시 `${items.length}개`) */
  countText?: string;
  /** 커스텀 우선순위 노드 직접 전달 시 사용 */
  p1?: ReactNode;
  /** 커스텀 우선순위 노드 직접 전달 시 사용 */
  p2?: ReactNode;
  /** 커스텀 우선순위 노드 직접 전달 시 사용 */
  p3?: ReactNode;
  items: readonly ArchiveGroupItem[];
  expanded?: boolean;
  onToggleExpanded?: () => void;
  onDeleteItem?: (id: string) => void;
  onReportItem?: (item: ArchiveGroupItem) => void;
  className?: string;
};

function ArchiveItemRow({
  item,
  onDelete,
  onReport,
}: {
  item: ArchiveGroupItem;
  onDelete?: () => void;
  onReport?: () => void;
}) {
  const showsLink = item.status === "available" || item.status === "derivative-expired";
  const showsSourceLine = item.status === "available" && item.sourceName && item.publishedLabel;
  const title =
    item.status === "discontinued"
      ? attributionCopy.archiveDiscontinuedTitle
      : (item.title ?? attributionCopy.originalUnavailableLabel);

  return (
    <li className="flex items-center gap-4 border-b border-nl-border py-4 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {showsLink && item.originalUrl ? (
          <a href={item.originalUrl} target="_blank" rel="noreferrer" className="text-nl-caption font-bold text-nl-text hover:underline">
            {title}
          </a>
        ) : (
          <span className="text-nl-caption font-bold text-nl-text">{title}</span>
        )}
        {showsSourceLine ? (
          <p className="text-nl-micro text-nl-muted">
            {attributionCopy.sourceLine(item.sourceName!, item.publishedLabel!)}
          </p>
        ) : null}
        {item.status === "derivative-expired" ? (
          <Badge tone="default" className="self-start">
            {attributionCopy.archiveDerivativeExpiredLabel}
          </Badge>
        ) : null}
        {item.status === "discontinued" ? (
          <>
            <p className="text-nl-micro text-nl-muted">
              {item.discontinuedReason ?? attributionCopy.archiveDiscontinuedDescription}
            </p>
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
      </div>
      {item.articleId ? (
        <button
          type="button"
          onClick={onReport}
          className="shrink-0 text-nl-micro text-nl-negative hover:underline"
        >
          신고
        </button>
      ) : null}
      {onDelete ? (
        <Button variant="secondary" size="l" className="shrink-0" onClick={onDelete}>
          삭제
        </Button>
      ) : null}
    </li>
  );
}

export function ArchiveGroup({
  dateLabel,
  title,
  dateText,
  countText,
  p1: explicitP1,
  p2: explicitP2,
  p3: explicitP3,
  items,
  expanded = true,
  onToggleExpanded,
  onDeleteItem,
  onReportItem,
  className,
}: ArchiveGroupProps) {
  const count = countText ?? `${items.length}개`;

  let p1: ReactNode = explicitP1;
  let p2: ReactNode = explicitP2;
  let p3: ReactNode = explicitP3;

  if (!p1 && !p2 && !p3) {
    if (title || dateText) {
      p1 = title || (dateText ?? dateLabel);
      p2 = title ? (dateText ?? dateLabel) : undefined;
      p3 = count;
    }
  }

  const isLegacyLabel = !p1 && !p2 && !p3 && Boolean(dateLabel);

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <AccordionHeader
        label={isLegacyLabel ? dateLabel : undefined}
        p1={p1}
        p2={p2}
        p3={p3}
        expanded={expanded}
        showsStateText
        onClick={onToggleExpanded}
      />
      {expanded ? (
        <>
          <span className="h-px w-full bg-nl-border" aria-hidden="true" />
          <ul>
            {items.map((item) => (
              <ArchiveItemRow
                key={item.id}
                item={item}
                onDelete={onDeleteItem ? () => onDeleteItem(item.id) : undefined}
                onReport={onReportItem ? () => onReportItem(item) : undefined}
              />
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
