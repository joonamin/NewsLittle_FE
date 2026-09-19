/**
 * [안내]
 * 현재 도메인 API 인터페이스 및 엔드포인트 정의는 초기 설계 단계이며 아직 완전하게 고도화되지 않았습니다.
 * 백엔드 구현 및 서비스 요구사항 변경/고도화에 따라 요청 경로 및 파라미터 규격이 추후 변경될 가능성이 존재합니다.
 */

import { apiRequest, jsonRequest } from "@/lib/api-client";

import type {
  AddToTodayListRequest,
  AuthenticationApiModel,
  ArchiveApiModel,
  AuthMeApiModel,
  CreateQuizSessionRequest,
  DeletionConfirmationRequest,
  DeletionRequestApiModel,
  DeletionRequestKind,
  FeedApiModel,
  HomeApiModel,
  InterestsApiModel,
  NavigationApiModel,
  QuizDomain,
  QuizPreviewApiModel,
  QuizResultApiModel,
  QuizSessionApiModel,
  SignInWithGoogleRequest,
  SubmitReportApiModel,
  SubmitReportRequest,
  TodayListApiModel,
  SubmitQuizAnswerRequest,
  UpdateInterestTopicsRequest,
} from "./api-models";
import {
  toArchiveViewModel,
  toFeedViewModel,
  toGlobalNavigationViewModel,
  toHomeViewModel,
  toQuizPlayViewModel,
  toQuizResultViewModel,
  toQuizStartViewModel,
  toSettingsViewModel,
} from "./view-models";

