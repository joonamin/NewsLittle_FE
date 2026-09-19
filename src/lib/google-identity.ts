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
            auto_select?: boolean;
          }): void;
          renderButton(parent: HTMLElement, options: {
            type: "standard";
            theme: "outline";
            size: "large";
            text: "continue_with";
            width: number;
            locale: string;
          }): void;
          disableAutoSelect(): void;
          cancel(): void;
        };
      };
    };
  }
}

const GOOGLE_GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let scriptLoadPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_GSI_SCRIPT_SRC}"]`,
    );

    const script = existing ?? document.createElement("script");
    const cleanup = () => {
      window.clearTimeout(timeout);
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
    const onLoad = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      script.remove();
      scriptLoadPromise = null;
      reject(new Error("Google Identity Services 스크립트를 불러오지 못했습니다."));
    };

    const timeout = window.setTimeout(onError, 12000);
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    if (existing) return;
    script.src = GOOGLE_GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

let initializedClientId: string | null = null;
let credentialHandler: ((credential: string) => void) | null = null;

/** 명시적인 로그인은 One Tap 표시 여부와 무관한 GIS 공식 버튼으로 시작한다. */
export async function renderGoogleSignInButton(
  parent: HTMLElement,
  onCredential: (credential: string) => void,
  signal: AbortSignal,
): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Google 로그인은 브라우저에서만 사용할 수 있습니다.");
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Google 로그인 설정을 확인해 주세요.");
  await loadGoogleIdentityScript();
  if (signal.aborted) return;
  const accountsId = window.google?.accounts.id;
  if (!accountsId) {
    throw new Error("Google Identity Services 초기화에 실패했습니다.");
  }

  credentialHandler = onCredential;
  signal.addEventListener("abort", () => {
    if (credentialHandler === onCredential) credentialHandler = null;
    parent.replaceChildren();
  }, { once: true });
  if (initializedClientId !== clientId) {
    accountsId.initialize({
      client_id: clientId,
      ux_mode: "popup",
      auto_select: false,
      callback: (response) => {
        if (response.credential) credentialHandler?.(response.credential);
      },
    });
    initializedClientId = clientId;
  }
  accountsId.renderButton(parent, {
    type: "standard", theme: "outline", size: "large", text: "continue_with",
    width: Math.min(400, parent.clientWidth || 320), locale: "ko",
  });
}

/** 서비스 로그아웃 뒤 자동 재로그인을 막는다. Google 계정 연결은 해제하지 않는다. */
export function disableGoogleAutoSignIn(): void {
  credentialHandler = null;
  if (typeof window === "undefined") return;
  window.google?.accounts.id.disableAutoSelect();
}
