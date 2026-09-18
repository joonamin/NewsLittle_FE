import Head from "next/head";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { DeletionAlertBanner } from "@/features/admin/dashboard/deletion-alert-banner";
import { KpiMetricCards } from "@/features/admin/dashboard/kpi-metric-cards";
import { DeadlineSupplySection } from "@/features/admin/dashboard/deadline-supply-section";
import { RecentActivityTable } from "@/features/admin/dashboard/recent-activity-table";
import { adminApi } from "@/features/contracts/admin-api";
import {
  adminDashboardSummaryQueryOptions,
  queryKeys,
} from "@/features/contracts/query-keys";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { data: summary, isLoading, isError, refetch } = useQuery(
    adminDashboardSummaryQueryOptions
  );

  const handleRefresh = async () => {
    try {
      const updated = await adminApi.dashboardSummary(true);
      queryClient.setQueryData(queryKeys.admin.dashboard, updated);
    } catch {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });
    }
  };

  const handleToggleDeletionFailure = async () => {
    try {
      const updated = await adminApi.toggleDeletionFailure();
      queryClient.setQueryData(queryKeys.admin.dashboard, updated);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Head>
        <title>운영 대시보드 (ADM-01) - NewsLittle Admin</title>
      </Head>

      <AdminShell activeMenuId="dashboard">
        <div className="space-y-6 pb-12">
          {/* 1. 대시보드 헤더 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-nl-border pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-nl-text">
                ADM-01 운영 대시보드
              </h1>
              <p className="mt-1 text-xs text-nl-muted">
                2026.09.19 · 관리자 세션 · 실시간 운영 지표 및 이상 징후 관제
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-nl-muted font-mono">
                마지막 집계 {summary?.lastAggregatedAt ?? "--:--"} · 조회 전용
              </span>

              {/* 삭제 실패 상태 시뮬레이션 토글 버튼 (테스트용) */}
              <Button
                size="xs"
                variant="ghost"
                onClick={handleToggleDeletionFailure}
                className="text-xs text-nl-muted hover:text-nl-text border border-dashed border-nl-border"
                title="삭제 실패 경고 노출 여부를 토글합니다."
              >
                {summary?.deletionFailureAlert.hasFailure
                  ? "🚨 삭제 실패 모의 (ON)"
                  : "✅ 삭제 실패 모의 (OFF)"}
              </Button>

              <Button
                size="xs"
                variant="secondary"
                onClick={handleRefresh}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>새로고침</span>
              </Button>
            </div>
          </div>

          {/* 로딩 및 에러 처리 */}
          {isLoading && (
            <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-nl-border bg-nl-surface text-sm text-nl-muted">
              운영 대시보드 데이터를 불러오는 중입니다...
            </div>
          )}

          {isError && (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-semibold text-red-700">
                대시보드 지표를 불러오는 데 실패했습니다.
              </p>
              <Button
                size="xs"
                variant="secondary"
                onClick={() => refetch()}
                className="mt-4 border-red-300 text-red-700"
              >
                다시 시도
              </Button>
            </div>
          )}

          {/* 2. 대시보드 본문 컨텐츠 */}
          {summary && (
            <div className="space-y-6">
              {/* 삭제 실패 긴급 경고 (존재 시 최상단) */}
              <DeletionAlertBanner
                hasFailure={summary.deletionFailureAlert.hasFailure}
                count={summary.deletionFailureAlert.count}
                message={summary.deletionFailureAlert.message}
              />

              {/* 5종 대기 건수 KPI 카드 */}
              <div>
                <div className="flex items-center justify-between pb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-nl-muted">
                    운영 처리 대기 건수
                  </h2>
                  <span className="text-[11px] text-nl-muted">카드를 클릭하여 해당 화면으로 이동</span>
                </div>
                <KpiMetricCards pendingCounts={summary.pendingCounts} />
              </div>

              {/* 기한 경고 & 오늘의 공급 상태 2열 */}
              <DeadlineSupplySection
                deadlineWarnings={summary.deadlineWarnings}
                supplyStatus={summary.supplyStatus}
              />

              {/* 최근 처리 기록 10건 */}
              <RecentActivityTable activities={summary.recentActivities} />
            </div>
          )}
        </div>
      </AdminShell>
    </>
  );
}
