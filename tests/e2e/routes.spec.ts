import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "뉴스 탐색" },
  { path: "/random", heading: "랜덤 퀴즈 시작" },
  { path: "/random/random-session", heading: "랜덤 퀴즈 풀이" },
  { path: "/random/random-session/result", heading: "랜덤 퀴즈 결과" },
  { path: "/quiz", heading: "숏폼 퀴즈 시작" },
  { path: "/quiz/quiz-session", heading: "숏폼 퀴즈 풀이" },
  { path: "/quiz/quiz-session/result", heading: "숏폼 퀴즈 결과" },
  { path: "/archive", heading: "아카이브" },
  { path: "/settings", heading: "설정" },
] as const;

for (const route of routes) {
  test(`${route.path} renders its route skeleton`, async ({ page }) => {
    await page.goto(route.path);

    await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
  });
}
