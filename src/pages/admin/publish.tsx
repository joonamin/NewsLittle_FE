import Head from "next/head";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Layers } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminEmptyState,
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminStatusBadge,
  AuditLog,
  ConfirmActionModal,
  adminInputClass,
  adminPanelClass,
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/features/contracts/admin-api";
import type { AdminAsset, AssetStatus } from "@/features/contracts/admin-models";
import { queryKeys } from "@/features/contracts/query-keys";
import { cn } from "@/lib/cn";

type Action = "publish" | "suspend" | "withdraw" | "restore";
type StatusFilter = "ALL" | "READY" | "PUBLISHED" | "CORRECTING" | "SUSPENDED";

const statusLabels: Record<AssetStatus, string> = {
  READY: "게시 대기 (승인됨)",
  PUBLISHED: "게시 중",
  CORRECTING: "정정 대기",
  SUSPENDED: "중단",
  WITHDRAWN: "회수",
};

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

export default function PublishPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("READY");
  const [q, setQ] = useState("");
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [isBulkPublishing, setIsBulkPublishing] = useState(false);
  const [bulkPublishResult, setBulkPublishResult] = useState<string | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [action, setAction] = useState<Action | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [correction, setCorrection] = useState("");

  const list = useQuery({
    queryKey: queryKeys.admin.assets,
    queryFn: () => adminApi.assets(),
  });

  // 1. 상태 및 검색어 필터링
  const filtered = (list.data?.items ?? []).filter((item) => {
    const matchesQuery = `${item.articleCode} ${item.title}`
      .toLowerCase()
      .includes(q.toLowerCase());
    if (!matchesQuery) return false;

    if (statusFilter === "ALL") return true;
    if (statusFilter === "READY") return item.status === "READY";
    if (statusFilter === "PUBLISHED") return item.status === "PUBLISHED";
    if (statusFilter === "CORRECTING") return item.status === "CORRECTING";
    if (statusFilter === "SUSPENDED") {
      return item.status === "SUSPENDED" || item.status === "WITHDRAWN";
    }
    return true;
  });

  const activeId = filtered.some((item) => item.articleId === selectedId)
    ? selectedId
    : filtered[0]?.articleId ?? null;

  const detail = useQuery({
    queryKey: queryKeys.admin.asset(activeId ?? 0),
    queryFn: () => adminApi.asset(activeId!),
    enabled: Boolean(activeId),
  });

  const update = (item: AdminAsset) => {
    queryClient.setQueryData(queryKeys.admin.asset(item.articleId), item);
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.assets });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });
    setActionError(null);
    setAction(null);
  };

  const actionMutation = useMutation({
    mutationFn: ({
      selectedAction,
      reason,
    }: {
      selectedAction: Action;
      reason: string;
    }) =>
      selectedAction === "publish"
        ? adminApi.publishAsset(activeId!)
        : adminApi.changeAssetState(activeId!, selectedAction, reason),
    onSuccess: update,
    onError: (error) => setActionError(errorMessage(error)),
  });

  const correctionMutation = useMutation({
    mutationFn: () =>
      adminApi.correctAsset(activeId!, correction, "원문 URL · 운영자 확인"),
    onSuccess: (item) => {
      update(item);
      setCorrection("");
    },
  });

  // 2. 일괄 체크 및 게시 로직
  const readyItems = filtered.filter((item) => item.status === "READY");
  const isAllReadyChecked =
    readyItems.length > 0 && readyItems.every((item) => checkedIds.includes(item.articleId));

  const handleToggleCheckAll = () => {
    if (isAllReadyChecked) {
      setCheckedIds([]);
    } else {
      setCheckedIds(readyItems.map((item) => item.articleId));
    }
  };

  const handleToggleCheck = (articleId: number) => {
    setCheckedIds((prev) =>
      prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId],
    );
  };

  const executeBulkPublish = async () => {
    if (checkedIds.length === 0) return;
    setIsBulkPublishing(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of checkedIds) {
      try {
        await adminApi.publishAsset(id);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setIsBulkPublishing(false);
    setShowBulkModal(false);
    setCheckedIds([]);
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.assets });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });

    setBulkPublishResult(
      failCount === 0
        ? `총 ${successCount}건의 승인 기사가 성공적으로 게시되었습니다!`
        : `${successCount}건 게시 성공, ${failCount}건 실패 (자산 누락 또는 이용근거를 확인해 주세요).`,
    );
    setTimeout(() => setBulkPublishResult(null), 5000);
  };

  return (
    <>
      <Head>
        <title>ADM-04 게시·정정·중단 | NewsLittle Admin</title>
      </Head>
      <AdminShell activeMenuId="publish">
        <div className="space-y-6 pb-12">
          <AdminPageHeader
            title="ADM-04 게시·정정·중단"
            description="검수된 기사와 연결 파생물의 게시, 정정, 중단과 회수를 한 흐름에서 처리합니다."
            actions={
              <input
                aria-label="자산 찾기"
                className={cn(adminInputClass, "w-72")}
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="기사 코드 또는 제목 검색"
              />
            }
          />

          {/* 알림 배너 */}
          {bulkPublishResult && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-xs">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>{bulkPublishResult}</span>
              </div>
              <button
                type="button"
                onClick={() => setBulkPublishResult(null)}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                닫기
              </button>
            </div>
          )}

          {/* 상태 필터 탭 바 & 일괄 게시 액션 바 */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-nl-border bg-nl-surface p-3 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("READY")}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-bold transition-colors cursor-pointer",
                  statusFilter === "READY"
                    ? "bg-nl-accent text-white shadow-xs"
                    : "bg-nl-subtle text-nl-muted hover:bg-nl-border hover:text-nl-text",
                )}
              >
                게시 대기 (승인됨) ·{" "}
                {list.data?.items.filter((i) => i.status === "READY").length ?? 0}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-bold transition-colors cursor-pointer",
                  statusFilter === "ALL"
                    ? "bg-nl-accent text-white shadow-xs"
                    : "bg-nl-subtle text-nl-muted hover:bg-nl-border hover:text-nl-text",
                )}
              >
                전체 · {list.data?.items.length ?? 0}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("PUBLISHED")}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-bold transition-colors cursor-pointer",
                  statusFilter === "PUBLISHED"
                    ? "bg-nl-accent text-white shadow-xs"
                    : "bg-nl-subtle text-nl-muted hover:bg-nl-border hover:text-nl-text",
                )}
              >
                게시 중 ·{" "}
                {list.data?.items.filter((i) => i.status === "PUBLISHED").length ?? 0}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("CORRECTING")}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-bold transition-colors cursor-pointer",
                  statusFilter === "CORRECTING"
                    ? "bg-nl-accent text-white shadow-xs"
                    : "bg-nl-subtle text-nl-muted hover:bg-nl-border hover:text-nl-text",
                )}
              >
                정정 대기 ·{" "}
                {list.data?.items.filter((i) => i.status === "CORRECTING").length ?? 0}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("SUSPENDED")}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-bold transition-colors cursor-pointer",
                  statusFilter === "SUSPENDED"
                    ? "bg-nl-accent text-white shadow-xs"
                    : "bg-nl-subtle text-nl-muted hover:bg-nl-border hover:text-nl-text",
                )}
              >
                중단·회수 ·{" "}
                {list.data?.items.filter((i) => i.status === "SUSPENDED" || i.status === "WITHDRAWN").length ?? 0}
              </button>
            </div>

            {/* 일괄 게시 버튼 */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-nl-muted">
                선택됨: <strong className="text-nl-text">{checkedIds.length}</strong>건
              </span>
              <Button
                size="xs"
                variant="primary"
                disabled={checkedIds.length === 0 || isBulkPublishing}
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>승인된 기사 일괄 게시 ({checkedIds.length}건)</span>
              </Button>
            </div>
          </div>

          {list.isLoading ? (
            <AdminLoading />
          ) : list.isError ? (
            <AdminError onRetry={() => void list.refetch()} />
          ) : !filtered.length ? (
            <AdminEmptyState title="조건에 맞는 자산이 없습니다." />
          ) : (
            <div className="grid grid-cols-[1fr_480px] gap-5 items-start">
              {/* 왼쪽: 기사 목록 표 (기사 코드, 제목, 남은 삭제 기한, 현재 상태) */}
              <section className={cn(adminPanelClass, "overflow-hidden")}>
                <div className="border-b border-nl-border bg-nl-subtle/50 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-nl-text">
                    자산 목록 ({filtered.length}건)
                  </span>
                  {readyItems.length > 0 && (
                    <label className="flex items-center gap-1.5 text-xs text-nl-muted cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isAllReadyChecked}
                        onChange={handleToggleCheckAll}
                        className="rounded-sm border-nl-border text-nl-accent focus:ring-nl-accent"
                      />
                      <span>게시 대기 전체 선택 ({readyItems.length}건)</span>
                    </label>
                  )}
                </div>

                <div className="max-h-[640px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-nl-subtle text-nl-muted border-b border-nl-border z-10">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <span className="sr-only">선택</span>
                        </th>
                        <th className="p-3 w-28">기사 코드</th>
                        <th className="p-3">제목</th>
                        <th className="p-3 w-32">본문 보관·만료</th>
                        <th className="p-3 w-36">현재 상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-nl-border">
                      {filtered.map((item) => {
                        const isSelected = item.articleId === activeId;
                        const isChecked = checkedIds.includes(item.articleId);
                        const isPublishable = item.status === "READY";

                        return (
                          <tr
                            key={item.articleId}
                            onClick={() => setSelectedId(item.articleId)}
                            className={cn(
                              "cursor-pointer transition-colors",
                              isSelected
                                ? "bg-nl-accent-subtle/80 font-semibold"
                                : "hover:bg-nl-subtle",
                            )}
                          >
                            <td
                              className="p-3 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={!isPublishable}
                                onChange={() => handleToggleCheck(item.articleId)}
                                className="rounded-sm border-nl-border text-nl-accent focus:ring-nl-accent cursor-pointer disabled:opacity-40"
                              />
                            </td>
                            <td className="p-3 font-mono font-bold text-nl-text">
                              {item.articleCode}
                            </td>
                            <td className="p-3 text-nl-text">
                              <span className="line-clamp-2 leading-relaxed">
                                {item.title}
                              </span>
                            </td>
                            <td className="p-3 text-nl-muted">
                              {item.bodyRetained ? (
                                <span className="text-emerald-700 font-medium">
                                  본문 보유 중
                                </span>
                              ) : (
                                <span className="text-nl-negative font-medium">
                                  본문 만료됨
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <AdminStatusBadge
                                status={item.status}
                                label={statusLabels[item.status]}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 오른쪽: 선택된 기사 상세 조치 패널 */}
              {detail.isLoading ? (
                <AdminLoading />
              ) : detail.isError ? (
                <AdminError onRetry={() => void detail.refetch()} />
              ) : detail.data ? (
                <div className="space-y-5">
                  <section className={cn(adminPanelClass, "p-6")}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-nl-text">
                          {detail.data.articleCode} · {detail.data.title}
                        </h2>
                        <p className="mt-1.5 text-xs text-nl-muted">
                          이용 근거 {detail.data.usageBasisStatus} · 본문{" "}
                          {detail.data.bodyRetained ? "보유 중" : "삭제됨"} · 만료{" "}
                          {detail.data.expiresAt ?? "미정"}
                        </p>
                      </div>
                      <AdminStatusBadge
                        status={detail.data.status}
                        label={statusLabels[detail.data.status]}
                      />
                    </div>

                    <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                      진행 중 퀴즈 영향 {detail.data.activeQuizSessionCount}회차 · 중단
                      시 해당 문항은 서비스 제외되며 오답으로 기록되지 않습니다.
                    </p>

                    <div className="mt-5 overflow-hidden rounded-lg border border-nl-border">
                      <table className="w-full text-xs">
                        <thead className="bg-nl-subtle text-nl-muted">
                          <tr>
                            <th className="p-3 text-left">연결 자산</th>
                            <th className="p-3 text-left">현재 상태</th>
                            <th className="p-3 text-left">게시 / 만료</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.data.linkedAssets.length ? (
                            detail.data.linkedAssets.map((asset) => (
                              <tr
                                key={asset.id}
                                className="border-t border-nl-border"
                              >
                                <td className="p-3 font-semibold">
                                  {asset.type} {asset.id}
                                </td>
                                <td className="p-3">{asset.status}</td>
                                <td className="p-3 text-nl-muted">
                                  {asset.publishedAt ?? "게시 전"} /{" "}
                                  {asset.expiresAt ?? "미정"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="border-t border-nl-border">
                              <td
                                className="p-3 text-nl-negative text-center"
                                colSpan={3}
                              >
                                게시할 요약 또는 퀴즈 자산이 없습니다.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {detail.data.status !== "PUBLISHED" &&
                    (detail.data.usageBasisStatus !== "CONDITIONAL" ||
                      !detail.data.linkedAssets.length) ? (
                      <p className="mt-3 text-xs font-semibold text-nl-negative">
                        {!detail.data.linkedAssets.length
                          ? "게시할 연결 자산을 먼저 생성·검수해 주세요."
                          : "유효한 이용 근거 확인 후 게시할 수 있습니다."}
                      </p>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button
                        size="xs"
                        disabled={
                          detail.data.status === "PUBLISHED" ||
                          detail.data.usageBasisStatus !== "CONDITIONAL" ||
                          !detail.data.linkedAssets.length
                        }
                        onClick={() => {
                          setActionError(null);
                          setAction("publish");
                        }}
                      >
                        게시
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        disabled={detail.data.status === "SUSPENDED"}
                        onClick={() => {
                          setActionError(null);
                          setAction("suspend");
                        }}
                      >
                        중단
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        disabled={detail.data.status === "WITHDRAWN"}
                        onClick={() => {
                          setActionError(null);
                          setAction("withdraw");
                        }}
                      >
                        회수
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        disabled={
                          !detail.data.auditLogs.length ||
                          detail.data.status === "PUBLISHED"
                        }
                        onClick={() => {
                          setActionError(null);
                          setAction("restore");
                        }}
                      >
                        복구 검토
                      </Button>
                    </div>
                  </section>

                  <section className={cn(adminPanelClass, "p-5")}>
                    <h2 className="text-sm font-bold text-nl-text">정정 등록</h2>
                    <textarea
                      aria-label="정정 내용"
                      value={correction}
                      onChange={(event) => setCorrection(event.target.value)}
                      className="mt-3 min-h-24 w-full rounded-lg border border-nl-border bg-nl-bg p-3 text-sm outline-none focus:border-nl-accent"
                      placeholder="원문 정정 내용과 출처를 입력하세요."
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-nl-muted">
                        {detail.data.bodyRetained
                          ? "등록 후 노출 보류 → 재검수 대기열"
                          : "본문 삭제 상태 · 재검수 불가, 회수만 가능"}
                      </p>
                      <Button
                        size="xs"
                        disabled={
                          !correction.trim() ||
                          !detail.data.bodyRetained ||
                          correctionMutation.isPending
                        }
                        onClick={() => correctionMutation.mutate()}
                      >
                        정정 등록·재검수
                      </Button>
                    </div>
                  </section>

                  <AuditLog logs={detail.data.auditLogs} />
                </div>
              ) : (
                <AdminEmptyState title="선택된 자산이 없습니다." />
              )}
            </div>
          )}

          {/* 단건 확인 모달 */}
          <ConfirmActionModal
            open={Boolean(action)}
            title="자산 상태를 변경할까요?"
            description="연결된 홈 노출과 퀴즈 출제 상태에 즉시 반영됩니다."
            confirmLabel={
              action === "publish"
                ? "게시"
                : action === "suspend"
                  ? "중단"
                  : action === "withdraw"
                    ? "회수"
                    : "복구"
            }
            reasonRequired={action !== "publish"}
            pending={actionMutation.isPending}
            errorMessage={actionError}
            onClose={() => {
              setActionError(null);
              setAction(null);
            }}
            onConfirm={(reason) =>
              action && actionMutation.mutate({ selectedAction: action, reason })
            }
          />

          {/* 일괄 게시 확인 모달 */}
          <ConfirmActionModal
            open={showBulkModal}
            title={`승인된 기사 ${checkedIds.length}건을 일괄 게시할까요?`}
            description="선택한 모든 기사가 즉시 홈 화면 및 퀴즈 출제 대상으로 게시(PUBLISHED)됩니다."
            confirmLabel={isBulkPublishing ? "게시 처리 중..." : "일괄 게시"}
            reasonRequired={false}
            pending={isBulkPublishing}
            onClose={() => setShowBulkModal(false)}
            onConfirm={executeBulkPublish}
          />
        </div>
      </AdminShell>
    </>
  );
}
