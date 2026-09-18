/**
 * COM-06(출처·AI 표시 의무)의 화면 문구 모음입니다.
 * 문구 확정은 계약·법령 대조(G-01, G-07) 이후이므로, 그 전까지는 이 파일의 값만 바꾸면
 * 모든 위치에 반영되도록 컴포넌트에 문자열을 직접 하드코딩하지 않습니다.
 * '법률 검토 완료'처럼 인증·보증으로 읽힐 수 있는 문구는 어떤 배지·라벨에도 추가하지 않습니다.
 * sourceLine·originalLinkLabel과 아카이브 상태 문구는 design/library/newslittle.lib.pen(GLB-02)의
 * "메타 행 · 출처와 신고", SCR-07 아카이브 보관 기사 배지 원문을 따릅니다.
 */
export const attributionCopy = {
  sourceLine: (sourceName: string, publishedLabel: string) =>
    `${sourceName} · 원문 게시 ${publishedLabel}`,
  aiSummaryBadge: "AI 요약",
  aiImageBadge: "AI 생성 이미지",
  originalLinkLabel: "원문 읽기 ↗",
  originalUnavailableLabel: "원문 접근 불가",
  previousDateBadgeLabel: (publishedLabel: string) => `게시일 ${publishedLabel}`,
  evidenceHeading: "근거 기사",
  asOfLabel: (label: string) => `기준 시점 ${label}`,
  archiveDiscontinuedLabel: "이용 중단",
  archiveDiscontinuedTitle: "이용 중단으로 표시가 제한된 기사",
  archiveDiscontinuedDescription: "이용 조건이 종료되어 제목과 원문 링크를 표시할 수 없습니다.",
  archiveAccessFailedLabel: "원문 접근 실패 · 보관 기록 유지",
  archiveDerivativeExpiredLabel: "요약·퀴즈 연결 없음",
} as const;
