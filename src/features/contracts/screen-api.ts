/**
 * [안내]
 * 현재 도메인 API 인터페이스 및 엔드포인트 정의는 초기 설계 단계이며 아직 완전하게 고도화되지 않았습니다.
 * 백엔드 구현 및 서비스 요구사항 변경/고도화에 따라 요청 경로 및 파라미터 규격이 추후 변경될 가능성이 존재합니다.
 */

import type {
  AddToTodayListRequest,
  ApiResponse,
  ArchiveApiModel,
  CreateQuizSessionRequest,
  HomeApiModel,
  NavigationApiModel,
  QuizDomain,
  QuizPreviewApiModel,
  QuizResultApiModel,
  QuizSessionApiModel,
  SettingsApiModel,
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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return ((await response.json()) as ApiResponse<T>).data;
}

function jsonRequest<T>(method: "POST" | "PUT", body: T) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  } satisfies RequestInit;
}

export const screenApi = {
  navigation: () =>
    request<NavigationApiModel>("/api/v1/navigation").then(toGlobalNavigationViewModel),
  home: () => request<HomeApiModel>("/api/v1/home").then(toHomeViewModel),
  shortformPreview: () =>
    request<QuizPreviewApiModel>("/api/v1/quiz/shortform/preview").then(
      toQuizStartViewModel,
    ),
  randomPreview: () =>
    request<QuizPreviewApiModel>("/api/v1/quiz/random/preview").then(toQuizStartViewModel),
  session: (domain: QuizDomain, sessionId: string) =>
    request<QuizSessionApiModel>(`/api/v1/quiz/${domain}/sessions/${sessionId}`).then(
      toQuizPlayViewModel,
    ),
  result: (domain: QuizDomain, sessionId: string) =>
    request<QuizResultApiModel>(`/api/v1/quiz/${domain}/sessions/${sessionId}/result`).then(
      toQuizResultViewModel,
    ),
  archive: () => request<ArchiveApiModel>("/api/v1/archive").then(toArchiveViewModel),
  settings: () => request<SettingsApiModel>("/api/v1/settings").then(toSettingsViewModel),
  addToTodayList: (payload: AddToTodayListRequest) =>
    request("/api/v1/today-list", jsonRequest("POST", payload)),
  createSession: (domain: QuizDomain, payload: CreateQuizSessionRequest) =>
    request<QuizSessionApiModel>(
      `/api/v1/quiz/${domain}/sessions`,
      jsonRequest("POST", payload),
    ),
  submitAnswer: (domain: QuizDomain, sessionId: string, payload: SubmitQuizAnswerRequest) =>
    request<QuizSessionApiModel>(
      `/api/v1/quiz/${domain}/sessions/${sessionId}/answers`,
      jsonRequest("POST", payload),
    ).then(toQuizPlayViewModel),
  giveUpQuestion: (domain: QuizDomain, sessionId: string) =>
    request<QuizSessionApiModel>(
      `/api/v1/quiz/${domain}/sessions/${sessionId}/give-up`,
      jsonRequest("POST", {}),
    ).then(toQuizPlayViewModel),
  nextQuestion: (domain: QuizDomain, sessionId: string) =>
    request<QuizSessionApiModel>(
      `/api/v1/quiz/${domain}/sessions/${sessionId}/next`,
      jsonRequest("POST", {}),
    ).then(toQuizPlayViewModel),
  updateInterestTopics: (payload: UpdateInterestTopicsRequest) =>
    request<SettingsApiModel>("/api/v1/settings/topics", jsonRequest("PUT", payload)).then(
      toSettingsViewModel,
    ),
};
