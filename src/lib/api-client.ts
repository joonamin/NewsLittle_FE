import type { ApiResponse } from "@/features/contracts/api-models";

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message?: string) {
    super(message ?? code);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

// 서버(SSR)에서는 상대 경로로 fetch할 수 없어 절대 URL이 필요하다.
// 브라우저에 노출하면 안 되는 내부 주소를 쓸 수 있도록 API_BASE_URL을 먼저 본다.
const serverApiBaseUrl = (
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
).replace(/\/$/, "");

/**
 * SSR 프리페치 가능 여부. 서버 fetch는 상대 경로를 파싱하지 못하므로 http(s) 절대 URL일
 * 때만 true다. 값이 비어 있거나 `/api` 같은 상대 경로면 프리페치를 건너뛰고 클라이언트가
 * 받아온다.
 */
export const canRequestOnServer = /^https?:\/\//.test(serverApiBaseUrl);

export function apiUrl(path: string) {
  const baseUrl = typeof window === "undefined" ? serverApiBaseUrl : apiBaseUrl;
  return `${baseUrl}${path}`;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(response.status, body?.error?.code ?? "UNKNOWN", body?.error?.message);
  }

  // 로그아웃·아카이브 삭제 등 일부 엔드포인트는 본문 없는 204를 돌려준다 —
  // 그런 응답에 .json()을 호출하면 파싱 오류가 난다.
  if (response.status === 204) {
    return undefined as T;
  }

  return ((await response.json()) as ApiResponse<T>).data;
}

export function jsonRequest<T>(method: "POST" | "PUT", body: T) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  } satisfies RequestInit;
}
