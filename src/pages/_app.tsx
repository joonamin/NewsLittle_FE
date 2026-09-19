import { useState } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Noto_Sans_KR } from "next/font/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { AppShell } from "@/components/layout/app-shell";
import { AppErrorFallback } from "@/components/ui/async-boundary";
import { HomeFlowProvider } from "@/features/home/home-flow";
import { ReportFlowProvider } from "@/features/report/report-flow";
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

  return (
    <>
      <Head>
        <title>NewsLittle</title>
        <meta
          name="description"
          content="뉴스를 읽고 퀴즈로 학습하는 NewsLittle 서비스"
        />
      </Head>
      <style jsx global>{`
        :root {
          --font-noto-sans-kr: ${notoSansKr.style.fontFamily};
        }
      `}</style>
      <MockingProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary FallbackComponent={AppErrorFallback}>
            <HomeFlowProvider>
              <ReportFlowProvider>
                <AppShell>
                  <Component {...pageProps} />
                </AppShell>
              </ReportFlowProvider>
            </HomeFlowProvider>
          </ErrorBoundary>
        </QueryClientProvider>
      </MockingProvider>
    </>
  );
}
