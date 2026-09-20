import { useState } from "react";
import { Check, X, RotateCcw, AlertTriangle } from "lucide-react";

import type { ReviewDecisionRequest } from "@/features/contracts/admin-models";
import { Button } from "@/components/ui/button";

type ReviewActionBarProps = {
  isSubmitting: boolean;
  canReview: boolean;
  blockedReason?: string;
  onDecision: (decision: ReviewDecisionRequest) => void;
};

export function ReviewActionBar({ isSubmitting, canReview, blockedReason, onDecision }: ReviewActionBarProps) {
  // 체크리스트 5종 상태
  const [checklist, setChecklist] = useState({
    factChecked: false,
    opinionDistinguished: false,
    baselineTimeConfirmed: false,
    noPriorReadingNeeded: false,
    imageRightsConfirmed: false,
  });

  // 통과 범위 체크박스 2종
  const [homeApproved, setHomeApproved] = useState(true);
  const [quizApproved, setQuizApproved] = useState(true);

  // 형식 및 유형 선택
  // 반려 및 재생성 사유
  const [reason, setReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [decisionMode, setDecisionMode] = useState<"REJECT" | "REGENERATE">("REJECT");
  const checklistComplete = Object.values(checklist).every(Boolean);

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApprove = () => {
    onDecision({
      homeApproved,
      quizApproved,
      decisionType: "APPROVE",
      checklist,
    });
  };

  const handleOpenReject = (mode: "REJECT" | "REGENERATE") => {
    setDecisionMode(mode);
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!reason.trim()) {
      alert("반려 또는 재생성 사유를 반드시 입력해 주세요.");
      return;
    }
    onDecision({
      homeApproved: false,
      quizApproved: false,
      decisionType: decisionMode,
      reason,
      checklist,
    });
    setShowRejectModal(false);
    setReason("");
  };

  return (
    <div className="rounded-xl border border-nl-border bg-nl-surface p-5 shadow-xs space-y-4">
      {/* 1. 체크리스트 섹션 */}
      <div className="border-b border-nl-border pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-nl-muted block mb-2">
          검수 체크리스트 (5항목)
        </span>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-nl-text">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checklist.factChecked}
              onChange={() => toggleCheck("factChecked")}
              className="rounded-sm border-nl-border text-nl-accent focus:ring-nl-accent"
            />
            <span>사실·숫자 대조</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checklist.opinionDistinguished}
              onChange={() => toggleCheck("opinionDistinguished")}
              className="rounded-sm border-nl-border text-nl-accent focus:ring-nl-accent"
            />
            <span>전망·의견 구분</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checklist.baselineTimeConfirmed}
              onChange={() => toggleCheck("baselineTimeConfirmed")}
              className="rounded-sm border-nl-border text-nl-accent focus:ring-nl-accent"
            />
            <span>기준 시점 확인</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checklist.noPriorReadingNeeded}
              onChange={() => toggleCheck("noPriorReadingNeeded")}
              className="rounded-sm border-nl-border text-nl-accent focus:ring-nl-accent"
            />
            <span>랜덤 사전 독해 불필요</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checklist.imageRightsConfirmed}
              onChange={() => toggleCheck("imageRightsConfirmed")}
              className="rounded-sm border-nl-border text-nl-accent focus:ring-nl-accent"
            />
            <span>이미지 오인·권리 확인</span>
          </label>
        </div>
      </div>

      {/* 2. 형식·유형 및 통과 범위 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* 통과 범위 체크박스 */}
        <div className="flex items-center gap-4 text-xs font-semibold text-nl-text">
          <span className="text-nl-muted font-normal">통과 범위:</span>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={homeApproved}
              onChange={(e) => setHomeApproved(e.target.checked)}
              className="rounded-sm border-nl-border text-nl-accent focus:ring-nl-accent"
            />
            <span>홈 게시 승인</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={quizApproved}
              onChange={(e) => setQuizApproved(e.target.checked)}
              className="rounded-sm border-nl-border text-nl-accent focus:ring-nl-accent"
            />
            <span>퀴즈 출제 승인</span>
          </label>
        </div>

        {/* 판정 액션 버튼 그룹 */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={() => handleOpenReject("REGENERATE")}
            disabled={isSubmitting || !canReview}
            className="flex items-center gap-1.5 text-xs text-nl-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>재생성 요청</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={() => handleOpenReject("REJECT")}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:bg-red-50"
          >
            <X className="h-3.5 w-3.5" />
            <span>반려</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="xs"
            onClick={handleApprove}
            disabled={isSubmitting || !canReview || !checklistComplete || (!homeApproved && !quizApproved)}
            className="flex items-center gap-1.5 text-xs font-bold"
          >
            <Check className="h-3.5 w-3.5" />
            <span>선택 범위 통과</span>
          </Button>
        </div>
      </div>

      {!canReview && blockedReason ? (
        <p role="alert" className="rounded-lg bg-nl-negative-subtle px-3 py-2 text-xs font-semibold text-nl-negative">
          {blockedReason}
        </p>
      ) : !checklistComplete ? (
        <p className="text-xs text-nl-muted">체크리스트 5개를 모두 직접 확인해야 통과할 수 있습니다.</p>
      ) : null}

      {/* 3. 하단 운영 제약 캡션 (디자인 명시) */}
      <div className="pt-2 text-[11px] text-nl-muted flex items-center justify-between border-t border-nl-border/60">
        <span>개별 통과만 허용 · 일괄 자동 통과 버튼 없음 · 원문 복사·내보내기 금지</span>
        <span>검토자: dev-admin@newslittle.local (실행 계정 불변 기록)</span>
      </div>

      {/* 반려 / 재생성 사유 입력 모달 */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-nl-border">
            <div className="flex items-center gap-2 text-nl-text font-bold text-base mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span>{decisionMode === "REJECT" ? "콘텐츠 검수 반려" : "AI 재생성 요청"}</span>
            </div>
            <p className="text-xs text-nl-muted mb-4">
              {decisionMode === "REJECT"
                ? "반려 사유를 구체적으로 기록해야 합니다. 기록된 사유는 감사 로그에 보존됩니다."
                : "재생성이 필요한 사유와 개선 포인트를 작성해 주세요."}
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 원문에 없는 추측성 인과관계 추가됨 / 객관식 정답 오류 / 문법 어색"
              rows={4}
              className="w-full rounded-lg border border-nl-border p-3 text-xs text-nl-text focus:border-nl-accent focus:outline-hidden"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setShowRejectModal(false)}
              >
                취소
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={handleConfirmReject}
              >
                {decisionMode === "REJECT" ? "반려 처리" : "재생성 요청"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
