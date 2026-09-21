import { useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { GlobalNav } from "@/components/ui/global-nav";
import { GoogleSignIn } from "@/components/ui/google-sign-in";
import { Modal } from "@/components/ui/modal";
import { useHomeFlow } from "@/features/home/home-flow";
import { ReportModal } from "@/features/report/report-modal";
import { useDebouncedAction } from "@/hooks/use-debounced-action";

import { MobileNotice } from "./mobile-notice";

type AppShellProps = { children: ReactNode };
type NavigationTarget = { id: string; label: string; href: string };
type PendingNavigation = NavigationTarget | null;

function activeNavigationItem(pathname: string) {
  if (pathname === "/" || pathname.startsWith("/quiz")) return "home";
  if (pathname.startsWith("/random")) return "random";
  if (pathname === "/archive") return "archive";
  if (pathname === "/settings") return "settings";
  if (pathname.startsWith("/admin")) return "operations";
  return undefined;
}

function isQuizPlayRoute(pathname: string) {
  return pathname === "/quiz/[sessionId]" || pathname === "/random/[sessionId]";
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const {
    closeLogin,
    completeLogin,
    loginOpen,
    loginPending,
    loginError,
    navigation,
    logout,
    requestLogin,
  } = useHomeFlow();
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation>(null);
  const { run: runLogout } = useDebouncedAction();

  const completeNavigation = (item: NavigationTarget) => {
    if (navigation.account.status === "guest" && item.id === "archive") {
      requestLogin();
      return;
    }
    void router.push(item.href);
  };

  const requestNavigation = (item: NavigationTarget) => {
    if (item.href === router.asPath) return;
    if (isQuizPlayRoute(router.pathname)) {
      setPendingNavigation(item);
      return;
    }
    completeNavigation(item);
  };

  return (
    <>
      <div className="md:hidden">
        <MobileNotice />
      </div>

      <div className="hidden min-h-screen md:block">
        <GlobalNav
          menus={navigation.primaryItems}
          activeItemId={activeNavigationItem(router.pathname)}
          account={navigation.account}
          todayListCount={navigation.todayListCount}
          onNavigate={requestNavigation}
          onLogin={requestLogin}
          onAccountNavigate={(item) => requestNavigation({ id: item.id, label: item.label, href: item.href })}
          onAccountAction={() => void runLogout(logout)}
        />
        <main>{children}</main>

        <Modal
          open={pendingNavigation !== null}
          onClose={() => setPendingNavigation(null)}
          title="퀴즈를 그만둘까요?"
          confirmLabel="나가기"
          cancelLabel="계속 풀기"
          onConfirm={() => {
            if (!pendingNavigation) return;
            const target = pendingNavigation;
            setPendingNavigation(null);
            completeNavigation(target);
          }}
          onCancel={() => setPendingNavigation(null)}
        >
          <p className="text-nl-body text-nl-muted">나가면 진행 중인 퀴즈는 이어서 풀 수 없어요.</p>
        </Modal>

        <Modal
          open={loginOpen}
          onClose={closeLogin}
          title="로그인이 필요해요"
          footer={
            <div className="space-y-3">
              <GoogleSignIn pending={loginPending} onCredential={completeLogin} />
              {loginError ? (
                <p role="alert" className="text-nl-caption text-nl-negative">
                  {loginError}
                </p>
              ) : null}
              <p className="text-nl-caption text-nl-muted">홈 탐색과 랜덤 퀴즈는 로그인 없이 이용할 수 있어요.</p>
              <p className="text-nl-micro text-nl-muted">
                계속 진행하면{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-nl-text"
                >
                  서비스 이용약관
                </Link>
                {" "}및{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-nl-text"
                >
                  개인정보 처리방침
                </Link>
                에 동의하게 됩니다. 첫 구글 로그인은 곧 가입이며, 계정 인증과 관심 주제 설정, 보관 기록 제공을 위해 정보를 처리합니다.
              </p>
            </div>
          }
        >
          <p className="text-nl-body text-nl-muted">아카이브와 회원 기능을 이용하려면 로그인해 주세요.</p>
        </Modal>

        <ReportModal />
      </div>
    </>
  );
}
