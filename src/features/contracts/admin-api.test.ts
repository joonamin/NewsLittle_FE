import { afterEach, describe, expect, it, vi } from "vitest";

import { adminApi } from "./admin-api";
import type { AdminArticleReviewItem, ReviewQueueSummary } from "./admin-models";

describe("admin API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches review queue summary", async () => {
    const mockSummary: ReviewQueueSummary = {
      totalCount: 1,
      currentIndex: 0,
      items: [
        {
          articleId: 3,
          articleCode: "ART-003",
          title: "테스트 기사",
          bodyDeletionHoursRemaining: 48,
          usageBasisStatus: "CONDITIONAL",
        },
      ],
    };

    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: mockSummary,
          meta: { requestId: "req-1" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await adminApi.reviewQueue();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/operations/reviews/queue",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(result.totalCount).toBe(1);
    expect(result.items[0].articleId).toBe(3);
  });

  it("fetches specific article review detail", async () => {
    const mockDetail: Partial<AdminArticleReviewItem> = {
      articleId: 3,
      articleCode: "ART-003",
      title: "테스트 기사",
      bodyText: "원문 본문",
    };

    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: mockDetail,
          meta: { requestId: "req-2" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await adminApi.articleReview(3);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/operations/reviews/3",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(result.articleId).toBe(3);
  });

  it("submits review decision (APPROVE)", async () => {
    const mockResponse: Partial<AdminArticleReviewItem> = {
      articleId: 3,
      homeApproved: true,
      quizApproved: true,
    };

    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: mockResponse,
          meta: { requestId: "req-3" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await adminApi.submitDecision(3, {
      decisionType: "APPROVE",
      homeApproved: true,
      quizApproved: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/operations/reviews/3/decision",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          decisionType: "APPROVE",
          homeApproved: true,
          quizApproved: true,
        }),
      }),
    );
    expect(result.homeApproved).toBe(true);
  });
});
