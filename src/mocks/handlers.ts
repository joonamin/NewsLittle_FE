import { http, HttpResponse } from "msw";

import {
  archiveFixture,
  homeFixture,
  memberNavigationFixture,
  randomPreviewFixture,
  settingsFixture,
  shortformPreviewFixture,
  shortformResultFixture,
  shortformSessionFixture,
} from "./fixtures";
import {
  createRandomQuizSession,
  getRandomQuizResult,
  getRandomQuizSession,
  giveUpRandomQuizQuestion,
  nextRandomQuizQuestion,
  submitRandomQuizAnswer,
} from "./random-quiz-store";

const api = "/api/v1";

function successResponse<T>(data: T, init?: ResponseInit) {
  return HttpResponse.json({ data, meta: { requestId: "mock-request-id" } }, init);
}

export const handlers = [
  http.get(`${api}/navigation`, () => successResponse(memberNavigationFixture)),
  http.get(`${api}/home`, () => successResponse(homeFixture)),
  http.get(`${api}/quiz/shortform/preview`, () => successResponse(shortformPreviewFixture)),
  http.get(`${api}/quiz/random/preview`, () => successResponse(randomPreviewFixture)),
  http.get(`${api}/quiz/shortform/sessions/:sessionId`, () =>
    successResponse(shortformSessionFixture),
  ),
  http.get(`${api}/quiz/random/sessions/:sessionId`, ({ params }) => {
    const sessionId = String(params.sessionId);
    return successResponse(getRandomQuizSession(sessionId));
  }),
  http.post(`${api}/quiz/shortform/sessions`, () =>
    successResponse(shortformSessionFixture, { status: 201 }),
  ),
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
  http.get(`${api}/quiz/random/sessions/:sessionId/result`, ({ params }) => {
    const sessionId = String(params.sessionId);
    return successResponse(getRandomQuizResult(sessionId));
  }),
  http.get(`${api}/archive`, () => successResponse(archiveFixture)),
  http.get(`${api}/settings`, () => successResponse(settingsFixture)),
  http.post(`${api}/today-list`, () =>
    successResponse({ todayList: homeFixture.todayList }, { status: 201 }),
  ),
  http.put(`${api}/settings/topics`, () => successResponse(settingsFixture)),
];
