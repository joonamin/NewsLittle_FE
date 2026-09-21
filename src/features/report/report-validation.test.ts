import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api-client";

import { reportErrorMessage, validateReportInput } from "./report-validation";
import type { ReportTarget } from "./report-flow";

const homeTarget: ReportTarget = {
  surface: "HOME_CARD",
  articleId: "12",
  targetLabel: "기사",
  availableReasons: ["CONTENT_ERROR", "RIGHTS", "SOURCE_UNREACHABLE"],
};

const quizTarget: ReportTarget = {
  surface: "QUIZ",
  articleId: "12",
  targetLabel: "문항",
  availableReasons: ["JUDGMENT_ERROR", "CONTENT_ERROR"],
  quizId: "3",
  answerRef: "random:9",
};

describe("validateReportInput", () => {
  it("accepts a home content-error report", () => {
    expect(
      validateReportInput({ reportType: "CONTENT_ERROR", details: "요약이 원문과 달라요.", contact: "", target: homeTarget }),
    ).toBeNull();
  });

  it("requires non-empty details", () => {
    expect(
      validateReportInput({ reportType: "CONTENT_ERROR", details: "   ", contact: "", target: homeTarget }),
    ).toMatch(/신고 내용/);
  });

  it("requires an explicitly entered contact for rights reports", () => {
    expect(
      validateReportInput({ reportType: "RIGHTS", details: "권리 확인이 필요합니다.", contact: "", target: homeTarget }),
    ).toMatch(/연락/);
  });

  it("requires server-issued quizId and answerRef for judgment reports", () => {
    expect(
      validateReportInput({ reportType: "JUDGMENT_ERROR", details: "판정이 이상합니다.", contact: "", target: quizTarget }),
    ).toBeNull();
    expect(
      validateReportInput({
        reportType: "JUDGMENT_ERROR",
        details: "판정이 이상합니다.",
        contact: "",
        target: { ...quizTarget, quizId: undefined },
      }),
    ).toMatch(/판정 정보/);
  });

  it("requires a quizId for any quiz-surface report, not just judgment errors", () => {
    expect(
      validateReportInput({
        reportType: "CONTENT_ERROR",
        details: "문항 내용이 이상합니다.",
        contact: "",
        target: { ...quizTarget, quizId: undefined },
      }),
    ).toMatch(/문항 정보/);
  });
});

describe("reportErrorMessage", () => {
  it("explains rate limiting", () => {
    expect(reportErrorMessage(new ApiError(429, "RATE_LIMITED"))).toMatch(/너무 많습니다/);
  });

  it("explains a missing report target", () => {
    expect(reportErrorMessage(new ApiError(404, "NOT_FOUND"))).toMatch(/확인할 수 없습니다/);
  });

  it("falls back to a generic message for other failures", () => {
    expect(reportErrorMessage(new ApiError(500, "SERVER_ERROR"))).toMatch(/접수에 실패했/);
    expect(reportErrorMessage(new Error("network"))).toMatch(/접수에 실패했/);
  });
});
