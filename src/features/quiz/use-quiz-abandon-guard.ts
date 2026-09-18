import type { NextRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";

import type { QuizDomain } from "@/features/contracts/api-models";
import { screenApi } from "@/features/contracts/screen-api";

type QuizAbandonGuardOptions = {
  active: boolean;
  domain: QuizDomain;
  router: NextRouter;
  sessionId: string;
};

export function useQuizAbandonGuard({
  active,
  domain,
  router,
  sessionId,
}: QuizAbandonGuardOptions) {
  const abandonStartedRef = useRef(false);
  const skipAbandonRef = useRef(false);

  useEffect(() => {
    if (active) {
      abandonStartedRef.current = false;
      skipAbandonRef.current = false;
    }
  }, [active, sessionId]);

  const abandon = useCallback(() => {
    if (!active || skipAbandonRef.current || abandonStartedRef.current) return;
    abandonStartedRef.current = true;
    void screenApi.abandonSession(domain, sessionId, true).catch(() => {
      abandonStartedRef.current = false;
    });
  }, [active, domain, sessionId]);

  useEffect(() => {
    if (!active) return;

    const confirmExit = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const abandonOnPageHide = () => abandon();
    const abandonOnRouteChange = () => abandon();

    window.addEventListener("beforeunload", confirmExit);
    window.addEventListener("pagehide", abandonOnPageHide);
    router.events.on("routeChangeStart", abandonOnRouteChange);
    router.beforePopState(() => window.confirm("퀴즈를 그만둘까요? 진행 중인 회차가 종료됩니다."));

    return () => {
      window.removeEventListener("beforeunload", confirmExit);
      window.removeEventListener("pagehide", abandonOnPageHide);
      router.events.off("routeChangeStart", abandonOnRouteChange);
      router.beforePopState(() => true);
    };
  }, [abandon, active, router]);

  return useCallback(() => {
    skipAbandonRef.current = true;
  }, []);
}
