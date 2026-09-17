import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "뉴스 탐색" },
  { path: "/random", heading: "퀴즈로 새로운 뉴스를 만나보세요" },
  { path: "/random/random-session", heading: "랜덤 퀴즈" },
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

test("guest archive navigation opens the login prompt instead of changing routes", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("navigation", { name: "주 내비게이션" }).getByRole("link", { name: "아카이브" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("dialog", { name: "로그인이 필요해요" })).toBeVisible();
});

test("navigation controls render the glass interaction and primary current state", async ({ page }) => {
  await page.goto("/");

  const desktopNav = page.getByRole("navigation", { name: "주 내비게이션" });
  const home = desktopNav.getByRole("link", { name: "홈", exact: true });
  const random = desktopNav.getByRole("link", { name: "랜덤 퀴즈", exact: true });

  await expect(home).toHaveClass(/nl-nav-glass/);
  await expect(home).toHaveClass(/text-nl-accent/);
  await random.hover();
  await expect(random).toHaveCSS("backdrop-filter", "blur(12px)");
});

test("quiz play navigation asks once before leaving", async ({ page }) => {
  await page.goto("/random/random-session");

  const desktopNav = page.getByRole("navigation", { name: "주 내비게이션" });
  await desktopNav.getByRole("link", { name: "홈", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "퀴즈를 그만둘까요?" })).toBeVisible();

  await page.getByRole("button", { name: "계속 풀기" }).click();
  await expect(page).toHaveURL("/random/random-session");

  await desktopNav.getByRole("link", { name: "홈", exact: true }).click();
  await page.getByRole("button", { name: "나가기" }).click();
  await expect(page).toHaveURL("/");
});
