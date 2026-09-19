import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 서버에 mutation을 보내는 액션 버튼 공통 연타 방지 훅. 진행 중이면 재호출을
 * 무시하고, 성공/실패와 무관하게 최소 `debounceMs` 동안은 다시 누르지 못하게
 * 막는다(react-query의 `mutation.isPending`만으로는 응답이 오는 즉시 다시
 * 눌리는 걸 막지 못한다).
 */
export function useDebouncedAction(debounceMs = 600) {
  const pendingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingRef.current = false;
    setPending(false);
  }, []);

  useEffect(() => reset, [reset]);

  const run = useCallback(
    async (action: () => void | Promise<unknown>) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setPending(true);

      const cooldown = new Promise<void>((resolve) => {
        timerRef.current = setTimeout(resolve, debounceMs);
      });

      try {
        const [actionResult] = await Promise.allSettled([Promise.resolve(action()), cooldown]);
        if (actionResult.status === "rejected") throw actionResult.reason;
      } finally {
        pendingRef.current = false;
        setPending(false);
        timerRef.current = null;
      }
    },
    [debounceMs],
  );

  return { run, pending, reset };
}
