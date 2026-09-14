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
  expect(response.body.viewer.role).toBe("member");
  expect(response.body.feed.items).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: "article-library-program",
        summary: expect.objectContaining({ aiGenerated: true }),
      }),
    ]),
  );
});
