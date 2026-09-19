import { useState } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Noto_Sans_KR } from "next/font/google";
import { HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { AppShell } from "@/components/layout/app-shell";
import { AppErrorFallback, ServerPrefetchedProvider } from "@/components/ui/async-boundary";
import type { DehydratedProps } from "@/features/contracts/server-prefetch";
import { HomeFlowProvider } from "@/features/home/home-flow";
import { createQueryClient } from "@/lib/query-client";
import { MockingProvider } from "@/mocks/mocking-provider";

import "@/styles/globals.css";

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(createQueryClient);
  // getServerSideProps가 Suspense 쿼리를 실제로 채웠을 때만 서버에서 Suspense 경계를
  // 렌더한다. 비어 있으면 AsyncBoundary가 하이드레이션까지 기다려 React error #419를 막는다.
  const isServerPrefetched = Boolean((pageProps as DehydratedProps).dehydratedState);

  return (
    <>
      <Head>
        <title>NewsLittle</title>
        <meta
          name="description"
          content="뉴스를 읽고 퀴즈로 학습하는 NewsLittle 서비스"
        />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <style jsx global>{`
        :root {
          --font-noto-sans-kr: ${notoSansKr.style.fontFamily};
        }
      `}</style>
      <MockingProvider>
        <ServerPrefetchedProvider value={isServerPrefetched}>
          <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={pageProps.dehydratedState}>
              <ErrorBoundary FallbackComponent={AppErrorFallback}>
                <HomeFlowProvider>
                  <AppShell>
                    <Component {...pageProps} />
                  </AppShell>
                </HomeFlowProvider>
              </ErrorBoundary>
            </HydrationBoundary>
          </QueryClientProvider>
        </ServerPrefetchedProvider>
      </MockingProvider>
    </>
  );
}
