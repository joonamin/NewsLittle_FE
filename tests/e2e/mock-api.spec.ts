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

  await expect(page).toHaveURL("/random/random-demo-session");
});
