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

export function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`;
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
