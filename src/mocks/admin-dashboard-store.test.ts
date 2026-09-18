import { beforeEach, describe, expect, it } from "vitest";

import { createAdminDashboardStore } from "./admin-dashboard-store";

describe("admin dashboard store", () => {
  let store: ReturnType<typeof createAdminDashboardStore>;

  beforeEach(() => {
    store = createAdminDashboardStore();
  });

  it("returns dashboard summary with all metrics and logs", () => {
    const summary = store.getSummary();

    expect(summary.lastAggregatedAt).toBe("09:42");
    expect(summary.deletionFailureAlert.hasFailure).toBe(true);
    expect(summary.deletionFailureAlert.count).toBe(2);

    // 5 KPI counts
    expect(summary.pendingCounts.reviewPendingCount).toBeGreaterThanOrEqual(4);
    expect(summary.pendingCounts.usageBasisPendingCount).toBe(3);
    expect(summary.pendingCounts.deletionFailureCount).toBe(2);
    expect(summary.pendingCounts.unprocessedReportCount).toBe(4);
    expect(summary.pendingCounts.correctionPendingCount).toBe(1);

    // Warnings and supply status
    expect(summary.deadlineWarnings).toHaveLength(3);
    expect(summary.deadlineWarnings[0].assetCode).toBe("N-0913-08");
    expect(summary.supplyStatus.subjectiveSuspended).toBe(true);
    expect(summary.supplyStatus.subjectiveQuestionCount).toBe(3);

    // Recent 10 activities
    expect(summary.recentActivities).toHaveLength(10);
    expect(summary.recentActivities[0].action).toBe("검수 통과");
  });

  it("resets dashboard store to default state", () => {
    store.reset();
    const summary = store.getSummary();

    expect(summary.deletionFailureAlert.count).toBe(2);
    expect(summary.recentActivities).toHaveLength(10);
  });
});
