/**
 * Google Identity Services(GIS) 연동. 백엔드는 "방식 A"(ID Token 전달)를 권장하므로
 * 브라우저에서 GIS 스크립트를 로드해 credential(JWT)을 받아온 뒤 백엔드로 그대로 전달한다.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            ux_mode?: "popup" | "redirect";
            use_fedcm_for_prompt?: boolean;
          }): void;
          prompt(momentListener?: (notification: GoogleIdMomentNotification) => void): void;
          cancel(): void;
        };
      };
    };
  }
}

type GoogleIdMomentNotification = {
  isNotDisplayed(): boolean;
  isSkippedMoment(): boolean;
  isDismissedMoment(): boolean;
};

const GOOGLE_GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let scriptLoadPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_GSI_SCRIPT_SRC}"]`,
    );

    const onError = () => {
      scriptLoadPromise = null;
      reject(new Error("Google Identity Services 스크립트를 불러오지 못했습니다."));
    };

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", onError);
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", onError);
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/** 사용자가 구글 로그인 창을 닫거나 표시되지 않아 취소된 경우(login_cancel). */
export class GoogleSignInCancelledError extends Error {
  constructor() {
    super("Google 로그인 창이 완료되기 전에 닫혔습니다.");
    this.name = "GoogleSignInCancelledError";
  }
}

/** GIS의 One Tap/팝업을 띄우고 credential(ID Token JWT)을 반환한다. */
async function requestGoogleCredential(clientId: string): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Google 로그인은 브라우저에서만 사용할 수 있습니다.");
  }

  await loadGoogleIdentityScript();
  const accountsId = window.google?.accounts.id;
  if (!accountsId) {
    throw new Error("Google Identity Services 초기화에 실패했습니다.");
  }

  return new Promise<string>((resolve, reject) => {
    let settled = false;

    accountsId.initialize({
      client_id: clientId,
      ux_mode: "popup",
      use_fedcm_for_prompt: true,
      callback: (response) => {
        settled = true;
        resolve(response.credential);
      },
    });

    accountsId.prompt((notification) => {
      if (settled) return;
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment() ||
        notification.isDismissedMoment()
      ) {
        reject(new GoogleSignInCancelledError());
      }
    });
  });
}

/**
 * 화면에서 호출하는 진입점. MSW 목 모드에서는 실제 구글 팝업 없이 목 credential을
 * 즉시 반환해 백엔드가 준비되기 전에도 로그인 플로우를 개발·테스트할 수 있게 한다.
 */
export async function resolveGoogleCredential(): Promise<string> {
  if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
    return "mock-google-credential";
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID가 설정되지 않았습니다.");
  }

  return requestGoogleCredential(clientId);
}
