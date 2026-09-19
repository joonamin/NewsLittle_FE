import Link from "next/link";
import { useRouter } from "next/router";
import { useSyncExternalStore, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckSquare,
  FileText,
  LayoutDashboard,
  MonitorX,
  Send,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import { navigationQueryOptions } from "@/features/contracts/query-keys";
import { cn } from "@/lib/cn";

type AdminShellProps = {
  children: ReactNode;
  activeMenuId?: "dashboard" | "usage-basis" | "review" | "publish" | "deletion-expiry" | "reports";
};

const adminMenus = [
  { id: "dashboard", label: "ADM-01 운영 대시보드", href: "/admin", icon: LayoutDashboard },
  { id: "usage-basis", label: "ADM-02 이용 근거·상태", href: "/admin/usage-basis", icon: FileText },
  { id: "review", label: "ADM-03 검수 대기열", href: "/admin/review", icon: CheckSquare },
  { id: "publish", label: "ADM-04 게시·정정·중단", href: "/admin/publish", icon: Send },
  { id: "deletion-expiry", label: "ADM-05 삭제·만료 상태", href: "/admin/deletion-expiry", icon: Trash2 },
  { id: "reports", label: "ADM-06 신고 처리", href: "/admin/reports", icon: ShieldAlert },
] as const;

function subscribeNever() {
  return () => {};
}

export function AdminShell({ children, activeMenuId = "review" }: AdminShellProps) {
  const router = useRouter();
  const { data: nav, isPending, isPlaceholderData, isError } = useQuery(navigationQueryOptions);
  const isClient = useSyncExternalStore(subscribeNever, () => true, () => false);

  // 1. 존재 비노출 (COM-08, IA 2.2절): 비관리자가 /admin/* 에 접근하면 일반 404 화면과 동일하게 위장
  const hasOperationsMenu = nav?.primaryItems.some((item) => item.id === "operations") ?? false;
  // 개발 및 Mock 환경에서는 편의를 위해 query param ?admin=true 또는 operations 메뉴가 있으면 통과
  const isAdmin = hasOperationsMenu || router.query.admin === "true" || process.env.NODE_ENV === "development";

  // placeholder(guest)로 먼저 판정하면 관리자 화면이 404로 깜빡인다. 서버 권한 응답 전에는
  // 운영 레이아웃과 메뉴를 모두 숨긴다.
  if (!isClient || isPending || isPlaceholderData) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center p-6" aria-busy="true">
        <p className="text-sm text-nl-muted">접근 권한을 확인하고 있습니다...</p>
      </main>
    );
  }

  if (isError || !isAdmin) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-nl-text">404</h1>
        <p className="mt-2 text-nl-body text-nl-muted">요청하신 페이지를 찾을 수 없습니다.</p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-nl-accent px-6 py-2.5 text-nl-caption font-bold text-nl-on-accent"
        >
          홈으로 돌아가기
        </Link>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 max-w-sm">
            <p className="text-xs font-semibold mb-1">🛠️ 로컬 개발 편의 기능</p>
            <p className="text-xs text-amber-700 mb-3">
              현재 비관리자 상태입니다. 아래 버튼을 누르면 로컬 관리자(Admin) 권한 세션을 즉시 발급받아 입장합니다.
            </p>
            <button
              type="button"
              id="dev-admin-login-button"
              onClick={async () => {
                const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
                try {
                  await fetch(`${apiBase}/api/v1/auth/dev-session`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ role: "admin" }),
                  });
                  window.location.reload();
                } catch (e) {
                  alert("세션 발급 실패: " + String(e));
                }
              }}
              className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition"
            >
              관리자 권한 발급받고 입장하기
            </button>
          </div>
        )}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-nl-subtle">
      {/* 2. PC 전용 가드 (IA 2.2절 31항): 1280px 미만 화면에서는 안내 화면만 표시 */}
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-8 text-center min-[1280px]:hidden">
        <div className="rounded-2xl border border-nl-border bg-nl-surface p-8 shadow-sm max-w-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <MonitorX className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-nl-text">PC 전용 화면 안내</h2>
          <p className="mt-2 text-sm leading-relaxed text-nl-muted">
            관리자(운영) 화면은 원문 대조 검수 및 세부 관제를 위해{" "}
            <strong className="text-nl-text font-semibold">최소 폭 1280px 이상의 PC 환경</strong>
            에서만 제공됩니다.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-nl-accent px-5 py-2 text-xs font-semibold text-nl-on-accent"
            >
              홈 화면으로 복귀
            </Link>
          </div>
        </div>
      </div>

      {/* 3. 1280px 이상 PC 데스크톱 관리자 레이아웃 (adm-03-review-queue.pen 규격) */}
      <div className="hidden min-[1280px]:flex min-h-[calc(100vh-80px)] w-full max-w-[1600px] mx-auto">
        {/* 좌측 운영 사이드바 메뉴 (폭 260px) */}
        <aside
          aria-label="운영 메뉴"
          className="w-[260px] shrink-0 border-r border-nl-border bg-nl-surface py-6 px-4 flex flex-col justify-between"
        >
          <div>
            <div className="px-3 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-nl-muted">
                NewsLittle Admin Console
              </span>
            </div>
            <nav className="space-y-1">
              {adminMenus.map((menu) => {
                const Icon = menu.icon;
                const isActive = menu.id === activeMenuId;
                return (
                  <Link
                    key={menu.id}
                    href={menu.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#F0F0FA] text-nl-accent font-bold"
                        : "text-nl-text hover:bg-nl-subtle hover:text-nl-accent"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-nl-accent" : "text-nl-muted")} />
                    <span>{menu.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-nl-border pt-4 px-3 text-xs text-nl-muted">
            <p className="font-semibold text-nl-text">세션 상태: 관리자</p>
            <p className="mt-1 text-[11px] text-nl-muted">30분 유휴 시 자동 만료</p>
          </div>
        </aside>

        {/* 우측 메인 운영 본문 영역 */}
        <div className="flex-1 overflow-x-hidden p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
