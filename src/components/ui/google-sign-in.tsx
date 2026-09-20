import { useEffect, useRef, useState } from "react";

import { renderGoogleSignInButton } from "@/lib/google-identity";
import { GoogleLoginButton } from "./google-login-button";

type Props = {
  pending: boolean;
  onCredential: (credential: string) => Promise<unknown>;
};

export function GoogleSignIn({ pending, onCredential }: Props) {
  const parent = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  const busy = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const mocking = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

  useEffect(() => { callback.current = onCredential; }, [onCredential]);
  useEffect(() => {
    if (mocking || !parent.current) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      controller.abort();
      setError("Google 로그인 버튼을 불러오지 못했습니다. 다시 시도해 주세요.");
    }, 15000);
    void renderGoogleSignInButton(parent.current, async (credential) => {
      if (busy.current || controller.signal.aborted) return;
      busy.current = true;
      try {
        await callback.current(credential);
      } catch {
        if (!controller.signal.aborted) setError("로그인에 실패했습니다. 다시 시도해 주세요.");
      } finally {
        busy.current = false;
      }
    }, controller.signal).then(() => {
      if (!controller.signal.aborted) setReady(true);
    }).catch(() => {
      if (!controller.signal.aborted) setError("Google 로그인 버튼을 불러오지 못했습니다. 다시 시도해 주세요.");
    }).finally(() => window.clearTimeout(timeout));
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [mocking, attempt]);

  if (mocking) return <GoogleLoginButton pending={pending} onClick={() => void onCredential("mock-google-credential")} />;

  return (
    <div aria-busy={pending || (!ready && !error)}>
      <div ref={parent} inert={pending} className="flex min-h-11 justify-center" />
      {pending ? <p role="status">로그인 중입니다.</p> : null}
      {!ready && !error ? <p role="status">Google 로그인 버튼을 불러오는 중입니다.</p> : null}
      {error ? <div>
        <p role="alert">{error}</p>
        <button type="button" className="underline hover:no-underline" onClick={() => {
          setError(null);
          setReady(false);
          setAttempt((value) => value + 1);
        }}>다시 시도</button>
      </div> : null}
    </div>
  );
}
