/**
 * 비회원 상태에서 설정 화면(SCR-09)이 고른 관심 주제를 브라우저에 저장한다(FR-12,
 * storageScope: "browser"). 계정이 없으므로 서버에는 저장하지 않고, 구글 로그인 시
 * SignInWithGoogleRequest.topicIds로 함께 보내 계정에 반영될 기회를 준다.
 */
import type { TopicCode } from "@/features/contracts/api-models";

const STORAGE_KEY = "newslittle:guest-topics";
const VALID_TOPICS: readonly TopicCode[] = [
  "ECONOMY",
  "SOCIETY",
  "AI_IT",
  "SCIENCE",
  "WORLD",
  "POLITICS",
];

function isTopicCode(value: unknown): value is TopicCode {
  return typeof value === "string" && (VALID_TOPICS as readonly string[]).includes(value);
}

export function getGuestTopics(): TopicCode[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTopicCode) : [];
  } catch {
    return [];
  }
}

export function setGuestTopics(topicIds: TopicCode[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(topicIds));
  } catch {
    // 프라이빗 모드 등으로 저장소를 쓸 수 없어도 화면 동작은 계속돼야 한다.
  }
}

export function clearGuestTopics(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
