import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { reportApi } from "@/features/reports/report-api";
import {
  type CreatedReport,
  type ReportTarget,
  type UserReportType,
  validateReportInput,
} from "@/features/reports/report-models";
import { ApiError } from "@/lib/api-client";

const reportTypeLabels: Record<UserReportType, string> = {
  CONTENT_ERROR: "내용 오류",
  JUDGMENT_ERROR: "판정 오류",
  RIGHTS: "권리 신고",
  SOURCE_UNREACHABLE: "원문 접근 실패",
};

export type ReportDialogProps = {
  open: boolean;
  target: ReportTarget | null;
  initialType?: UserReportType;
  onClose: () => void;
};

function errorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 429) {
    return "신고 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (error instanceof ApiError && error.status === 404) {
    return "신고 대상을 확인할 수 없습니다. 화면을 새로고침해 주세요.";
  }
  return "신고를 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

export function ReportDialog({ open, target, initialType = "CONTENT_ERROR", onClose }: ReportDialogProps) {
  const [reportType, setReportType] = useState<UserReportType>(initialType);
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedReport | null>(null);

  const close = () => {
    if (pending) return;
    setReportType(initialType);
    setDetails("");
    setContact("");
    setError(null);
    setCreated(null);
    onClose();
  };

  const submit = async () => {
    if (!target || pending) return;
    const validationError = validateReportInput({ reportType, details, contact, target });
    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await reportApi.submit({
        reportType,
        surface: target.surface,
        articleId: target.articleId,
        ...(target.quizId ? { quizId: target.quizId } : {}),
        ...(reportType === "JUDGMENT_ERROR" && target.answerRef
          ? { answerRef: target.answerRef }
          : {}),
        details: details.trim(),
        ...(contact.trim() ? { contact: contact.trim() } : {}),
      });
      setCreated(response);
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={created ? "신고가 접수되었습니다" : "콘텐츠 신고"}
      size="compact"
      footer={
        created ? (
          <div className="flex justify-end">
            <Button size="s" onClick={close}>확인</Button>
          </div>
        ) : (
          <div className="flex justify-end gap-3">
            <Button size="s" variant="secondary" disabled={pending} onClick={close}>취소</Button>
            <Button size="s" disabled={pending || !target} onClick={() => void submit()}>
              {pending ? "접수 중…" : "신고 접수"}
            </Button>
          </div>
        )
      }
    >
      {created ? (
        <div role="status" className="space-y-3 text-sm text-nl-text">
          <p>접수 번호 {created.id}로 안전하게 접수했습니다.</p>
          {created.judgmentAttachment ? (
            <p className="rounded-lg bg-nl-subtle p-3 text-xs text-nl-muted">
              첨부 범위: 내 답변 “{created.judgmentAttachment.submittedAnswer}” · 판정 기준 {created.judgmentAttachment.judgeVersion ?? "미기록"}
            </p>
          ) : null}
          {!created.contactProvided ? <p className="text-xs text-nl-muted">연락 경로가 없어 회신 없이 처리됩니다.</p> : null}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="rounded-lg bg-nl-subtle p-3 text-xs text-nl-muted">신고 대상: {target?.articleTitle ?? "대상 확인 중"}</p>
          <label className="block text-xs font-bold text-nl-text">
            신고 유형
            <select aria-label="신고 유형" value={reportType} onChange={(event) => { setReportType(event.target.value as UserReportType); setError(null); }} className="mt-2 h-11 w-full rounded-lg border border-nl-border bg-nl-bg px-3 text-sm">
              {Object.entries(reportTypeLabels).map(([value, label]) => (
                <option key={value} value={value} disabled={value === "JUDGMENT_ERROR" && (!target?.quizId || !target.answerRef)}>{label}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-bold text-nl-text">
            신고 내용 · 필수
            <textarea aria-label="신고 내용" value={details} maxLength={2000} onChange={(event) => { setDetails(event.target.value); setError(null); }} className="mt-2 min-h-28 w-full rounded-lg border border-nl-border bg-nl-bg p-3 text-sm" placeholder="확인이 필요한 내용을 구체적으로 적어 주세요." />
            <span className="mt-1 block text-right font-normal text-nl-muted">{details.length} / 2,000</span>
          </label>
          <label className="block text-xs font-bold text-nl-text">
            연락 경로 {reportType === "RIGHTS" ? "· 필수" : "· 선택"}
            <input aria-label="연락 경로" value={contact} maxLength={255} onChange={(event) => { setContact(event.target.value); setError(null); }} className="mt-2 h-11 w-full rounded-lg border border-nl-border bg-nl-bg px-3 text-sm" placeholder="이메일 또는 연락 가능한 방법" />
          </label>
          <p className="text-[11px] leading-5 text-nl-muted">계정 이메일은 자동으로 입력하지 않습니다. 입력한 연락처는 신고 처리와 결과 회신에만 사용됩니다.</p>
          {error ? <p role="alert" className="rounded-lg bg-nl-negative-subtle p-3 text-xs text-nl-negative">{error}</p> : null}
        </div>
      )}
    </Modal>
  );
}
