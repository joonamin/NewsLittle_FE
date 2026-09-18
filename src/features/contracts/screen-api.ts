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
  CreateQuizSessionRequest,
  HomeApiModel,
  NavigationApiModel,
  QuizDomain,
  QuizPreviewApiModel,
  QuizResultApiModel,
  QuizSessionApiModel,
  SettingsApiModel,
  TodayListApiModel,
  SubmitQuizAnswerRequest,
  UpdateInterestTopicsRequest,
} from "./api-models";
import {
  toArchiveViewModel,
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
  home: () => apiRequest<HomeApiModel>("/api/v1/home").then(toHomeViewModel),
  signInWithGoogle: () =>
    apiRequest<AuthenticationApiModel>("/api/v1/auth/google", { method: "POST" }),
  signOut: () => apiRequest<AuthenticationApiModel>("/api/v1/auth/logout", { method: "POST" }),
  shortformPreview: () =>
    apiRequest<QuizPreviewApiModel>("/api/v1/quiz/shortform/preview").then(
      toQuizStartViewModel,
    ),
  randomPreview: () =>
    apiRequest<QuizPreviewApiModel>("/api/v1/quiz/random/preview").then(toQuizStartViewModel),
  session: (domain: QuizDomain, sessionId: string) =>
    apiRequest<QuizSessionApiModel>(`/api/v1/quiz/${domain}/sessions/${sessionId}`).then(
      toQuizPlayViewModel,
    ),
  result: (domain: QuizDomain, sessionId: string) =>
    apiRequest<QuizResultApiModel>(`/api/v1/quiz/${domain}/sessions/${sessionId}/result`).then(
      toQuizResultViewModel,
    ),
  archive: () => apiRequest<ArchiveApiModel>("/api/v1/archive").then(toArchiveViewModel),
  /** SCR-07 개별 삭제(FR-10·FR-15). 응답 본문 없음(204). */
  deleteArchiveEntry: (entryId: string) =>
    apiRequest<void>(`/api/v1/archive/${entryId}`, { method: "DELETE" }),
  settings: () => apiRequest<SettingsApiModel>("/api/v1/settings").then(toSettingsViewModel),
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
  updateInterestTopics: (payload: UpdateInterestTopicsRequest) =>
    apiRequest<SettingsApiModel>("/api/v1/settings/topics", jsonRequest("PUT", payload)).then(
      toSettingsViewModel,
    ),
};
