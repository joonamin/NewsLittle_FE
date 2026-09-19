import type { IncomingMessage } from "node:http";
import { dehydrate, type DehydratedState, type QueryClient } from "@tanstack/react-query";

import { canRequestOnServer } from "@/lib/api-client";
import { createQueryClient } from "@/lib/query-client";

export type DehydratedProps = { dehydratedState?: DehydratedState };

/**
 * 화면의 Suspense 쿼리를 서버에서 미리 채운다. 프리페치 없이 useSuspenseQuery를
 * 서버 렌더링하면 Suspense 경계가 끝나지 못해 클라이언트가 React error #419
 * (서버 렌더링 포기 → 클라이언트 재렌더링)을 보고한다.
 *
 * 다음 두 경우에는 건너뛰고 기존처럼 클라이언트가 받아온다.
 * - 모킹 모드: MSW는 브라우저 서비스 워커라 서버에 핸들러가 없다.
 * - 절대 URL 부재: 서버 fetch는 상대 경로를 파싱하지 못한다.
 *
 * prefetchQuery는 실패를 삼키므로 백엔드 오류 시에도 클라이언트 재시도로 이어진다.
 */
export async function dehydrateScreenQueries(
  req: IncomingMessage,
  prefetch: (queryClient: QueryClient, init: RequestInit | undefined) => Promise<unknown>,
): Promise<DehydratedProps> {
  if (!canRequestOnServer || process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
    return {};
  }

  // 화면 대부분이 세션 쿠키에 따라 내용이 달라진다. 서버에서는 credentials: "include"가
  // 의미가 없어 들어온 쿠키를 그대로 실어 보낸다.
  const { cookie } = req.headers;
  const init: RequestInit | undefined = cookie ? { headers: { cookie } } : undefined;

  const queryClient = createQueryClient();
  await prefetch(queryClient, init);

  return { dehydratedState: dehydrate(queryClient) };
}
