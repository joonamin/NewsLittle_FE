import { useEffect, useState, type ReactNode } from "react";

type MockingProviderProps = {
  children: ReactNode;
};

const isMockingEnabled = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

export function MockingProvider({ children }: MockingProviderProps) {
  const [isReady, setIsReady] = useState(!isMockingEnabled);

  useEffect(() => {
    if (!isMockingEnabled) {
      return;
    }

    void import("./browser")
      .then(({ worker }) =>
        worker.start({
          onUnhandledRequest: "bypass",
          quiet: true,
          serviceWorker: { url: "/mockServiceWorker.js" },
        }),
      )
      .then(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return <p className="p-4 text-sm">모의 API를 준비하고 있습니다.</p>;
  }

  return <>{children}</>;
}
