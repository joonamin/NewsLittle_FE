import { useState } from "react";
import { ChevronDown, AlertCircle, Search } from "lucide-react";
import type { ReviewQueueSummary, UsageBasisStatus } from "@/features/contracts/admin-models";
import { cn } from "@/lib/cn";

type ReviewHeaderProps = {
  queue: ReviewQueueSummary;
  selectedArticleId: number;
  onSelectArticle: (articleId: number) => void;
  selectedAssetFilter: "all" | "summary" | "quiz";
  onSelectAssetFilter: (filter: "all" | "summary" | "quiz") => void;
  hoursRemaining: number;
  usageBasisStatus: UsageBasisStatus;
};

const usageBasisLabels: Record<UsageBasisStatus, string> = {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [expiryFilter, setExpiryFilter] = useState<"ACTIVE" | "EXPIRED" | "ALL">("ACTIVE");

  const currentItem = queue.items.find((item) => item.articleId === selectedArticleId);
  const isUrgent = hoursRemaining <= 24 && hoursRemaining > 0;
  const isExpired = hoursRemaining <= 0;

  const activeCount = queue.items.filter((item) => item.bodyDeletionHoursRemaining > 0).length;
  const expiredCount = queue.items.filter((item) => item.bodyDeletionHoursRemaining <= 0).length;

  const filteredItems = queue.items.filter((item) => {
    const matchesSearch =
      item.articleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (expiryFilter === "ACTIVE") return item.bodyDeletionHoursRemaining > 0;
    if (expiryFilter === "EXPIRED") return item.bodyDeletionHoursRemaining <= 0;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* 1. 타이틀 및 헤더 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-nl-text">ADM-03 검수 대기열</h1>
        <p className="mt-1 text-xs text-nl-muted">
          관리자 세션 · 뉴스 기사 원문과 AI 파생물(요약·퀴즈) 대조 검수
        </p>
      </div>

      {/* 2. 본문 삭제 기한 경고 배너 */}
      <div
        className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-bold shadow-sm ${
          isExpired
            ? "border-gray-300 bg-gray-50 text-gray-700"
            : isUrgent
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>
          {isExpired
            ? "원문 보관 기한(7일)이 지나 본문이 영구 삭제되었습니다. 대조할 수 없으므로 통과·승인할 수 없으며 반려만 가능합니다."
            : `본문 삭제까지 ${hoursRemaining}시간 남음 · 기한(7일)이 지나면 원문이 영구 삭제되어 대조·통과할 수 없습니다.`}
        </span>
      </div>

      {/* 3. 검수 대기 기사 표 (기사 코드, 제목, 남은 삭제 기한, 현재 상태) */}
      <div className="overflow-hidden rounded-xl border border-nl-border bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nl-border bg-nl-subtle/50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* 상태 필터 탭 바: 검수 가능(기본) / 만료됨 / 전체 */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setExpiryFilter("ACTIVE")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer",
                  expiryFilter === "ACTIVE"
                    ? "bg-nl-accent text-white shadow-xs"
                    : "bg-white text-nl-muted border border-nl-border hover:bg-nl-subtle",
                )}
              >
                검수 가능 (기한 내) · {activeCount}건
              </button>
              <button
                type="button"
                onClick={() => setExpiryFilter("EXPIRED")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer",
                  expiryFilter === "EXPIRED"
                    ? "bg-nl-accent text-white shadow-xs"
                    : "bg-white text-nl-muted border border-nl-border hover:bg-nl-subtle",
                )}
              >
                만료됨 (승인 불가) · {expiredCount}건
              </button>
              <button
                type="button"
                onClick={() => setExpiryFilter("ALL")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer",
                  expiryFilter === "ALL"
                    ? "bg-nl-accent text-white shadow-xs"
                    : "bg-white text-nl-muted border border-nl-border hover:bg-nl-subtle",
                )}
              >
                전체 · {queue.totalCount}건
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-nl-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="기사 코드 또는 제목 검색"
                className="rounded-lg border border-nl-border bg-white pl-8 pr-3 py-1.5 text-xs text-nl-text placeholder:text-nl-muted hover:border-nl-accent focus:border-nl-accent focus:outline-hidden"
              />
            </div>
            <div className="relative">
              <select
                value={selectedAssetFilter}
                onChange={(e) => onSelectAssetFilter(e.target.value as "all" | "summary" | "quiz")}
                aria-label="자산 필터 선택"
                className="appearance-none rounded-lg border border-nl-border bg-white py-1.5 pl-3 pr-7 text-xs font-semibold text-nl-text shadow-xs hover:border-nl-accent focus:border-nl-accent focus:outline-hidden"
              >
                <option value="all">자산: 전체</option>
                <option value="summary">자산: 요약만</option>
                <option value="quiz">자산: 퀴즈만</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-nl-muted" />
            </div>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-nl-subtle text-nl-muted border-b border-nl-border z-10">
              <tr>
                <th className="p-3 w-28">기사 코드</th>
                <th className="p-3">제목</th>
                <th className="p-3 w-36">남은 삭제 기한</th>
                <th className="p-3 w-36">현재 상태</th>
                <th className="p-3 w-24 text-center">대조 검수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nl-border">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-nl-muted">
                    {expiryFilter === "ACTIVE"
                      ? "현재 검수 가능한(기한 내) 대기 기사가 없습니다."
                      : "검색 조건에 맞는 기사가 없습니다."}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = item.articleId === selectedArticleId;
                  const itemUrgent = item.bodyDeletionHoursRemaining <= 24 && item.bodyDeletionHoursRemaining > 0;
                  const itemExpired = item.bodyDeletionHoursRemaining <= 0;

                  return (
                    <tr
                      key={item.articleId}
                      onClick={() => onSelectArticle(item.articleId)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-nl-accent-subtle/80 font-semibold"
                          : "hover:bg-nl-subtle"
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-nl-text">
                        {item.articleCode}
                      </td>
                      <td className="p-3 text-nl-text">
                        <span className="line-clamp-1">{item.title}</span>
                      </td>
                      <td className="p-3">
                        {!itemExpired ? (
                          <span
                            className={`rounded-sm px-2 py-0.5 text-[11px] font-bold ${
                              itemUrgent
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-800"
                            }`}
                          >
                            {item.bodyDeletionHoursRemaining}시간 남음
                          </span>
                        ) : (
                          <span className="rounded-sm bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">
                            만료됨
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {!itemExpired ? (
                          <span className="inline-flex items-center rounded-sm bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                            검수 대기 (승인 필요)
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-sm bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">
                            기한 만료 (승인 불가)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {isSelected ? (
                          <span className="inline-block rounded-full bg-nl-accent px-2.5 py-0.5 text-[10px] font-bold text-white">
                            검수 중
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectArticle(item.articleId);
                            }}
                            className="rounded-full border border-nl-border bg-white px-2.5 py-0.5 text-[10px] font-medium text-nl-muted hover:border-nl-accent hover:text-nl-accent cursor-pointer"
                          >
                            선택
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 현재 선택된 기사 맥락 바 */}
      {currentItem && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-nl-border bg-nl-surface p-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-nl-accent bg-nl-accent-subtle px-2.5 py-1 rounded-lg">
              선택된 기사: {currentItem.articleCode}
            </span>
            <span className="text-xs font-semibold text-nl-text line-clamp-1 max-w-lg">
              {currentItem.title}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-nl-muted">
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
      )}
    </div>
  );
}
