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

export const handlers = [
  http.get(`${api}/navigation`, () => HttpResponse.json(memberNavigationFixture)),
  http.get(`${api}/home`, () => HttpResponse.json(homeFixture)),
  http.get(`${api}/quiz/shortform/preview`, () =>
    HttpResponse.json(shortformPreviewFixture),
  ),
  http.get(`${api}/quiz/random/preview`, () => HttpResponse.json(randomPreviewFixture)),
  http.post(`${api}/quiz/shortform/sessions`, () =>
    HttpResponse.json(shortformSessionFixture, { status: 201 }),
  ),
  http.post(`${api}/quiz/random/sessions`, () =>
    HttpResponse.json(randomSessionFixture, { status: 201 }),
  ),
  http.get(`${api}/quiz/shortform/sessions/:sessionId`, () =>
    HttpResponse.json(shortformSessionFixture),
  ),
  http.get(`${api}/quiz/random/sessions/:sessionId`, () =>
    HttpResponse.json(randomSessionFixture),
  ),
  http.get(`${api}/quiz/shortform/sessions/:sessionId/result`, () =>
    HttpResponse.json(shortformResultFixture),
  ),
  http.get(`${api}/quiz/random/sessions/:sessionId/result`, () =>
    HttpResponse.json(randomResultFixture),
  ),
  http.get(`${api}/archive`, () => HttpResponse.json(archiveFixture)),
  http.get(`${api}/settings`, () => HttpResponse.json(settingsFixture)),
  http.post(`${api}/today-list`, () =>
    HttpResponse.json({ todayList: homeFixture.todayList }, { status: 201 }),
  ),
  http.put(`${api}/settings/topics`, () => HttpResponse.json(settingsFixture)),
];
