import { expect, test } from "@playwright/test";

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
        id: "article-library-program",
        summary: expect.objectContaining({ aiGenerated: true }),
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
