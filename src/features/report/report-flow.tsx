import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";

import type {
  ReportJudgmentAttachmentApiModel,
  ReportSurface,
  ReportType,
} from "@/features/contracts/api-models";
import { screenApi } from "@/features/contracts/screen-api";

import { reportErrorMessage } from "./report-validation";

/**
 * GLB-03 신고 모달을 어느 화면에서든 같은 방식으로 열기 위한 대상 정보.
 * BE `POST /api/v1/reports`(newslittle.modules.reports.schemas.CreateReportRequest)와
 * 1:1로 맞춘다 — surface·articleId·quizId·answerRef는 여기서 정한 그대로 전송된다.
 * availableReasons는 대상 성격에 맞는 부분집합만 담는다(예: 문항은 판정 오류·내용 오류,
 * 기사·아카이브 항목은 내용 오류·권리·원문 접근 실패 등).
 */
export type ReportTarget = {
  surface: ReportSurface;
  articleId: string;
  /** surface가 "QUIZ"일 때만 보낸다. 문항(quiz) 정의 자체의 id — 세션 id가 아니다. */
  quizId?: string | null;
  /**
   * 판정 오류 신고에서만 보낸다. `"shortform:<answerId>"` | `"random:<answerId>"`.
   * 현재 어느 화면에서도 실제 제출 답변의 PK를 알 방법이 없어 항상 비어 있다 —
   * BE가 QuizResolutionApiModel에 answerId를 내려주기 전까지는 판정 오류 신고
   * 제출을 막는다(report-modal.tsx의 judgementBlocked 참고).
   */
  answerRef?: string | null;
  /** "신고 대상 · " 접두어는 모달이 붙이므로 원문 라벨만 전달한다. */
  targetLabel: string;
  availableReasons: readonly ReportType[];
  defaultReason?: ReportType;
};

export type ReportSubmitValues = {
  reportType: ReportType;
  details: string;
  contact: string;
};

type ReportFlowState = {
  target: ReportTarget | null;
  submitted: boolean;
  lastResult: { contactProvided: boolean; judgmentAttachment: ReportJudgmentAttachmentApiModel | null } | null;
};

type ReportFlowAction =
  | { type: "open"; target: ReportTarget }
  | { type: "close" }
  | {
      type: "submitted";
      result: { contactProvided: boolean; judgmentAttachment: ReportJudgmentAttachmentApiModel | null };
    };

const initialState: ReportFlowState = { target: null, submitted: false, lastResult: null };

function reportFlowReducer(state: ReportFlowState, action: ReportFlowAction): ReportFlowState {
  switch (action.type) {
    case "open":
      return { target: action.target, submitted: false, lastResult: null };
    case "close":
      return { target: null, submitted: false, lastResult: null };
    case "submitted":
      return { ...state, submitted: true, lastResult: action.result };
  }
}

type ReportFlowContextValue = {
  target: ReportTarget | null;
  submitted: boolean;
  lastResult: ReportFlowState["lastResult"];
  isPending: boolean;
  isError: boolean;
  /** 실패 사유를 상태 코드별로 구분한 안내 문구. 실패 상태가 아니면 null. */
  errorMessage: string | null;
  openReport: (target: ReportTarget) => void;
  closeReport: () => void;
  submitReport: (values: ReportSubmitValues) => Promise<void>;
};

const ReportFlowContext = createContext<ReportFlowContextValue | null>(null);

export function ReportFlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reportFlowReducer, initialState);

  const submitMutation = useMutation({
    mutationFn: screenApi.submitReport,
  });

  const openReport = useCallback(
    (target: ReportTarget) => {
      submitMutation.reset();
      dispatch({ type: "open", target });
    },
    [submitMutation],
  );

  const closeReport = useCallback(() => {
    dispatch({ type: "close" });
  }, []);

  const submitReport = useCallback(
    async ({ reportType, details, contact }: ReportSubmitValues) => {
      const target = state.target;
      if (!target) return;
      const result = await submitMutation.mutateAsync({
        reportType,
        surface: target.surface,
        articleId: target.articleId,
        quizId: target.surface === "QUIZ" ? (target.quizId ?? null) : null,
        answerRef: reportType === "JUDGMENT_ERROR" ? (target.answerRef ?? null) : null,
        details,
        contact: contact.trim() ? contact.trim() : null,
      });
      dispatch({
        type: "submitted",
        result: { contactProvided: result.contactProvided, judgmentAttachment: result.judgmentAttachment },
      });
    },
    [state.target, submitMutation],
  );

  const value = useMemo<ReportFlowContextValue>(
    () => ({
      target: state.target,
      submitted: state.submitted,
      lastResult: state.lastResult,
      isPending: submitMutation.isPending,
      isError: submitMutation.isError,
      errorMessage: submitMutation.isError ? reportErrorMessage(submitMutation.error) : null,
      openReport,
      closeReport,
      submitReport,
    }),
    [
      closeReport,
      openReport,
      state.lastResult,
      state.submitted,
      state.target,
      submitMutation.error,
      submitMutation.isError,
      submitMutation.isPending,
      submitReport,
    ],
  );

  return <ReportFlowContext value={value}>{children}</ReportFlowContext>;
}

export function useReportFlow() {
  const value = useContext(ReportFlowContext);
  if (!value) throw new Error("useReportFlow must be used inside ReportFlowProvider");
  return value;
}
