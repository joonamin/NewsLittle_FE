import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

import { attributionCopy } from "./copy";

/**
 * GLB-02 오늘 목록 패널 규칙: 제목 중심으로 표시하고, 이전 날짜에서 넘어온 기사에는
 * 게시일 배지를 붙인다. 상세 출처는 항목을 펼치거나(expandedDetails) 대체 텍스트로
 * 접근성 트리에 남긴다(altText).
 */
export type TodayListEntryProps = {
  title: string;
  isFromPreviousFeedDate: boolean;
  publishedLabel?: string | null;
  /** 펼쳤을 때 보여줄 상세 출처 정보(ArticleSourceMeta 등). */
  expandedDetails?: ReactNode;
  /** expandedDetails가 없을 때 스크린리더 등에 노출할 대체 텍스트. */
  altText?: string;
  className?: string;
};

export function TodayListEntry({
  title,
  isFromPreviousFeedDate,
  publishedLabel,
  expandedDetails,
  altText,
  className,
}: TodayListEntryProps) {
  const previousDateBadge =
    isFromPreviousFeedDate && publishedLabel ? (
      <Badge tone="default">{attributionCopy.previousDateBadgeLabel(publishedLabel)}</Badge>
    ) : null;

  if (expandedDetails) {
    return (
      <details className={cn("group", className)}>
        <summary className="flex cursor-pointer items-center gap-2 text-nl-caption font-bold text-nl-text">
          <span>{title}</span>
          {previousDateBadge}
        </summary>
        <div className="mt-2 pl-1">{expandedDetails}</div>
      </details>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 text-nl-caption font-bold text-nl-text", className)}>
      <span>{title}</span>
      {previousDateBadge}
      {altText ? <span className="sr-only">{altText}</span> : null}
    </div>
  );
}
