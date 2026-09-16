import { afterEach, describe, expect, it, vi } from "vitest";

import { memberNavigationFixture } from "@/mocks/fixtures";

import { screenApi } from "./screen-api";

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
});
