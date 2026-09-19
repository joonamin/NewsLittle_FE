import { delay, http, HttpResponse } from "msw";

import type { TopicCode } from "@/features/contracts/api-models";

import {
  randomPreviewFixture,
  shortformResultFixture,
} from "./fixtures";
import { mockHomeStore } from "./home-store";
import {
  abandonRandomQuizSession,
  createRandomQuizSession,
  getRandomQuizResult,
  getRandomQuizSession,
  giveUpRandomQuizQuestion,
  nextRandomQuizQuestion,
  previousRandomQuizQuestion,
  submitRandomQuizAnswer,
} from "./random-quiz-store";
import {
  abandonShortformQuizSession,
  createShortformQuizSession,
  excludeShortformQuizQuestion,
  getShortformQuizPreview,
  getShortformQuizResult,
  getShortformQuizSession,
  giveUpShortformQuizQuestion,
  isShortformPreviewScenario,
  nextShortformQuizQuestion,
  previousShortformQuizQuestion,
  submitShortformQuizAnswer,
} from "./shortform-quiz-store";
import { mockAdminReviewStore } from "./admin-review-store";
import { mockAdminDashboardStore } from "./admin-dashboard-store";
import type { ReviewDecisionRequest } from "@/features/contracts/admin-models";

const api = "/api/v1";
const timedOutShortformSessions = new Set<string>();

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
        : code === "VALIDATION_ERROR"
          ? 422
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
  /** 설정 화면(SCR-09)은 전용 조회 엔드포인트 없이 이 응답 하나로 구성된다. */
  http.get(`${api}/auth/me`, () => successResponse(mockHomeStore.authMe())),
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
  http.get(`${api}/quiz/shortform/sessions/:sessionId`, ({ params }) => {
    const sessionId = String(params.sessionId);
    return sessionId.includes("expired-session")
      ? failureResponse(new Error("AUTHENTICATION_REQUIRED"))
      : successResponse(getShortformQuizSession(sessionId));
  }),
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
  http.post(`${api}/quiz/shortform/sessions/:sessionId/answers`, async ({ params, request }) => {
    const sessionId = String(params.sessionId);
    const payload = await request.json() as { answer?: string };
    if (sessionId.includes("service-excluded")) {
      return successResponse(excludeShortformQuizQuestion(sessionId));
    }
    if (sessionId.includes("timeout") && !timedOutShortformSessions.has(sessionId)) {
      timedOutShortformSessions.add(sessionId);
      await delay(sessionId.includes("written") ? 10_100 : 3_100);
      return failureResponse(new Error("JUDGEMENT_TIMEOUT"));
    }
    return successResponse(submitShortformQuizAnswer(sessionId, payload.answer ?? ""));
  }),
  http.post(`${api}/quiz/shortform/sessions/:sessionId/give-up`, ({ params }) =>
    successResponse(giveUpShortformQuizQuestion(String(params.sessionId))),
  ),
  http.post(`${api}/quiz/shortform/sessions/:sessionId/next`, ({ params }) =>
    successResponse(nextShortformQuizQuestion(String(params.sessionId))),
  ),
  http.post(`${api}/quiz/shortform/sessions/:sessionId/previous`, ({ params }) =>
    successResponse(previousShortformQuizQuestion(String(params.sessionId))),
  ),
  http.post(`${api}/quiz/shortform/sessions/:sessionId/abandon`, ({ params }) =>
    successResponse(abandonShortformQuizSession(String(params.sessionId))),
  ),
  http.post(`${api}/quiz/random/sessions/:sessionId/give-up`, ({ params }) => {
    const sessionId = String(params.sessionId);
    return successResponse(giveUpRandomQuizQuestion(sessionId));
  }),
  http.post(`${api}/quiz/random/sessions/:sessionId/next`, ({ params }) => {
    const sessionId = String(params.sessionId);
    return successResponse(nextRandomQuizQuestion(sessionId));
  }),
  http.post(`${api}/quiz/random/sessions/:sessionId/previous`, ({ params }) =>
    successResponse(previousRandomQuizQuestion(String(params.sessionId))),
  ),
  http.post(`${api}/quiz/random/sessions/:sessionId/abandon`, ({ params }) =>
    successResponse(abandonRandomQuizSession(String(params.sessionId))),
  ),
  http.get(`${api}/quiz/shortform/sessions/:sessionId/result`, ({ params }) =>
    successResponse(getShortformQuizResult(String(params.sessionId))),
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
  http.put(`${api}/settings/interests`, async ({ request }) => {
    try {
      const payload = (await request.json().catch(() => null)) as { topicIds?: TopicCode[] } | null;
      return successResponse(mockHomeStore.updateInterestTopics(payload?.topicIds ?? []));
    } catch (error) {
      return failureResponse(error);
    }
  }),
  /** 파괴적 동작은 서버도 확인 단계를 다시 강제한다(NFR-07). confirm이 없으면 422다. */
  http.post(`${api}/settings/deletion-request`, async ({ request }) => {
    try {
      const payload = (await request.json().catch(() => null)) as { confirm?: boolean } | null;
      if (payload?.confirm !== true) return failureResponse(new Error("VALIDATION_ERROR"));
      return successResponse(mockHomeStore.requestDeletion("account"));
    } catch (error) {
      return failureResponse(error);
    }
  }),
  http.post(`${api}/settings/records-deletion-request`, async ({ request }) => {
    try {
      const payload = (await request.json().catch(() => null)) as { confirm?: boolean } | null;
      if (payload?.confirm !== true) return failureResponse(new Error("VALIDATION_ERROR"));
      return successResponse(mockHomeStore.requestDeletion("records"));
    } catch (error) {
      return failureResponse(error);
    }
  }),

  // ADM-01 운영 대시보드
  http.get(`${api}/operations/dashboard/summary`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get("refresh") === "true") {
      mockAdminDashboardStore.refresh();
    }
    return successResponse(mockAdminDashboardStore.getSummary());
  }),
  http.post(`${api}/operations/dashboard/toggle-deletion-failure`, () => {
    return successResponse(mockAdminDashboardStore.toggleDeletionFailure());
  }),

  // ADM-03 검수 대기열
  http.get(`${api}/operations/reviews/queue`, () => {
    return successResponse(mockAdminReviewStore.getQueueSummary());
  }),
  http.get(`${api}/operations/reviews/:articleId`, ({ params }) => {
    const articleId = Number(params.articleId);
    const item = mockAdminReviewStore.getArticleReview(articleId);
    if (!item) {
      return failureResponse(new Error("ARTICLE_NOT_FOUND"));
    }
    return successResponse(item);
  }),
  http.post(`${api}/operations/reviews/:articleId/decision`, async ({ params, request }) => {
    try {
      const articleId = Number(params.articleId);
      const body = (await request.json()) as ReviewDecisionRequest;
      const updated = mockAdminReviewStore.submitDecision(articleId, body);

      // 대시보드 최근 활동 로그에 실시간 반영
      const actionText =
        body.decisionType === "APPROVE"
          ? "검수 통과"
          : body.decisionType === "REJECT"
            ? "검수 반려"
            : "재생성 요청";
      mockAdminDashboardStore.recordActivity(actionText, updated.articleCode);

      return successResponse(updated);
    } catch (error) {
      return failureResponse(error);
    }
  }),
];
