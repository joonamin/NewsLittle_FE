import { http, HttpResponse } from "msw";

import {
  archiveFixture,
  homeFixture,
  memberNavigationFixture,
  randomPreviewFixture,
  randomResultFixture,
  randomSessionFixture,
  settingsFixture,
  shortformPreviewFixture,
  shortformResultFixture,
  shortformSessionFixture,
} from "./fixtures";

const api = "/api/v1";

function successResponse<T>(data: T, init?: ResponseInit) {
  return HttpResponse.json({ data, meta: { requestId: "mock-request-id" } }, init);
}

export const handlers = [
  http.get(`${api}/navigation`, () => successResponse(memberNavigationFixture)),
  http.get(`${api}/home`, () => successResponse(homeFixture)),
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
  http.get(`${api}/archive`, () => successResponse(archiveFixture)),
  http.get(`${api}/settings`, () => successResponse(settingsFixture)),
  http.post(`${api}/today-list`, () =>
    successResponse({ todayList: homeFixture.todayList }, { status: 201 }),
  ),
  http.put(`${api}/settings/topics`, () => successResponse(settingsFixture)),
];
