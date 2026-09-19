import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { ReportType } from "@/features/contracts/api-models";
import { cn } from "@/lib/cn";

import { useReportFlow, type ReportTarget } from "./report-flow";

const reasonOrder: readonly ReportType[] = [
  "CONTENT_ERROR",
  "JUDGMENT_ERROR",
  "RIGHTS",
  "SOURCE_UNREACHABLE",
];

const reasonLabels: Record<ReportType, string> = {
  CONTENT_ERROR: "내용 오류",
  JUDGMENT_ERROR: "판정 오류",
  RIGHTS: "권리",
  SOURCE_UNREACHABLE: "원문 접근 실패",
};

const reasonPlaceholders: Record<ReportType, string> = {
  CONTENT_ERROR: "어떤 내용이 잘못됐는지 알려주세요.",
  JUDGMENT_ERROR: "어떤 판정이 잘못됐는지 알려주세요.",
  RIGHTS: "권리자와 요청 범위, 문제가 되는 내용을 알려주세요.",
  SOURCE_UNREACHABLE: "원문에 접근할 수 없었던 상황을 알려주세요.",
};

const DETAILS_MAX_LENGTH = 2000;
const CONTACT_MAX_LENGTH = 255;

/**
 * GLB-03 전역 신고 모달. 대상만 화면마다 다르고(useReportFlow의 target),
 * 모달·유형 체계·문구는 항상 동일하다. 비회원도 제출할 수 있고, 계정 이메일은
 * 어떤 경우에도 연락 경로에 자동으로 채우지 않는다(COM-04).
 *
 * target이 바뀔 때마다 폼 상태를 초기화해야 하는데, 이펙트로 setState를 흉내내는 대신
 * target별로 고유한 key를 주어 폼 컴포넌트를 다시 마운트하는 방식으로 처리한다.
 */
export function ReportModal() {
  const { target } = useReportFlow();
  if (!target) return null;
  return (
    <ReportModalForm key={`${target.surface}:${target.articleId}:${target.quizId ?? ""}`} target={target} />
  );
}

function ReportModalForm({ target }: { target: ReportTarget }) {
  const { submitted, lastResult, isPending, isError, closeReport, submitReport } = useReportFlow();
  const [reason, setReason] = useState<ReportType | null>(
    target.defaultReason ?? target.availableReasons[0] ?? null,
  );
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [showsContactError, setShowsContactError] = useState(false);
  const detailsId = useId();
  const contactId = useId();

  const requiresContact = reason === "RIGHTS";
  // 판정 오류는 BE가 요구하는 answerRef(실제 제출 답변 PK)를 아직 어느 화면에서도
  // 구성할 수 없다 — 값 없이 보내면 422로 거절되므로 여기서 먼저 막는다.
  const judgementBlocked = reason === "JUDGMENT_ERROR" && !target.answerRef;
  const canSubmit = Boolean(reason) && details.trim().length > 0 && !isPending && !judgementBlocked;

  const handleSubmit = async () => {
    if (!reason || judgementBlocked) return;
    if (requiresContact && !contact.trim()) {
      setShowsContactError(true);
      return;
    }
    await submitReport({ reportType: reason, details: details.trim(), contact });
  };

  return (
    <Modal
      open
      onClose={closeReport}
      title={submitted ? "신고가 접수됐어요" : "문제를 알려주세요"}
      footer={
        submitted ? (
          <div className="flex w-full justify-end">
            <Button onClick={closeReport}>확인</Button>
          </div>
        ) : (
          <div className="flex w-full justify-end gap-3">
            <Button variant="secondary" onClick={closeReport}>
              취소
            </Button>
            <Button disabled={!canSubmit} onClick={() => void handleSubmit()}>
              {isPending ? "접수 중…" : "신고 접수"}
            </Button>
          </div>
        )
      }
    >
      {submitted ? (
        <div className="flex flex-col gap-3">
          <p className="text-nl-body text-nl-muted">
            확인 후 처리 결과를 알려드려요.
            {lastResult?.contactProvided ? "" : " 연락 경로를 남기지 않아 별도 회신 없이 처리돼요."}
          </p>
          {lastResult?.judgmentAttachment ? (
            <div className="rounded-nl-button bg-nl-subtle p-3 text-nl-micro text-nl-muted">
              <p>첨부된 내 답변 · {lastResult.judgmentAttachment.submittedAnswer}</p>
              <p>판정 기준 버전 · {lastResult.judgmentAttachment.judgeVersion ?? "-"}</p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-nl-caption text-nl-muted">신고 대상 · {target.targetLabel}</p>

          <div role="radiogroup" aria-label="신고 유형" className="flex flex-wrap gap-x-5 gap-y-2">
            {reasonOrder
              .filter((code) => target.availableReasons.includes(code))
              .map((code) => (
                <label
                  key={code}
                  className="flex cursor-pointer items-center gap-2 text-nl-caption text-nl-text"
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={code}
                    checked={reason === code}
                    onChange={() => setReason(code)}
                    className="h-4 w-4 accent-nl-accent"
                  />
                  {reasonLabels[code]}
                </label>
              ))}
          </div>

          {reason === "JUDGMENT_ERROR" ? (
            <p className="rounded-nl-button bg-nl-subtle p-3 text-nl-micro text-nl-muted">
              {judgementBlocked
                ? "이 유형은 아직 접수 준비가 끝나지 않았어요. 내용 오류로 대신 알려주시면 확인할게요."
                : "이 문항의 내 답변과 판정 기준 버전이 자동으로 첨부돼요."}
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            <label htmlFor={detailsId} className="text-nl-caption font-bold text-nl-text">
              신고 내용
            </label>
            <textarea
              id={detailsId}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={DETAILS_MAX_LENGTH}
              placeholder={reason ? reasonPlaceholders[reason] : "문제가 되는 내용을 알려주세요."}
              className="min-h-[104px] w-full rounded-nl-card border border-nl-border bg-nl-bg p-4 text-nl-caption text-nl-text"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={contactId} className="text-nl-caption font-bold text-nl-text">
              연락 경로 · 권리 신고는 필수
            </label>
            <input
              id={contactId}
              type="text"
              value={contact}
              onChange={(event) => {
                setContact(event.target.value);
                if (showsContactError) setShowsContactError(false);
              }}
              maxLength={CONTACT_MAX_LENGTH}
              placeholder="이메일 또는 연락 가능한 경로"
              className={cn(
                "h-14 w-full rounded-nl-card border bg-nl-bg px-4 text-nl-caption text-nl-text",
                showsContactError ? "border-nl-negative" : "border-nl-border",
              )}
            />
            {showsContactError ? (
              <p role="alert" className="text-nl-micro text-nl-negative">
                권리 신고는 연락 경로가 필요해요.
              </p>
            ) : null}
          </div>

          <p className="text-nl-micro text-nl-muted">
            신고 확인과 처리 결과 회신을 위해 사용합니다. 계정 이메일은 자동으로 입력하지 않습니다. 입력하지
            않으면 회신 없이 처리돼요.
          </p>

          {isError ? (
            <p role="alert" className="text-nl-caption text-nl-negative">
              신고 접수에 실패했어요. 잠시 후 다시 시도해 주세요.
            </p>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
