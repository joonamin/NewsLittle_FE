import { http, HttpResponse } from "msw";

import {
  randomPreviewFixture,
  randomResultFixture,
  randomSessionFixture,
  settingsFixture,
  shortformPreviewFixture,
  shortformResultFixture,
  shortformSessionFixture,
} from "./fixtures";
import { mockHomeStore } from "./home-store";

const api = "/api/v1";

function successResponse<T>(data: T, init?: ResponseInit) {
  return HttpResponse.json({ data, meta: { requestId: "mock-request-id" } }, init);
}

function failureResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
  const status = code === "AUTHENTICATION_REQUIRED" ? 401 : code === "ARTICLE_NOT_FOUND" ? 404 : 500;
  return HttpResponse.json({ error: { code } }, { status });
}

export const handlers = [
  http.get(`${api}/navigation`, () => successResponse(mockHomeStore.navigation())),
  http.get(`${api}/home`, () => successResponse(mockHomeStore.home())),
  http.post(`${api}/auth/google`, () =>
    successResponse({ viewer: mockHomeStore.login() }),
  ),
  http.post(`${api}/auth/logout`, () =>
    successResponse({ viewer: mockHomeStore.logout() }),
  ),
  http.get(`${api}/quiz/shortform/preview`, () =>
    successResponse(shortformPreviewFixture),
  ),
  http.get(`${api}/quiz/random/preview`, () => successResponse(randomPreviewFixture)),
  http.post(`${api}/quiz/shortform/sessions`, () =>
    successResponse(shortformSessionFixture, { status: 201 }),
  ),
  http.post(`${api}/quiz/random/sessions`, () =>
    successResponse(randomSessionFixture, { status: 201 }),
  ),
  http.get(`${api}/quiz/shortform/sessions/:sessionId`, () =>
    successResponse(shortformSessionFixture),
  ),
  http.get(`${api}/quiz/random/sessions/:sessionId`, () =>
    successResponse(randomSessionFixture),
  ),
  http.get(`${api}/quiz/shortform/sessions/:sessionId/result`, () =>
    successResponse(shortformResultFixture),
  ),
  http.get(`${api}/quiz/random/sessions/:sessionId/result`, () =>
    successResponse(randomResultFixture),
  ),
  http.get(`${api}/archive`, () => successResponse(mockHomeStore.archive())),
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
