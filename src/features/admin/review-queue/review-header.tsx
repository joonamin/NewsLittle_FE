import { ChevronDown, AlertCircle } from "lucide-react";
import type { ReviewQueueSummary, UsageBasisStatus } from "@/features/contracts/admin-models";

type ReviewHeaderProps = {
  queue: ReviewQueueSummary;
  selectedArticleId: number;
  onSelectArticle: (articleId: number) => void;
  selectedAssetFilter: "all" | "summary" | "quiz";
  onSelectAssetFilter: (filter: "all" | "summary" | "quiz") => void;
  hoursRemaining: number;
  usageBasisStatus: UsageBasisStatus;
};

const usageBasisBadgeText: Record<UsageBasisStatus, string> = {
  CONFIRMED: "이용 승인됨",
  CONDITIONAL: "조건부 사용 가능",
  PENDING: "검토 대기",
  RESTRICTED: "사용 제한됨",
  SUSPENDED: "이용 중단됨",
  PERMITTED: "이용 허용됨",
};

export function ReviewHeader({
  queue,
  selectedArticleId,
  onSelectArticle,
  selectedAssetFilter,
  onSelectAssetFilter,
  hoursRemaining,
  usageBasisStatus,
}: ReviewHeaderProps) {
  const currentItem = queue.items.find((item) => item.articleId === selectedArticleId);
  const currentIndex = queue.items.findIndex((item) => item.articleId === selectedArticleId);
  const isUrgent = hoursRemaining <= 24;

  return (
    <div className="space-y-4">
      {/* 1. 타이틀 및 헤더 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-nl-text">ADM-03 검수 대기열</h1>
        <p className="mt-1 text-xs text-nl-muted">
          관리자 세션 · 뉴스 기사 원문과 AI 파생물(요약·퀴즈) 대조 검수
        </p>
      </div>

      {/* 2. 본문 삭제 기한 경고 배너 (디자인 규격: nl-negative) */}
      <div
        className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-bold shadow-sm ${
          isUrgent
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>
          본문 삭제까지 {hoursRemaining}시간 남음 · 기한(7일)이 지나면 원문이 영구 삭제되어 대조·통과할 수 없습니다.
        </span>
      </div>

      {/* 3. 검수 선택 바 (기사 셀렉터, 자산 필터, 기한 순 카운터) */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-nl-border bg-nl-surface p-3 shadow-xs">
        <div className="flex items-center gap-3">
          {/* 기사 선택 드롭다운 */}
          <div className="relative">
            <select
              value={selectedArticleId}
              onChange={(e) => onSelectArticle(Number(e.target.value))}
              aria-label="검수 대상 기사 선택"
              className="appearance-none rounded-lg border border-nl-border bg-white py-2 pl-3.5 pr-8 text-sm font-semibold text-nl-text shadow-xs hover:border-nl-accent focus:border-nl-accent focus:outline-hidden"
            >
              {queue.items.map((item) => (
                <option key={item.articleId} value={item.articleId}>
                  {item.articleCode} ({item.title.slice(0, 24)}...)
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nl-muted" />
          </div>

          {/* 자산 필터 드롭다운 */}
          <div className="relative">
            <select
              value={selectedAssetFilter}
              onChange={(e) => onSelectAssetFilter(e.target.value as "all" | "summary" | "quiz")}
              aria-label="자산 필터 선택"
              className="appearance-none rounded-lg border border-nl-border bg-white py-2 pl-3.5 pr-8 text-sm font-semibold text-nl-text shadow-xs hover:border-nl-accent focus:border-nl-accent focus:outline-hidden"
            >
              <option value="all">자산: 전체 (요약+문항)</option>
              <option value="summary">자산: 요약만</option>
              <option value="quiz">자산: 퀴즈 문항만</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nl-muted" />
          </div>
        </div>

        {/* 진행 정보 및 이용 근거 배지 */}
        <div className="flex items-center gap-3 text-xs text-nl-muted">
          <span>
            본문 삭제 기한순 · <strong className="text-nl-text font-bold">{currentIndex + 1}</strong> / {queue.totalCount}
          </span>
          <span className="h-3 w-px bg-nl-border" aria-hidden />
          <span>
            이용 근거:{" "}
            <span
              className={`font-semibold rounded-sm px-1.5 py-0.5 ${
                usageBasisStatus === "CONFIRMED"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {usageBasisLabels[usageBasisStatus] ?? usageBasisStatus}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
