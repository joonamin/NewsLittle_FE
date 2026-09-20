export type UserReportType =
  | "CONTENT_ERROR"
  | "JUDGMENT_ERROR"
  | "RIGHTS"
  | "SOURCE_UNREACHABLE";

export type UserReportSurface = "HOME_CARD" | "QUIZ" | "ARCHIVE";

export type ReportTarget = {
  surface: UserReportSurface;
  articleId: string;
  articleTitle: string;
  quizId?: string | null;
  answerRef?: string | null;
};

export type CreateReportRequest = {
  reportType: UserReportType;
  surface: UserReportSurface;
  articleId: string;
  quizId?: string;
  answerRef?: string;
  details: string;
  contact?: string;
};

export type ReportJudgmentAttachment = {
  answerRef: string;
  submittedAnswer: string;
  quizVersion: number;
  judgeVersion: string | null;
};

export type CreatedReport = {
  id: string;
  reportType: UserReportType;
  surface: UserReportSurface;
  status: "RECEIVED";
  contactProvided: boolean;
  judgmentAttachment: ReportJudgmentAttachment | null;
  createdAt: string;
};

export function validateReportInput(input: {
  reportType: UserReportType;
  details: string;
  contact: string;
  target: ReportTarget;
}) {
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
