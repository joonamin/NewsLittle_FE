import { ApiError } from "@/lib/api-client";

import type { ReportTarget } from "./report-flow";

/**
 * BE `POST /api/v1/reports`(newslittle.modules.reports.schemas.CreateReportRequest)의
 * model_validator를 그대로 흉내낸다 — 제출 전에 같은 조건으로 막아야 422 왕복 없이
 * 사용자에게 바로 이유를 보여줄 수 있다.
 */
export function validateReportInput(input: {
  reportType: string;
  details: string;
  contact: string;
  target: ReportTarget;
}): string | null {
  if (!input.details.trim()) return "신고 내용을 입력해 주세요.";
  if (input.details.trim().length > 2000) return "신고 내용은 2,000자 이하로 입력해 주세요.";
  if (input.reportType === "RIGHTS" && !input.contact.trim()) {
    return "권리 신고는 연락받을 이메일 또는 연락 경로가 필요합니다.";
  }
  if (input.reportType === "JUDGMENT_ERROR") {
    if (input.target.surface !== "QUIZ" || !input.target.quizId || !input.target.answerRef) {
      return "판정 정보를 확인할 수 없어 이 화면에서는 판정 오류를 신고할 수 없습니다.";
    }
  }
  if (input.target.surface === "QUIZ" && !input.target.quizId) {
    return "문항 정보를 확인할 수 없어 이 화면에서는 신고할 수 없습니다.";
  }
  return null;
}

/** 신고 제출 실패를 상태 코드별 안내 문구로 옮긴다. */
export function reportErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 429) {
    return "신고 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (error instanceof ApiError && error.status === 404) {
    return "신고 대상을 확인할 수 없습니다. 화면을 새로고침해 주세요.";
  }
  return "신고 접수에 실패했어요. 잠시 후 다시 시도해 주세요.";
}
