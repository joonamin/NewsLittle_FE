import { expect, test } from "@playwright/test";

import { firstArticle, secondArticle } from "../../src/mocks/fixtures";

test("member home uses the PEN feed card and today-list sidebar interaction", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: firstArticle.title })).toBeVisible();
  await expect(page.getByRole("img", { name: "나무가 우거진 공원 산책로" })).toBeVisible();
  await expect(page.getByRole("button", { name: "오늘 목록에 담김" })).toBeVisible();

  await page.getByRole("button", { name: "오늘 목록에 담김" }).click();
  await expect(page.getByRole("button", { name: "오늘 목록에 담기" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "오늘 목록" })).not.toContainText(firstArticle.title);

  await page.getByRole("button", { name: "오늘 목록에 담기" }).click();
  await expect(page.getByRole("button", { name: "오늘 목록에 담김" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "오늘 목록" })).toContainText(firstArticle.title);

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
test("random quiz preview selects a format and creates a session", async ({ page }) => {
  await page.goto("/random");

  await expect(page.getByRole("heading", { name: "퀴즈로 새로운 뉴스를 만나보세요" })).toBeVisible();
  await expect(page.getByRole("radio", { name: /OX·객관식/ })).toHaveAttribute("aria-checked", "true");

  await page.getByRole("radio", { name: /주관식형/ }).click();
  await expect(page.getByRole("radio", { name: /주관식형/ })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "5문제 시작하기" }).click();

  await expect(page).toHaveURL("/random/random-written-demo-session");
  await expect(page.getByLabel("내 답변")).toBeVisible();
});

test("random choice quiz submits an answer and reveals the evidence article", async ({ page }) => {
  await page.goto("/random/random-demo-session");
  await page.getByRole("radio", { name: "청소년" }).click();
  await page.getByRole("button", { name: "제출하기" }).click();
  await expect(page.getByText("정답이에요")).toBeVisible();
  await expect(page.getByRole("heading", { name: /청소년 과학 교실/ })).toBeVisible();
});

test("random written quiz keeps empty answers out of judgement", async ({ page }) => {
  await page.goto("/random/random-written-demo-session");
  await expect(page.getByRole("button", { name: "제출하기" })).toBeDisabled();
  await page.getByLabel("내 답변").fill("청소년");
  await expect(page.getByRole("button", { name: "제출하기" })).toBeEnabled();
});

test("random written quiz shows a hint after an incorrect answer", async ({ page }) => {
  await page.goto("/random/random-written-demo-session");
  await page.getByLabel("내 답변").fill("성인");
  await page.getByRole("button", { name: "제출하기" }).click();
  await expect(page.getByText(/아직 정답이 아니에요/)).toBeVisible();
  await expect(page.getByRole("button", { name: "다시 제출" })).toBeVisible();
});

test("random quiz keeps the current index after giving up and answering the next question", async ({ page }) => {
  await page.goto("/random/random-written-demo-session");
  await page.getByRole("button", { name: "포기" }).click();
  await page.getByRole("button", { name: "다음 문제 →" }).click();
  await expect(page.getByText("02 / 05")).toBeVisible();
  await page.getByLabel("내 답변").fill("틀린 답");
  await page.getByRole("button", { name: "제출하기" }).click();
  await expect(page.getByText("02 / 05")).toBeVisible();
});

test("random choice quiz renders an incorrect resolution and can save its article", async ({ page }) => {
  await page.goto("/random/random-demo-session");
  await page.getByRole("radio", { name: "성인" }).click();
  await page.getByRole("button", { name: "제출하기" }).click();
  await expect(page.getByText("오답", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "오늘 목록에 담기" }).click();
  await expect(page.getByRole("button", { name: "오늘 목록에 담김" })).toBeDisabled();
});

test("random quiz result page renders summary, toggles recap items, and saves articles", async ({ page }) => {
  await page.goto("/random/random-demo-session/result");

  await expect(page.getByRole("heading", { name: "다섯 문제로 만난 오늘의 뉴스" })).toBeVisible();
  const summarySection = page.getByLabel("결과 요약");
  await expect(summarySection.getByText(/최초 계획 5문제/)).toBeVisible();
  await expect(summarySection.getByText("정답")).toBeVisible();
  await expect(summarySection.getByText("선택형 오답")).toBeVisible();
  await expect(summarySection.getByText("서비스 제외", { exact: true })).toBeVisible();

  const recapSection = page.getByLabel("문항별 복기");
  await expect(recapSection.getByRole("heading", { name: "문항별 복기" })).toBeVisible();
  await expect(recapSection.getByText(/01/)).toBeVisible();
  await expect(recapSection.getByRole("button", { name: "오늘 목록에 담기" })).toBeVisible();

  await recapSection.getByRole("button", { name: "오늘 목록에 담기" }).click();
  await expect(recapSection.getByRole("button", { name: "오늘 목록에 담김" })).toBeDisabled();

  await page.getByRole("button", { name: "새 회차 시작" }).click();
  await expect(page).toHaveURL("/random?format=choice");
});

