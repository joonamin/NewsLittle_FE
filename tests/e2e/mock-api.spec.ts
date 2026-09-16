import { expect, test } from "@playwright/test";

import { firstArticle, secondArticle } from "../../src/mocks/fixtures";

test("member home uses the PEN feed card and today-list sidebar interaction", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: firstArticle.title })).toBeVisible();
  await expect(page.getByRole("img", { name: "나무가 우거진 공원 산책로" })).toBeVisible();
  await expect(page.getByRole("button", { name: "오늘 목록에 담김" })).toBeVisible();

  await page.getByRole("button", { name: "다음 기사" }).click();
  await expect(page.getByRole("heading", { name: secondArticle.title })).toBeVisible();
  await expect(page.getByRole("img", { name: "나무가 우거진 공원 산책로" })).toHaveCount(0);

  await page.getByRole("button", { name: "오늘 목록에 담기" }).click();
  await expect(page.getByRole("button", { name: "오늘 목록에 담김" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "오늘 목록" })).toContainText(secondArticle.title);

  await page.getByRole("button", { name: `${secondArticle.title} 삭제` }).click();
  await expect(page.getByRole("button", { name: "오늘 목록에 담기" })).toBeVisible();
});

test("MSW returns the home API contract before a backend exists", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  const response = await page.evaluate(async () => {
    const apiResponse = await fetch("/api/v1/home");
    return {
      ok: apiResponse.ok,
      body: await apiResponse.json(),
    };
  });

  expect(response.ok).toBe(true);
  expect(response.body.meta.requestId).toBe("mock-request-id");
  expect(response.body.data.viewer.role).toBe("member");
  expect(response.body.data.feed.items).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        article: expect.objectContaining({
          id: "article-library-program",
          summary: expect.objectContaining({ aiGenerated: true }),
        }),
        isFromPreviousFeedDate: false,
      }),
    ]),
  );
});

test("MSW returns the server-authorized navigation contract", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  const response = await page.evaluate(async () => {
    const apiResponse = await fetch("/api/v1/navigation");
    return { ok: apiResponse.ok, body: await apiResponse.json() };
  });

  expect(response.ok).toBe(true);
  expect(response.body.meta.requestId).toBe("mock-request-id");
  expect(response.body.data.account.status).toBe("member");
  expect(response.body.data.primaryItems).not.toContainEqual(expect.objectContaining({ id: "operations" }));
});

test("MSW persists today-list mutations and switches the authenticated home state", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  const response = await page.evaluate(async () => {
    const before = await fetch("/api/v1/home").then((result) => result.json());
    await fetch("/api/v1/today-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: "article-science-class" }),
    });
    const afterAdd = await fetch("/api/v1/home").then((result) => result.json());
    await fetch("/api/v1/today-list/article-library-program", { method: "DELETE" });
    const afterRemove = await fetch("/api/v1/home").then((result) => result.json());
    await fetch("/api/v1/auth/logout", { method: "POST" });
    const guest = await fetch("/api/v1/home").then((result) => result.json());
    await fetch("/api/v1/auth/google", { method: "POST" });
    const member = await fetch("/api/v1/home").then((result) => result.json());

    return { before, afterAdd, afterRemove, guest, member };
  });

  expect(response.before.data.todayList.items).toHaveLength(1);
  expect(response.afterAdd.data.todayList.items.map((item: { article: { id: string } }) => item.article.id)).toEqual([
    "article-library-program",
    "article-science-class",
  ]);
  expect(response.afterRemove.data.todayList.items.map((item: { article: { id: string } }) => item.article.id)).toEqual([
    "article-science-class",
  ]);
  expect(response.guest.data.viewer.role).toBe("guest");
  expect(response.guest.data.todayList).toBeNull();
  expect(response.member.data.viewer.role).toBe("member");
  expect(response.member.data.todayList.items).toHaveLength(1);
});
