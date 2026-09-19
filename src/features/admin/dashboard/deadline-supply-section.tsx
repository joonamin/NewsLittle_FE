import { Clock, Layers, AlertTriangle, CheckCircle2 } from "lucide-react";

import type {
  DashboardDeadlineWarning,
  DashboardSupplyStatus,
} from "@/features/contracts/admin-models";
import { cn } from "@/lib/cn";

type DeadlineSupplySectionProps = {
  deadlineWarnings: DashboardDeadlineWarning[];
  supplyStatus: DashboardSupplyStatus;
};

export function DeadlineSupplySection({
  deadlineWarnings,
  supplyStatus,
}: DeadlineSupplySectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      {/* 1. 좌측: 기한 경고 카드 */}
      <div className="rounded-xl border border-nl-border bg-nl-surface p-6 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 border-b border-nl-border pb-3">
            <Clock className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-bold text-nl-text">기한 경고</h3>
            <span className="ml-auto text-xs text-nl-muted">만료 임박 자산</span>
          </div>

          <div className="mt-4 space-y-3">
            {deadlineWarnings.map((warning) => (
              <div
                key={warning.id}
                className={cn(
                  "flex items-center justify-between rounded-lg px-4 py-3 border text-sm transition-colors",
                  warning.severity === "critical"
                    ? "border-red-200 bg-red-50/40 text-red-900"
                    : warning.severity === "warning"
                      ? "border-amber-200 bg-amber-50/40 text-amber-900"
                      : "border-nl-border bg-nl-subtle/50 text-nl-text"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      warning.severity === "critical"
                        ? "bg-red-500"
                        : warning.severity === "warning"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    )}
                  />
                  <span className="font-semibold">{warning.label}</span>
                  <span className="font-mono text-xs text-nl-muted">
                    ({warning.assetCode})
                  </span>
                </div>

                <span
                  className={cn(
                    "text-xs font-bold font-mono px-2 py-0.5 rounded",
                    warning.severity === "critical"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-800"
                  )}
                >
                  {warning.remainingTimeText}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 border-t border-nl-border pt-3 text-[11px] text-nl-muted">
          본문 48시간 만료 및 파생물 30일 만료 시 시스템에 의해 자동 회수·삭제됩니다.
        </div>
      </div>

      {/* 2. 우측: 오늘의 공급 상태 카드 */}
      <div className="rounded-xl border border-nl-border bg-nl-surface p-6 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 border-b border-nl-border pb-3">
            <Layers className="h-4 w-4 text-nl-accent" />
            <h3 className="text-sm font-bold text-nl-text">오늘의 공급 상태</h3>
            <span className="ml-auto text-xs text-nl-muted">홈 피드 및 퀴즈 풀</span>
          </div>

          <div className="mt-4 space-y-3">
            {/* 기본 공급 정상 지표 */}
            <div className="flex items-center justify-between rounded-lg border border-nl-border bg-nl-subtle/40 px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-nl-text">게시 가능 기사</span>
              </div>
              <span className="font-mono font-bold text-nl-text">
                {supplyStatus.publishableArticleCount}개
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-nl-border bg-nl-subtle/40 px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-nl-text">선택형 문항 (OX/객관식)</span>
              </div>
              <span className="font-mono font-bold text-nl-text">
                {supplyStatus.choiceQuestionCount}개
              </span>
            </div>

            {/* 주관식 공급 부족 경고 (5개 미만 시 보류) */}
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border px-4 py-3 text-sm",
                supplyStatus.subjectiveSuspended
                  ? "border-red-200 bg-red-50/50 text-red-900"
                  : "border-nl-border bg-nl-subtle/40 text-nl-text"
              )}
            >
              <div className="flex items-center gap-2">
                {supplyStatus.subjectiveSuspended ? (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
                <div>
                  <span className="font-semibold">주관식 문항</span>
                  {supplyStatus.subjectiveSuspended && (
                    <span className="ml-2 text-xs font-bold text-red-600">
                      랜덤 주관식 시작 보류
                    </span>
                  )}
                </div>
              </div>
              <span
                className={cn(
                  "font-mono font-bold",
                  supplyStatus.subjectiveSuspended ? "text-red-600" : "text-nl-text"
                )}
              >
                {supplyStatus.subjectiveQuestionCount}개
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-nl-border pt-3 text-[11px] text-nl-muted">
          {supplyStatus.noticeText} (NFR-08 최소 출제 풀 기준)
        </div>
      </div>
    </div>
  );
}
