import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

import { attributionCopy } from "./copy";

/**
 * GLB-02 홈 기사 카드 규칙: 매체명·원문 게시일·원문 접근 수단·AI 요약 여부를
 * 카드 본문 아래 고정 영역에 표시한다. 랜덤 문항·해설(SCR-11·12)의 요약 카드도
 * 이 컴포넌트를 그대로 재사용해 동일한 규칙을 적용한다.
 * 문구는 design/library/newslittle.lib.pen의 "메타 행 · 출처와 신고" 컴포넌트를 따른다.
 */
export type ArticleSourceMetaProps = {
  sourceName: string;
  publishedLabel: string;
  originalUrl: string | null;
  showsAiSummary: boolean;
  className?: string;
};

export function ArticleSourceMeta({
  sourceName,
  publishedLabel,
  originalUrl,
  showsAiSummary,
  className,
}: ArticleSourceMetaProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      <p className="text-nl-micro text-nl-muted">
        {attributionCopy.sourceLine(sourceName, publishedLabel)}
      </p>
      {originalUrl ? (
        <a href={originalUrl} target="_blank" rel="noreferrer" className="text-nl-micro text-nl-accent hover:underline">
          {attributionCopy.originalLinkLabel}
        </a>
      ) : (
        <span className="text-nl-micro text-nl-muted">{attributionCopy.originalUnavailableLabel}</span>
      )}
      {showsAiSummary ? <Badge tone="accent">{attributionCopy.aiSummaryBadge}</Badge> : null}
    </div>
  );
}