export const screenApi = {
  navigation: () =>
    apiRequest<NavigationApiModel>("/api/v1/navigation").then(toGlobalNavigationViewModel),
  home: (init?: RequestInit) => apiRequest<HomeApiModel>("/api/v1/home", init).then(toHomeViewModel),
  feed: (options?: { cursor?: string | null; topics?: string[] }) => {
    const params = new URLSearchParams();
    if (options?.cursor) params.set("cursor", options.cursor);
    if (options?.topics && options.topics.length > 0) {
      params.set("topics", options.topics.join(","));
    }
    const query = params.toString();
    return apiRequest<FeedApiModel>(`/api/v1/feed${query ? `?${query}` : ""}`).then(
      toFeedViewModel,
    );
  },
  signInWithGoogle: (payload: SignInWithGoogleRequest) =>
    apiRequest<AuthenticationApiModel>("/api/v1/auth/google", jsonRequest("POST", payload)),
  signOut: () => apiRequest<void>("/api/v1/auth/logout", { method: "POST" }),
  shortformPreview: (init?: RequestInit) =>
    apiRequest<QuizPreviewApiModel>("/api/v1/quiz/shortform/preview", init).then(
      toQuizStartViewModel,
    ),
  randomPreview: (init?: RequestInit) =>
    apiRequest<QuizPreviewApiModel>("/api/v1/quiz/random/preview", init).then(toQuizStartViewModel),
  session: (domain: QuizDomain, sessionId: string, init?: RequestInit) =>
    apiRequest<QuizSessionApiModel>(`/api/v1/quiz/${domain}/sessions/${sessionId}`, init).then(
      toQuizPlayViewModel,
    ),
  result: (domain: QuizDomain, sessionId: string, init?: RequestInit) =>
    apiRequest<QuizResultApiModel>(
      `/api/v1/quiz/${domain}/sessions/${sessionId}/result`,
      init,
    ).then(toQuizResultViewModel),
  archive: (init?: RequestInit) =>
    apiRequest<ArchiveApiModel>("/api/v1/archive", init).then(toArchiveViewModel),
  /** SCR-07 개별 삭제(FR-10·FR-15). 응답 본문 없음(204). */
  deleteArchiveEntry: (entryId: string) =>
    apiRequest<void>(`/api/v1/archive/${entryId}`, { method: "DELETE" }),
  /**
   * 설정 화면(SCR-09) 조회. 백엔드에 화면 전용 엔드포인트가 없어 세션 주체 조회를
   * 그대로 쓰고, 주제 라벨·저장 위치 문구는 프론트 카탈로그가 채운다.
   */
  settings: (init?: RequestInit) =>
    apiRequest<AuthMeApiModel>("/api/v1/auth/me", init).then(toSettingsViewModel),
  addToTodayList: (payload: AddToTodayListRequest) =>
    apiRequest<TodayListApiModel>("/api/v1/today-list", jsonRequest("POST", payload)),
  removeFromTodayList: (articleId: string) =>
    apiRequest<TodayListApiModel>(`/api/v1/today-list/${encodeURIComponent(articleId)}`, {
      method: "DELETE",
    }),
  archivePreviousLists: () =>
    apiRequest<HomeApiModel>("/api/v1/previous-lists/archive", { method: "POST" }).then(
      toHomeViewModel,
    ),
  discardPreviousLists: () =>
    apiRequest<HomeApiModel>("/api/v1/previous-lists", { method: "DELETE" }).then(
      toHomeViewModel,
    ),
  createSession: (domain: QuizDomain, payload: CreateQuizSessionRequest) =>
    apiRequest<QuizSessionApiModel>(
      `/api/v1/quiz/${domain}/sessions`,
      jsonRequest("POST", payload),
    ),
  submitAnswer: (domain: QuizDomain, sessionId: string, payload: SubmitQuizAnswerRequest) =>
    apiRequest<QuizSessionApiModel>(
      `/api/v1/quiz/${domain}/sessions/${sessionId}/answers`,
      jsonRequest("POST", payload),
    ).then(toQuizPlayViewModel),
  giveUpQuestion: (domain: QuizDomain, sessionId: string) =>
    apiRequest<QuizSessionApiModel>(
      `/api/v1/quiz/${domain}/sessions/${sessionId}/give-up`,
      jsonRequest("POST", {}),
    ).then(toQuizPlayViewModel),
  nextQuestion: (domain: QuizDomain, sessionId: string) =>
    apiRequest<QuizSessionApiModel>(
      `/api/v1/quiz/${domain}/sessions/${sessionId}/next`,
      jsonRequest("POST", {}),
    ).then(toQuizPlayViewModel),
  previousQuestion: (domain: QuizDomain, sessionId: string) =>
    apiRequest<QuizSessionApiModel>(
      `/api/v1/quiz/${domain}/sessions/${sessionId}/previous`,
      jsonRequest("POST", {}),
    ).then(toQuizPlayViewModel),
  abandonSession: (domain: QuizDomain, sessionId: string, keepalive = false) =>
    apiRequest<QuizSessionApiModel>(
      `/api/v1/quiz/${domain}/sessions/${sessionId}/abandon`,
      { ...jsonRequest("POST", {}), keepalive },
    ).then(toQuizPlayViewModel),
  updateInterestTopics: (payload: UpdateInterestTopicsRequest) =>
    apiRequest<InterestsApiModel>("/api/v1/settings/interests", jsonRequest("PUT", payload)),
  /**
   * FR-15/AC-26: 기록 삭제와 탈퇴는 별개 동작이라 경로가 나뉜다. 두 요청 모두
   * 확인 단계를 서버가 다시 검증하므로 `confirm: true`를 함께 보낸다(NFR-07).
   * 탈퇴가 DONE이면 서버가 세션 쿠키까지 지우므로 호출 측이 로그아웃 상태로
   * 전환해야 한다.
   */
  requestDeletion: (kind: DeletionRequestKind) =>
    apiRequest<DeletionRequestApiModel>(
      kind === "account"
        ? "/api/v1/settings/deletion-request"
        : "/api/v1/settings/records-deletion-request",
      jsonRequest("POST", { confirm: true } satisfies DeletionConfirmationRequest),
    ),
  /** GLB-03 신고 모달(FR-14). 비회원도 호출할 수 있다. */
  submitReport: (payload: SubmitReportRequest) =>
    apiRequest<SubmitReportApiModel>("/api/v1/reports", jsonRequest("POST", payload)),
};
