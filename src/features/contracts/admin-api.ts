import { apiRequest, jsonRequest } from "@/lib/api-client";
import type {
  AdminArticleReviewItem,
  AdminDashboardSummary,
  ReviewDecisionRequest,
  ReviewQueueSummary,
} from "./admin-models";

export const adminApi = {
  /** ADM-01 운영 대시보드 핵심 지표 및 최근 활동 내역 */
  dashboardSummary: () =>
    apiRequest<AdminDashboardSummary>("/api/v1/operations/dashboard/summary"),

  /** ADM-03 검수 대기열 목록 및 기한 요약 */
  reviewQueue: () =>
    apiRequest<ReviewQueueSummary>("/api/v1/operations/reviews/queue"),

  /** ADM-03 특정 기사의 원문 및 AI 생성물(요약/퀴즈) 세부 대조 데이터 */
  articleReview: (articleId: number) =>
    apiRequest<AdminArticleReviewItem>(`/api/v1/operations/reviews/${articleId}`),

  /** ADM-03 검수 판정 제출 (선택 범위 통과 / 반려 / 재생성 요청) */
  submitDecision: (articleId: number, req: ReviewDecisionRequest) =>
    apiRequest<AdminArticleReviewItem>(
      `/api/v1/operations/reviews/${articleId}/decision`,
      jsonRequest("POST", req),
    ),
};
