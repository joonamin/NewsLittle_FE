import { afterEach, describe, expect, it, vi } from "vitest";

import { memberNavigationFixture } from "@/mocks/fixtures";

import { ApiRequestError, isAuthRequiredError, screenApi } from "./screen-api";

describe("screen API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("unwraps the success response and includes session credentials", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: memberNavigationFixture,
          meta: { requestId: "request-123" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const navigation = await screenApi.navigation();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/navigation",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(navigation).toMatchObject({
      account: { status: "member", displayName: "뉴스리틀 사용자" },
      primaryItems: expect.arrayContaining([expect.objectContaining({ id: "archive" })]),
    });
  });

  it("throws an ApiRequestError that isAuthRequiredError recognizes on a guest 401", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: { code: "AUTHENTICATION_REQUIRED", message: "로그인이 필요합니다." },
          meta: { requestId: "request-401" },
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(screenApi.addToTodayList({ articleId: "article-1" })).rejects.toSatisfy((error) => {
      expect(error).toBeInstanceOf(ApiRequestError);
      expect(isAuthRequiredError(error)).toBe(true);
      return true;
    });
  });

  it("does not treat an unrelated error as auth-required", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: { code: "NOT_FOUND", message: "요청한 리소스를 찾을 수 없습니다." },
          meta: { requestId: "request-404" },
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(screenApi.addToTodayList({ articleId: "article-1" })).rejects.toSatisfy((error) => {
      expect(isAuthRequiredError(error)).toBe(false);
      return true;
    });
  });

  it("treats a plain thrown value as not auth-required", () => {
    expect(isAuthRequiredError(new Error("network down"))).toBe(false);
    expect(isAuthRequiredError("nope")).toBe(false);
  });
});
