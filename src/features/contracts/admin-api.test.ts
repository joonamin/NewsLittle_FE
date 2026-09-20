import { afterEach, describe, expect, it, vi } from "vitest";

import { adminApi } from "./admin-api";
import type {
  AdminArticleReviewItem,
  AdminDashboardSummary,
  ReviewQueueSummary,
} from "./admin-models";

describe("admin API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches dashboard summary metrics and logs", async () => {
    const mockDashboard: AdminDashboardSummary = {
      lastAggregatedAt: "09:42",
      deletionFailureAlert: {
        hasFailure: true,
        count: 2,
        message: "삭제 실패 2건 · 확인되지 않은 자산은 재게시할 수 없습니다.",
      },
      pendingCounts: {
        reviewPendingCount: 12,
        usageBasisPendingCount: 3,
        deletionFailureCount: 2,
        unprocessedReportCount: 4,
        correctionPendingCount: 1,
      },
      deadlineWarnings: [
        {
          id: "warn-1",
          label: "본문 삭제 임박",
          assetCode: "N-0913-08",
          remainingTimeText: "18시간",
          severity: "critical",
        },
      ],
      supplyStatus: {
        publishableArticleCount: 12,
        choiceQuestionCount: 24,
        subjectiveQuestionCount: 3,
        subjectiveSuspended: true,
        noticeText: "5문제 미만인 형식만 보류합니다.",
      },
      recentActivities: [
        {
          id: "act-1",
          time: "09:40",
          assetCode: "N-0914-12",
          action: "검수 통과",
          actor: "운영자 A",
        },
      ],
    };

    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: mockDashboard,
          meta: { requestId: "req-dash" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await adminApi.dashboardSummary();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/operations/dashboard/summary",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(result.pendingCounts.reviewPendingCount).toBe(12);
    expect(result.deletionFailureAlert.hasFailure).toBe(true);
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
      "/api/v1/operations/reviews/queue?page=1&pageSize=100",
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
