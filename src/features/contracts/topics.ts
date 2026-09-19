/**
 * 서비스 주제(FR-12)는 여섯 개로 고정이고 백엔드도 같은 코드를 쓴다
 * (`modules/ingest/topics.py`). 다만 코드→한글 라벨을 내려주는 엔드포인트가
 * 없어서 표시용 카탈로그는 프론트가 갖는다. 설정 화면(SCR-09)은 이 카탈로그와
 * `/auth/me`의 `interests`를 맞춰 선택 상태를 만든다.
 */
import type { TopicCode } from "./api-models";

export const TOPIC_CATALOG: ReadonlyArray<{ id: TopicCode; label: string }> = [
  { id: "ECONOMY", label: "경제" },
  { id: "SOCIETY", label: "사회" },
  { id: "AI_IT", label: "AI·IT" },
  { id: "SCIENCE", label: "과학" },
  { id: "WORLD", label: "국제" },
  { id: "POLITICS", label: "정치" },
];

/** 저장 위치 안내 문구도 서버가 주지 않으므로 화면 계약으로 고정한다. */
export const PERSISTENCE_DESCRIPTION = {
  account: "관심 주제와 오늘 목록, 아카이브는 계정에 저장됩니다.",
  browser: "관심 주제는 이 브라우저에 저장됩니다.",
} as const;
