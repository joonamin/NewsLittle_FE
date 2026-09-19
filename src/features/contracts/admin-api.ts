import { apiRequest, jsonRequest } from "@/lib/api-client";
import type {
  AdminArticleReviewItem,
  AdminDashboardSummary,
  ReviewDecisionRequest,
  ReviewQueueSummary,
  AdminAsset,
  AdminDeletionTask,
  AdminListResponse,
  AdminReport,
  AssetStatus,
  DeletionStatus,
  ReportClassification,
  ReportStatus,
  ReportType,
  UsageBasis,
  UsageBasisStatusV2,
  UsageBasisUpsertRequest,
} from "./admin-models";

function queryString(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => value && search.set(key, value));
  const result = search.toString();
  return result ? `?${result}` : "";
}

export const adminApi = {
  /** ADM-01 운영 대시보드 핵심 지표 및 최근 활동 내역 */
  dashboardSummary: (refresh = false) =>
    apiRequest<AdminDashboardSummary>(
      `/api/v1/operations/dashboard/summary${refresh ? "?refresh=true" : ""}`
    ),

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

  usageBases: (params: { status?: UsageBasisStatusV2; q?: string } = {}) =>
    apiRequest<AdminListResponse<UsageBasis>>(`/api/v1/operations/usage-bases${queryString(params)}`),
  usageBasis: (id: string) => apiRequest<UsageBasis>(`/api/v1/operations/usage-bases/${id}`),
  createUsageBasis: (req: UsageBasisUpsertRequest) =>
    apiRequest<UsageBasis>("/api/v1/operations/usage-bases", jsonRequest("POST", req)),
  updateUsageBasis: (id: string, req: Partial<UsageBasisUpsertRequest>) =>
    apiRequest<UsageBasis>(`/api/v1/operations/usage-bases/${id}`, jsonRequest("PUT", req)),
  transitionUsageBasis: (id: string, status: UsageBasisStatusV2, reason: string) =>
    apiRequest<UsageBasis>(`/api/v1/operations/usage-bases/${id}/transition`, jsonRequest("POST", { status, reason })),

  assets: (params: { status?: AssetStatus; q?: string } = {}) =>
    apiRequest<AdminListResponse<AdminAsset>>(`/api/v1/operations/assets${queryString(params)}`),
  asset: (articleId: number) => apiRequest<AdminAsset>(`/api/v1/operations/assets/${articleId}`),
  publishAsset: (articleId: number) =>
    apiRequest<AdminAsset>(`/api/v1/operations/assets/${articleId}/publish`, jsonRequest("POST", {})),
  correctAsset: (articleId: number, correction: string, source: string) =>
    apiRequest<AdminAsset>(`/api/v1/operations/assets/${articleId}/corrections`, jsonRequest("POST", { correction, source })),
  changeAssetState: (articleId: number, action: "suspend" | "withdraw" | "restore", reason: string) =>
    apiRequest<AdminAsset>(`/api/v1/operations/assets/${articleId}/${action}`, jsonRequest("POST", { reason })),

  deletions: (status?: DeletionStatus) =>
    apiRequest<AdminListResponse<AdminDeletionTask>>(`/api/v1/operations/deletions${queryString({ status })}`),
  deletion: (id: string) => apiRequest<AdminDeletionTask>(`/api/v1/operations/deletions/${id}`),
  retryDeletion: (id: string) =>
    apiRequest<AdminDeletionTask>(`/api/v1/operations/deletions/${id}/retry`, jsonRequest("POST", {})),
  confirmDeletionScope: (id: string, scope: string, reason: string) =>
    apiRequest<AdminDeletionTask>(`/api/v1/operations/deletions/${id}/scopes/${scope}/confirm`, jsonRequest("POST", { reason })),
  createRetentionException: (id: string, req: { basis: string; period: string; accessScope: string }) =>
    apiRequest<AdminDeletionTask>(`/api/v1/operations/deletions/${id}/retention-exception`, jsonRequest("POST", req)),

  reports: (params: { type?: ReportType; status?: ReportStatus; classification?: ReportClassification } = {}) =>
    apiRequest<AdminListResponse<AdminReport>>(`/api/v1/operations/reports${queryString(params)}`),
  report: (id: string) => apiRequest<AdminReport>(`/api/v1/operations/reports/${id}`),
  classifyReport: (id: string, classification: ReportClassification, note: string) =>
    apiRequest<AdminReport>(`/api/v1/operations/reports/${id}/classify`, jsonRequest("POST", { classification, note })),
  holdReport: (id: string, reason: string) =>
    apiRequest<AdminReport>(`/api/v1/operations/reports/${id}/hold`, jsonRequest("POST", { reason })),
  resolveReport: (id: string, status: "RESOLVED" | "REJECTED", action: string, reason: string) =>
    apiRequest<AdminReport>(`/api/v1/operations/reports/${id}/resolve`, jsonRequest("POST", { status, action, reason })),
  recordReportReply: (id: string, reply: string) =>
    apiRequest<AdminReport>(`/api/v1/operations/reports/${id}/reply-record`, jsonRequest("POST", { reply })),
};
