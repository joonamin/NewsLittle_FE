import { useState } from "react";
import Head from "next/head";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  adminReviewQueueQueryOptions,
  adminArticleReviewQueryOptions,
  queryKeys,
} from "@/features/contracts/query-keys";
import { adminApi } from "@/features/contracts/admin-api";
import type { ReviewDecisionRequest } from "@/features/contracts/admin-models";
import { ReviewHeader } from "@/features/admin/review-queue/review-header";
import { SideBySideViewer } from "@/features/admin/review-queue/side-by-side-viewer";
import { ReviewActionBar } from "@/features/admin/review-queue/review-action-bar";
import { Spinner } from "@/components/ui/spinner";
import { AdminError } from "@/components/admin/admin-ui";

export default function AdminReviewPage() {
  const queryClient = useQueryClient();

  // 1. 검수 대기열 전체 목록 조회
  const {
    data: queue,
    isLoading: isQueueLoading,
    isError: isQueueError,
    refetch: refetchQueue,
  } = useQuery(adminReviewQueueQueryOptions);

  // 2. 현재 선택된 기사 ID 상태
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [assetFilter, setAssetFilter] = useState<"all" | "summary" | "quiz">("all");
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // 3. 현재 선택된 기사의 상세 대조 데이터 조회
  // 첫 기사 자동 선택: 별도 effect 없이 렌더링 중 파생시켜 캐스케이드 렌더를 피한다.
  const activeId = queue?.items.some((item) => item.articleId === selectedArticleId)
    ? selectedArticleId!
    : (queue?.items[0]?.articleId ?? 3);
  const { data: reviewItem, isLoading: isItemLoading, isError: isItemError, refetch: refetchItem } = useQuery({
    ...adminArticleReviewQueryOptions(activeId),
    enabled: (queue?.items.length ?? 0) > 0,
  });
  const canReview = Boolean(
    reviewItem?.bodyRetained
      && reviewItem.bodyText.trim()
      && reviewItem.bodyDeletionHoursRemaining > 0,
  );
  const reviewBlockedReason = !reviewItem?.bodyRetained || !reviewItem?.bodyText.trim()
    ? "원문이 없거나 이미 삭제되어 통과·재생성할 수 없습니다."
    : reviewItem.bodyDeletionHoursRemaining <= 0
      ? "원문 보관 기한이 지나 통과·재생성할 수 없습니다."
      : undefined;

  // 4. 판정 처리 Mutation
  const decisionMutation = useMutation({
    mutationFn: (decisionReq: ReviewDecisionRequest) =>
      adminApi.submitDecision(activeId, decisionReq),
    onSuccess: (updatedItem, variables) => {
      // 쿼리 무효화
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.queue });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.articleReview(activeId),
      });

      // 피드백 알림 메시지 설정
      const actionText =
        variables.decisionType === "APPROVE"
          ? "선택 범위 통과(승인) 완료"
          : variables.decisionType === "REJECT"
            ? "반려 처리 완료"
            : "재생성 요청 완료";
      setFeedbackNotice(`${updatedItem.articleCode} 기사가 [${actionText}]되었습니다.`);

      // 3초 후 알림 자동 제거
      setTimeout(() => setFeedbackNotice(null), 4000);

      // 다음 대기 기사로 자동 이동
      if (queue) {
        const currentIndex = queue.items.findIndex((i) => i.articleId === activeId);
        if (currentIndex !== -1 && currentIndex + 1 < queue.items.length) {
          setSelectedArticleId(queue.items[currentIndex + 1].articleId);
        }
      }
    },
    onError: (err) => {
      alert(`판정 처리 중 오류가 발생했습니다: ${err.message}`);
    },
  });

  return (
    <>
      <Head>
        <title>ADM-03 검수 대기열 | NewsLittle Admin</title>
      </Head>
      <AdminShell activeMenuId="review">
        {isQueueLoading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
            <Spinner className="h-8 w-8 text-nl-accent" />
            <p className="text-sm text-nl-muted">검수 대기열을 불러오는 중입니다...</p>
          </div>
        ) : isQueueError || !queue ? (
          <AdminError onRetry={() => void refetchQueue()} />
        ) : (
          <div className="space-y-6">
            {/* 상단 피드백 토스트 알림 */}
            {feedbackNotice && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 shadow-xs flex items-center justify-between">
                <span>{feedbackNotice}</span>
                <button
                  type="button"
                  onClick={() => setFeedbackNotice(null)}
                  className="text-emerald-700 hover:text-emerald-900"
                >
                  닫기
                </button>
              </div>
            )}

            {/* A. 상단 헤더 & 셀렉터 */}
            <ReviewHeader
              queue={queue}
              selectedArticleId={activeId}
              onSelectArticle={(id) => setSelectedArticleId(id)}
              selectedAssetFilter={assetFilter}
              onSelectAssetFilter={setAssetFilter}
              hoursRemaining={reviewItem?.bodyDeletionHoursRemaining ?? 18}
              usageBasisStatus={reviewItem?.usageBasis.status ?? "CONDITIONAL"}
            />

            {/* B. 좌우 2열 병렬 대조 뷰 */}
            {isItemLoading ? (
              <div className="flex min-h-[450px] flex-col items-center justify-center gap-3 rounded-xl border border-nl-border bg-nl-surface">
                <Spinner className="h-6 w-6 text-nl-accent" />
                <p className="text-xs text-nl-muted">기사 원문과 AI 생성물을 대조 중입니다...</p>
              </div>
            ) : isItemError || !reviewItem ? (
              <div className="flex min-h-[450px] flex-col items-center justify-center gap-3 rounded-xl border border-nl-border bg-nl-surface text-center">
                <p className="text-sm font-semibold text-red-600">기사 원문과 생성물을 불러오지 못했습니다.</p>
                <button type="button" onClick={() => void refetchItem()} className="rounded-full border border-nl-border px-4 py-1.5 text-xs text-nl-text hover:bg-nl-subtle">다시 시도</button>
              </div>
            ) : (
              <SideBySideViewer
                reviewItem={reviewItem}
                assetFilter={assetFilter}
              />
            )}

            {/* C. 하단 체크리스트 및 승인/반려 판정 액션 바 */}
            <ReviewActionBar
              key={activeId}
              isSubmitting={decisionMutation.isPending}
              canReview={canReview}
              blockedReason={reviewBlockedReason}
              onDecision={(decision) => decisionMutation.mutate(decision)}
            />
          </div>
        )}
      </AdminShell>
    </>
  );
}
