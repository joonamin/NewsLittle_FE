import type { AppProps } from "next/app";
import Head from "next/head";

import { MockingProvider } from "@/mocks/mocking-provider";

import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>NewsLittle</title>
        <meta
          name="description"
          content="뉴스를 읽고 퀴즈로 학습하는 NewsLittle 서비스"
        />
      </Head>
      <MockingProvider>
        <Component {...pageProps} />
      </MockingProvider>
    </>
  );
}
