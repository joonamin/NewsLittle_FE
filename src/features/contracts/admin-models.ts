/**
 * ADM-03 검수 대기열 및 관리자 공통 API 모델 & 뷰 모델
 * GitBook 명세(06-admin-screens/adm-03-review-queue.md) 및 백엔드 실제 퀴즈 데이터 스키마 준수
 */

export type AnswerFormat = "OX" | "MULTIPLE_CHOICE" | "SUBJECTIVE";
export type QuestionKind = "FACT" | "SEMANTIC" | null;
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type UsageBasisStatus = "CONFIRMED" | "CONDITIONAL" | "PENDING" | "RESTRICTED";

export type AdminQuizItem = {
  id: number;
  article_id: number;
  answer_format: AnswerFormat;
  question_kind: QuestionKind;
  prompt: string;
  context: string | null;
  choices: Array<{ id: string; text: string }> | null;
  correct_answer: string;
  key_concepts: string[] | null;
  hint_1: string;
  hint_2: string;
  explanation: string;
  status: "ELIGIBLE" | "EXCLUDED";
  version: number;
  review_status: ReviewStatus;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminArticleReviewItem = {
  articleId: number;
  articleCode: string; // 예: "N-0913-08"
  title: string;
  source: {
    id: string;
    name: string;
  };
  publishedAt: string;
  collectedAt: string;
  bodyText: string;
  bodyDeletionHoursRemaining: number; // 본문 7일 삭제까지 남은 시간 (초/시간)
  bodyRetained: boolean; // 7일 경과 시 false
  usageBasis: {
    status: UsageBasisStatus;
    label: string; // "조건부 사용 가능" 등
  };
  summary: {
    text: string;
    reviewStatus: ReviewStatus;
  };
  quizzes: AdminQuizItem[];
  homeApproved: boolean;
  quizApproved: boolean;
  rejectedReason: string | null;
};

export type ReviewQueueSummary = {
  totalCount: number;
  currentIndex: number;
  items: Array<{
    articleId: number;
    articleCode: string;
    title: string;
    bodyDeletionHoursRemaining: number;
    usageBasisStatus: UsageBasisStatus;
  }>;
};

export type ReviewDecisionRequest = {
  homeApproved?: boolean;
  quizApproved?: boolean;
  decisionType: "APPROVE" | "REJECT" | "REGENERATE";
  reason?: string;
  checklist?: {
    factChecked: boolean;
    opinionDistinguished: boolean;
    baselineTimeConfirmed: boolean;
    noPriorReadingNeeded: boolean;
    imageRightsConfirmed: boolean;
  };
};
