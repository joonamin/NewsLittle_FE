import { cn } from "@/lib/cn";

import { AsOfNote } from "./as-of-note";
import { attributionCopy } from "./copy";

/**
 * GLB-02 숏폼(SCR-04·05)·랜덤(SCR-11·12) 문항 해설 규칙: 근거 기사 제목·매체·게시일·
 * 원문 링크를 해설 블록 하단에 표시하고, 필요 시 기준 시점을 덧붙인다. 제목 자체를
 * 원문 링크로 쓰는 방식은 newslittle.lib.pen의 "기사 링크" 패턴을 따른다.
 *
 * AC-36(랜덤 퀴즈 근거 요약이 만료·중단된 문항): 요약이 만료·중단되면 요약 카드·
 * '오늘 목록에 담기' 없이 제목·링크만 남긴다. summaryUnavailable을 켜면 매체·게시일·
 * 기준 시점을 모두 생략하고 제목(가능하면 원문 링크)만 렌더링해 이 상태를 만족한다.
 */
export type EvidenceAttributionProps = {
  articleTitle: string;
  sourceName: string;
  publishedLabel: string;
  originalUrl: string | null;
  asOfLabel?: string | null;
  /** 근거 요약이 만료·중단된 경우(AC-36) 제목·링크만 남기고 나머지를 생략한다. */
  summaryUnavailable?: boolean;
  className?: string;
};

export function EvidenceAttribution({
  articleTitle,
  sourceName,
  publishedLabel,
  originalUrl,
  asOfLabel,
  summaryUnavailable = false,
  className,
}: EvidenceAttributionProps) {
  if (summaryUnavailable) {
    return (
      <footer className={cn("flex flex-col gap-2 border-t border-nl-border pt-4", className)}>
        {originalUrl ? (
          <a href={originalUrl} target="_blank" rel="noreferrer" className="text-nl-caption text-nl-accent hover:underline">
            {articleTitle}
          </a>
        ) : (
          <p className="text-nl-caption text-nl-text">{articleTitle}</p>
        )}
      </footer>
    );
  }

  return (
    <footer className={cn("flex flex-col gap-2 border-t border-nl-border pt-4", className)}>
      <p className="text-nl-micro text-nl-muted">{attributionCopy.evidenceHeading}</p>
      {originalUrl ? (
        <a href={originalUrl} target="_blank" rel="noreferrer" className="text-nl-caption text-nl-accent hover:underline">
          {articleTitle}
        </a>
      ) : (
        <p className="text-nl-caption text-nl-text">{articleTitle}</p>
      )}
      <p className="text-nl-micro text-nl-muted">
        {attributionCopy.sourceLine(sourceName, publishedLabel)}
      </p>
      {asOfLabel ? <AsOfNote label={asOfLabel} /> : null}
    </footer>
  );
}
