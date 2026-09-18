import { http, HttpResponse } from "msw";

import type { TopicCode } from "@/features/contracts/api-models";

import {
  randomPreviewFixture,
  settingsFixture,
  shortformResultFixture,
} from "./fixtures";
import { mockHomeStore } from "./home-store";
import {
  createRandomQuizSession,
  getRandomQuizResult,
  getRandomQuizSession,
  giveUpRandomQuizQuestion,
  nextRandomQuizQuestion,
  submitRandomQuizAnswer,
} from "./random-quiz-store";
import {
  createShortformQuizSession,
  getShortformQuizPreview,
  getShortformQuizSession,
  isShortformPreviewScenario,
} from "./shortform-quiz-store";

const api = "/api/v1";

function successResponse<T>(data: T, init?: ResponseInit) {
  return HttpResponse.json({ data, meta: { requestId: "mock-request-id" } }, init);
}

function failureResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
  const status =
    code === "AUTHENTICATION_REQUIRED" || code === "INVALID_CREDENTIALS"
      ? 401
      : code === "ARTICLE_NOT_FOUND" || code === "NOT_FOUND"
        ? 404
        : 500;
  return HttpResponse.json({ error: { code } }, { status });
}

export const handlers = [
  http.get(`${api}/navigation`, () => successResponse(mockHomeStore.navigation())),
  http.get(`${api}/home`, () => successResponse(mockHomeStore.home())),
  http.post(`${api}/auth/google`, async ({ request }) => {
    const payload = (await request.json().catch(() => null)) as {
      credential?: string;
      code?: string;
      topicIds?: TopicCode[];
      browserTopicIds?: TopicCode[];
    } | null;
    if (!payload?.credential && !payload?.code) {
      return failureResponse(new Error("INVALID_CREDENTIALS"));
    }
    // browserTopicIds 필드가 존재하기만 하면(빈 배열이어도) topicIds는 병합 없이 완전히 무시된다.
    const topicIds = payload && "browserTopicIds" in payload ? payload.browserTopicIds : payload?.topicIds;
    return successResponse(mockHomeStore.login(topicIds));
  }),
  http.post(`${api}/auth/logout`, () => {
    mockHomeStore.logout();
    return new HttpResponse(null, { status: 204 });
  }),
  http.get(`${api}/quiz/shortform/preview`, ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get("scenario");
    const previousFormat = url.searchParams.get("previousFormat") === "written" ? "written" : "choice";
    return successResponse(
      getShortformQuizPreview({
        scenario: isShortformPreviewScenario(scenario) ? scenario : "normal",
        previousFormat,
      }),
    );
  }),
  http.get(`${api}/quiz/random/preview`, () => successResponse(randomPreviewFixture)),
  http.get(`${api}/quiz/shortform/sessions/:sessionId`, ({ params }) =>
    successResponse(getShortformQuizSession(String(params.sessionId))),
  ),
  http.get(`${api}/quiz/random/sessions/:sessionId`, ({ params }) => {
    const sessionId = String(params.sessionId);
    return successResponse(getRandomQuizSession(sessionId));
  }),
  http.post(`${api}/quiz/shortform/sessions`, async ({ request }) => {
    const payload = (await request.json()) as { format?: "choice" | "written" };
    return successResponse(createShortformQuizSession(payload.format ?? "choice"), { status: 201 });
  }),
  http.post(`${api}/quiz/random/sessions`, async ({ request }) => {
    const payload = await request.json() as { format?: "choice" | "written" };
    return successResponse(createRandomQuizSession(payload.format ?? "choice"), { status: 201 });
  }),
  http.post(`${api}/quiz/random/sessions/:sessionId/answers`, async ({ params, request }) => {
    const payload = await request.json() as { answer?: string };
    return successResponse(submitRandomQuizAnswer(String(params.sessionId), payload.answer ?? ""));
  }),
  http.post(`${api}/quiz/random/sessions/:sessionId/give-up`, ({ params }) => {
    const sessionId = String(params.sessionId);
    return successResponse(giveUpRandomQuizQuestion(sessionId));
  }),
  http.post(`${api}/quiz/random/sessions/:sessionId/next`, ({ params }) => {
    const sessionId = String(params.sessionId);
    return successResponse(nextRandomQuizQuestion(sessionId));
  }),
  http.get(`${api}/quiz/shortform/sessions/:sessionId/result`, () =>
    successResponse(shortformResultFixture),
  ),
  http.get(`${api}/quiz/random/sessions/:sessionId/result`, ({ params }) =>
    successResponse(getRandomQuizResult(String(params.sessionId))),
  ),
  http.get(`${api}/archive`, () => successResponse(mockHomeStore.archive())),
  /** SCR-07 개별 삭제(FR-10·FR-15). 없거나 남의 것이면 404, 성공은 204. */
  http.delete(`${api}/archive/:entryId`, ({ params }) => {
    try {
      mockHomeStore.deleteArchiveEntry(String(params.entryId));
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return failureResponse(error);
    }
  }),
  http.get(`${api}/settings`, () => successResponse(settingsFixture)),
  http.post(`${api}/today-list`, async ({ request }) => {
    try {
      const payload = (await request.json()) as { articleId?: string };
      if (!payload.articleId) return failureResponse(new Error("ARTICLE_NOT_FOUND"));
      return successResponse(mockHomeStore.addToTodayList(payload.articleId), { status: 201 });
    } catch (error) {
      return failureResponse(error);
    }
  }),
  http.delete(`${api}/today-list/:articleId`, ({ params }) => {
    try {
      return successResponse(mockHomeStore.removeFromTodayList(String(params.articleId)));
    } catch (error) {
      return failureResponse(error);
    }
  }),
  http.post(`${api}/previous-lists/archive`, () => {
    try {
      return successResponse(mockHomeStore.archivePreviousLists());
    } catch (error) {
      return failureResponse(error);
    }
  }),
  http.delete(`${api}/previous-lists`, () => {
    try {
      return successResponse(mockHomeStore.discardPreviousLists());
    } catch (error) {
      return failureResponse(error);
    }
  }),
  http.put(`${api}/settings/topics`, () => successResponse(settingsFixture)),
];
