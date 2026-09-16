import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiRequest } from "./api-client";

describe("api client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("unwraps the success payload and includes session credentials", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: { id: "nav" },
          meta: { requestId: "request-123" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const payload = await apiRequest<{ id: string }>("/api/v1/navigation");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/navigation",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(payload).toEqual({ id: "nav" });
  });

  it("throws ApiError with the response status and error code", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ error: { code: "AUTHENTICATION_REQUIRED" } }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const error = await apiRequest("/api/v1/home").catch((caught) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, code: "AUTHENTICATION_REQUIRED" });
  });

  it("uses UNKNOWN when the error body has no code", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("not json", { status: 500 })),
    );

    const error = await apiRequest("/api/v1/home").catch((caught) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500, code: "UNKNOWN" });
  });
});
