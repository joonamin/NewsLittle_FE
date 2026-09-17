import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";

import { attributionCopy } from "./copy";
import {
  buildImageCandidates,
  pickDisplayableImage,
  type AiImageInput,
  type ArticleImageInput,
} from "./image-fallback";

/**
 * GLB-02 이미지 표시 규칙:
 * - AI 이미지에는 실제 사진으로 오인되지 않도록 이미지 위 고정 배지를 항상 노출한다(끌 수 없음).
 * - 기사 이미지(폴백)에는 저작자·라이선스 등 필요한 출처를 이미지 하단 캡션으로 표시한다.
 * - 폴백 순서: AI 이미지 실패 → 권리 확인된 기사 이미지 → 이미지 영역 생략.
 */
export type ArticleFigureProps = {
  aiImage?: AiImageInput;
  articleImage?: ArticleImageInput;
  className?: string;
};

export function ArticleFigure({ aiImage, articleImage, className }: ArticleFigureProps) {
  const candidates = useMemo(
    () => buildImageCandidates(aiImage, articleImage),
    [aiImage, articleImage],
  );
  const [failedUrls, setFailedUrls] = useState<ReadonlySet<string>>(new Set());

  const candidate = pickDisplayableImage(candidates, failedUrls);

  if (!candidate) {
    return null;
  }

  return (
    <figure className={cn(className)}>
      <div className="relative overflow-hidden rounded-nl-card">
        {/* eslint-disable-next-line @next/next/no-img-element -- 원격 이미지 도메인이 아직 확정되지 않아 next/image로 전환하지 못함 */}
        <img
          src={candidate.url}
          alt={candidate.alt}
          className="block w-full"
          onError={() =>
            setFailedUrls((previous) => {
              const next = new Set(previous);
              next.add(candidate.url);
              return next;
            })
          }
        />
        {candidate.origin === "ai" ? (
          <span className="absolute left-2 top-2 rounded-nl-badge bg-nl-overlay px-2 py-1 text-nl-micro font-medium text-nl-on-accent">
            {attributionCopy.aiImageBadge}
          </span>
        ) : null}
      </div>
      {candidate.origin === "article" && candidate.attribution ? (
        <figcaption className="mt-1 text-nl-micro text-nl-muted">{candidate.attribution}</figcaption>
      ) : null}
    </figure>
  );
}
