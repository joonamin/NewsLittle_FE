import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Suspense, type ReactNode } from "react";
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
 * pending: the subtree has no data yet (suspended query).
 * rejected: this subtree cannot render (query throw or render error). reset retries the query and remounts the tree.
 */
export function AsyncBoundary({ children, pending, rejected }: AsyncBoundaryProps) {
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
          <Suspense fallback={pending}>{children}</Suspense>
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
