import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Suspense, createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

import { ErrorState } from "./state-view";

type RejectedState = {
  error: Error;
  reset: () => void;
};

type AsyncBoundaryProps = {
  children: ReactNode;
  pending: ReactNode;
  rejected: (state: RejectedState) => ReactNode;
};

/**
 * 이 페이지의 Suspense 쿼리가 SSR 단계에서 캐시에 채워졌는지 여부.
 * (`dehydrateScreenQueries`가 채운 `pageProps.dehydratedState` 유무 = _app에서 주입)
 *
 * false인데도 서버에서 `useSuspenseQuery`를 렌더하면 Suspense 경계가 끝나지 못해
 * React error #419(서버 렌더 포기 → 클라이언트 재렌더)가 난다. 모킹 모드·절대 URL
 * 부재·백엔드 프리페치 실패가 모두 여기에 해당한다.
 */
const ServerPrefetchedContext = createContext(false);

export function ServerPrefetchedProvider({ value, children }: { value: boolean; children: ReactNode }) {
  return <ServerPrefetchedContext.Provider value={value}>{children}</ServerPrefetchedContext.Provider>;
}

const subscribeToNothing = () => () => {};

/** 서버 렌더와 하이드레이션 첫 렌더에서는 false, 그 뒤 클라이언트 렌더에서 true. */
function useIsHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/**
 * pending: the subtree has no data yet (suspended query).
 * rejected: this subtree cannot render (query throw or render error). reset retries the query and remounts the tree.
 */
export function AsyncBoundary({ children, pending, rejected }: AsyncBoundaryProps) {
  const isServerPrefetched = useContext(ServerPrefetchedContext);
  const isHydrated = useIsHydrated();

  // 서버 캐시가 비었으면 서버 렌더와 하이드레이션 첫 렌더까지는 pending만 그린다.
  // 서버·클라이언트 마크업이 같으므로 하이드레이션 불일치 없이 #419를 없앤다.
  const rendersSuspendingTree = isServerPrefetched || isHydrated;

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) =>
            rejected({
              error: error instanceof Error ? error : new Error(String(error)),
              reset: resetErrorBoundary,
            })
          }
        >
          <Suspense fallback={pending}>{rendersSuspendingTree ? children : pending}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

/** Uncaught render errors outside a widget AsyncBoundary. */
export function AppErrorFallback({ resetErrorBoundary }: FallbackProps) {
  const router = useRouter();

  return (
    <div className="p-6 md:p-12">
      <ErrorState
        title="화면을 표시하지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        onRetry={resetErrorBoundary}
        onGoHome={() => {
          void router.replace("/");
          resetErrorBoundary();
        }}
      />
    </div>
  );
}
