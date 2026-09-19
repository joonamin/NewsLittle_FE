/**
 * 단문 본문(bodyText)을 문장 단위로 나눈다.
 * BE `modules/ai/contracts.py`의 `_SENTENCE_SPLIT_RE`(`(?<=[.!?。])\s+|\n+`)와 같은 규칙이다 —
 * 배치가 "한 문장에 한 사실"로 검증한 경계를 화면도 그대로 쓴다.
 */
const SENTENCE_SPLIT_RE = /(?<=[.!?。])\s+|\n+/;

export function splitSentences(text: string): string[] {
  return text
    .trim()
    .split(SENTENCE_SPLIT_RE)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/** 본문과 요약이 사실상 같은 글인지(공백·문장부호 차이만 무시). AI 요약 박스 중복 노출 방지용. */
export function isSameText(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const normalize = (value: string) => value.replace(/[\s"'“”‘’.,!?…·]+/g, "");
  return normalize(a) === normalize(b);
}
