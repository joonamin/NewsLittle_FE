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

  it("updates lastAggregatedAt when refreshed", () => {
    const refreshed = store.refresh();
    expect(refreshed.lastAggregatedAt).toMatch(/^\d{2}:\d{2}$/);
  });

  it("prepends new activity log and caps at 10 items", () => {
    store.recordActivity("검수 통과", "N-9999-99", "운영자 테스트");
    const summary = store.getSummary();

    expect(summary.recentActivities).toHaveLength(10);
    expect(summary.recentActivities[0]).toMatchObject({
      action: "검수 통과",
      assetCode: "N-9999-99",
      actor: "운영자 테스트",
    });
  });

  it("toggles deletion failure alert between active and normal", () => {
    // Initially hasFailure: true (count: 2)
    const toggledOff = store.toggleDeletionFailure();
    expect(toggledOff.deletionFailureAlert.hasFailure).toBe(false);
    expect(toggledOff.deletionFailureAlert.count).toBe(0);
    expect(toggledOff.pendingCounts.deletionFailureCount).toBe(0);

    // Toggle back on
    const toggledOn = store.toggleDeletionFailure();
    expect(toggledOn.deletionFailureAlert.hasFailure).toBe(true);
    expect(toggledOn.deletionFailureAlert.count).toBe(2);
    expect(toggledOn.pendingCounts.deletionFailureCount).toBe(2);
  });

  it("resets dashboard store to default state", () => {
    store.reset();
    const summary = store.getSummary();

    expect(summary.deletionFailureAlert.count).toBe(2);
    expect(summary.recentActivities).toHaveLength(10);
  });
});
