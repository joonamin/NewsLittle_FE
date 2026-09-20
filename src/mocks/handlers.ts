import { delay, http, HttpResponse } from "msw";

import type { SubmitReportRequest, TopicCode } from "@/features/contracts/api-models";

import { randomPreviewFixture } from "./fixtures";
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
import { mockAdminOperationsStore } from "./admin-operations-store";
import type { ReportClassification, ReviewDecisionRequest, UsageBasisStatusV2 } from "@/features/contracts/admin-models";

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
          : code === "DUPLICATE_ARCHIVE_TITLE"
            ? 409
            : 500;
  const message = code === "DUPLICATE_ARCHIVE_TITLE" ? "이미 사용 중인 이름입니다." : undefined;
  return HttpResponse.json({ error: { code, message } }, { status });
}

export const handlers = [
  http.get(`${api}/navigation`, () => successResponse(mockHomeStore.navigation())),
  http.get(`${api}/home`, () => successResponse(mockHomeStore.home())),
  http.get(`${api}/feed`, ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    return successResponse(mockHomeStore.feed(cursor));
  }),
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
  http.post(`${api}/auth/dev-session`, () => successResponse(mockHomeStore.loginAsAdmin())),
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
  http.post(`${api}/today-list/archive`, async ({ request }) => {
    try {
      const payload = (await request.json().catch(() => null)) as { title?: string } | null;
      return successResponse(mockHomeStore.archiveTodayList(payload?.title ?? ""));
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
  /**
   * GLB-03 신고 접수(FR-14). BE `newslittle.modules.reports.schemas.CreateReportRequest`의
   * model_validator(권리는 연락 경로 필수, quizId는 surface=QUIZ일 때만·반드시,
   * answerRef는 JUDGMENT_ERROR일 때만·반드시, JUDGMENT_ERROR는 surface=QUIZ여야 함)를
   * 그대로 흉내낸다 — 로컬에서도 같은 조건으로 422가 나야 계약 어긋남을 바로 잡을 수 있다.
   */
  http.post(`${api}/reports`, async ({ request }) => {
    const payload = (await request.json().catch(() => null)) as Partial<SubmitReportRequest> | null;
    if (!payload?.reportType || !payload.surface || !payload.articleId || !payload.details?.trim()) {
      return failureResponse(new Error("VALIDATION_ERROR"));
    }
    if (payload.reportType === "RIGHTS" && !payload.contact?.trim()) {
      return failureResponse(new Error("VALIDATION_ERROR"));
    }
    if ((payload.surface === "QUIZ") !== Boolean(payload.quizId)) {
      return failureResponse(new Error("VALIDATION_ERROR"));
    }
    if ((payload.reportType === "JUDGMENT_ERROR") !== Boolean(payload.answerRef)) {
      return failureResponse(new Error("VALIDATION_ERROR"));
    }
    if (payload.reportType === "JUDGMENT_ERROR" && payload.surface !== "QUIZ") {
      return failureResponse(new Error("VALIDATION_ERROR"));
    }
    return successResponse(
      {
        id: `mock-report-${Date.now()}`,
        reportType: payload.reportType,
        surface: payload.surface,
        status: "RECEIVED",
        contactProvided: Boolean(payload.contact?.trim()),
        judgmentAttachment: payload.answerRef
          ? {
              answerRef: payload.answerRef,
              submittedAnswer: "모의 답변",
              quizVersion: 1,
              judgeVersion: "mock-judge-v1",
            }
          : null,
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  // ADM-01 운영 대시보드
  http.get(`${api}/operations/dashboard/summary`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get("refresh") === "true") {
      mockAdminDashboardStore.refresh();
    }
    return successResponse(mockAdminDashboardStore.getSummary());
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

  // ADM-02 이용 근거·상태
  http.get(`${api}/operations/usage-bases`, () => successResponse({ items: mockAdminOperationsStore.usageBases(), totalCount: mockAdminOperationsStore.usageBases().length })),
  http.get(`${api}/operations/usage-bases/:id`, ({ params }) => successResponse(mockAdminOperationsStore.usageBasis(String(params.id)))),
  http.put(`${api}/operations/usage-bases/:id`, async ({ params, request }) => successResponse(mockAdminOperationsStore.updateUsageBasis(String(params.id), await request.json() as never))),
  http.post(`${api}/operations/usage-bases/:id/transition`, async ({ params, request }) => { const body = await request.json() as { status: UsageBasisStatusV2; reason: string }; return successResponse(mockAdminOperationsStore.transitionUsageBasis(String(params.id), body.status, body.reason)); }),

  // ADM-04 게시·정정·중단
  http.get(`${api}/operations/assets`, () => successResponse({ items: mockAdminOperationsStore.assets(), totalCount: mockAdminOperationsStore.assets().length })),
  http.get(`${api}/operations/assets/:articleId`, ({ params }) => successResponse(mockAdminOperationsStore.asset(Number(params.articleId)))),
  http.post(`${api}/operations/assets/:articleId/publish`, ({ params }) => successResponse(mockAdminOperationsStore.assetAction(Number(params.articleId), "publish", "게시 조건 확인"))),
  http.post(`${api}/operations/assets/:articleId/corrections`, async ({ params, request }) => { const body = await request.json() as { correction: string }; return successResponse(mockAdminOperationsStore.assetAction(Number(params.articleId), "correct", body.correction)); }),
  ...(["suspend", "withdraw", "restore"] as const).map((action) => http.post(`${api}/operations/assets/:articleId/${action}`, async ({ params, request }) => { const body = await request.json() as { reason: string }; return successResponse(mockAdminOperationsStore.assetAction(Number(params.articleId), action, body.reason)); })),

  // ADM-05 삭제·만료
  http.get(`${api}/operations/deletions`, () => successResponse({ items: mockAdminOperationsStore.deletions(), totalCount: mockAdminOperationsStore.deletions().length })),
  http.get(`${api}/operations/deletions/:id`, ({ params }) => successResponse(mockAdminOperationsStore.deletion(String(params.id)))),
  http.post(`${api}/operations/deletions/:id/retry`, ({ params }) => successResponse(mockAdminOperationsStore.retryDeletion(String(params.id)))),
  http.post(`${api}/operations/deletions/:id/scopes/:scope/confirm`, async ({ params, request }) => { const body = await request.json() as { reason: string }; return successResponse(mockAdminOperationsStore.confirmScope(String(params.id), String(params.scope), body.reason)); }),
  http.post(`${api}/operations/deletions/:id/retention-exception`, async ({ params, request }) => successResponse(mockAdminOperationsStore.retention(String(params.id), await request.json() as { basis: string; period: string; accessScope: string }))),

  // ADM-06 신고 처리
  http.get(`${api}/operations/reports`, () => successResponse({ items: mockAdminOperationsStore.reports(), totalCount: mockAdminOperationsStore.reports().length })),
  http.get(`${api}/operations/reports/:id`, ({ params }) => successResponse(mockAdminOperationsStore.report(String(params.id)))),
  http.post(`${api}/operations/reports/:id/classify`, async ({ params, request }) => { const body = await request.json() as { classification: ReportClassification; note: string }; return successResponse(mockAdminOperationsStore.classify(String(params.id), body.classification, body.note)); }),
  http.post(`${api}/operations/reports/:id/hold`, async ({ params, request }) => { const body = await request.json() as { reason: string }; return successResponse(mockAdminOperationsStore.hold(String(params.id), body.reason)); }),
  http.post(`${api}/operations/reports/:id/resolve`, async ({ params, request }) => { const body = await request.json() as { status: "RESOLVED" | "REJECTED"; reason: string }; return successResponse(mockAdminOperationsStore.resolve(String(params.id), body.status, body.reason)); }),
  http.post(`${api}/operations/reports/:id/reply-record`, async ({ params, request }) => { const body = await request.json() as { reply: string }; return successResponse(mockAdminOperationsStore.reply(String(params.id), body.reply)); }),
];
