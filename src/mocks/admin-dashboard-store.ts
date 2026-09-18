import type { AdminDashboardSummary } from "@/features/contracts/admin-models";
import { mockAdminReviewStore } from "./admin-review-store";

const defaultDashboardSummary: AdminDashboardSummary = {
  lastAggregatedAt: "09:42",
  deletionFailureAlert: {
    hasFailure: true,
    count: 2,
    message: "삭제 실패 2건 · 확인되지 않은 자산은 재게시할 수 없습니다.",
  },
  pendingCounts: {
    reviewPendingCount: 12, // ADM-03 검수 대기열
    usageBasisPendingCount: 3, // ADM-02 이용 근거 검토
    deletionFailureCount: 2, // ADM-05 삭제 실패 상태
    unprocessedReportCount: 4, // ADM-06 미처리 신고 접수
    correctionPendingCount: 1, // ADM-04 정정 대기
  },
  deadlineWarnings: [
    {
      id: "warn-1",
      label: "본문 삭제 임박",
      assetCode: "N-0913-08",
      remainingTimeText: "18시간",
      severity: "critical",
    },
    {
      id: "warn-2",
      label: "파생물 만료 임박",
      assetCode: "Q-0815-02",
      remainingTimeText: "1일",
      severity: "warning",
    },
    {
      id: "warn-3",
      label: "계약 종료 임박",
      assetCode: "LIC-004",
      remainingTimeText: "2일",
      severity: "info",
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
    { id: "act-1", time: "09:40", assetCode: "N-0914-12", action: "검수 통과", actor: "운영자 A" },
    { id: "act-2", time: "09:38", assetCode: "N-0914-11", action: "게시 확인", actor: "운영자 A" },
    { id: "act-3", time: "09:36", assetCode: "N-0914-10", action: "삭제 요청", actor: "운영자 A" },
    { id: "act-4", time: "09:34", assetCode: "N-0914-09", action: "검수 통과", actor: "운영자 A" },
    { id: "act-5", time: "09:30", assetCode: "N-0914-08", action: "정정 등록", actor: "운영자 B" },
    { id: "act-6", time: "09:25", assetCode: "N-0914-07", action: "신고 접수", actor: "시스템" },
    { id: "act-7", time: "09:20", assetCode: "N-0914-06", action: "검수 통과", actor: "운영자 A" },
    { id: "act-8", time: "09:15", assetCode: "N-0914-05", action: "게시 확인", actor: "운영자 A" },
    { id: "act-9", time: "09:10", assetCode: "N-0914-04", action: "이용 승인", actor: "운영자 B" },
    { id: "act-10", time: "09:05", assetCode: "N-0914-03", action: "검수 반려", actor: "운영자 A" },
  ],
};

export function createAdminDashboardStore(initial = defaultDashboardSummary) {
  let summary = JSON.parse(JSON.stringify(initial)) as AdminDashboardSummary;

  return {
    getSummary(): AdminDashboardSummary {
      // 검수 대기열의 실제 잔여 건수와 연동
      const queueSummary = mockAdminReviewStore.getQueueSummary();
      const actualReviewPending = queueSummary.totalCount;

      return {
        ...summary,
        pendingCounts: {
          ...summary.pendingCounts,
          reviewPendingCount: Math.max(actualReviewPending, summary.pendingCounts.reviewPendingCount),
        },
      };
    },

    reset() {
      summary = JSON.parse(JSON.stringify(defaultDashboardSummary));
    },
  };
}

export const mockAdminDashboardStore = createAdminDashboardStore();
