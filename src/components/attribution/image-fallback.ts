/**
 * GLB-02 이미지 폴백 규칙: AI 이미지 실패 → 권리 확인된 기사 이미지 → 이미지 영역 생략.
 * buildImageCandidates가 이 순서를 구조적으로 고정하고, pickDisplayableImage가
 * 로드에 실패한 후보를 건너뛰어 다음 후보(또는 생략)를 고른다.
 */
export type ImageCandidate = {
  origin: "ai" | "article";
  url: string;
  alt: string;
  attribution: string | null;
};

export type AiImageInput = { url: string; alt: string } | null | undefined;
export type ArticleImageInput =
  | { url: string; alt: string; attribution: string | null }
  | null
  | undefined;

export function buildImageCandidates(
  aiImage: AiImageInput,
  articleImage: ArticleImageInput,
): ImageCandidate[] {
  const candidates: ImageCandidate[] = [];

  if (aiImage) {
    candidates.push({ origin: "ai", url: aiImage.url, alt: aiImage.alt, attribution: null });
  }

  if (articleImage) {
    candidates.push({
      origin: "article",
      url: articleImage.url,
      alt: articleImage.alt,
      attribution: articleImage.attribution,
    });
  }

  return candidates;
}

export function pickDisplayableImage(
  candidates: readonly ImageCandidate[],
  failedUrls: ReadonlySet<string>,
): ImageCandidate | null {
  return candidates.find((candidate) => !failedUrls.has(candidate.url)) ?? null;
}
