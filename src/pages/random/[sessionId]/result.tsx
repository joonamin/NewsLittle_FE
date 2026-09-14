import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { RoutePlaceholder } from "@/components/layout/route-placeholder";

type RandomQuizResultPageProps = {
  sessionId: string;
};

export const getServerSideProps = (async ({ params }) => {
  const sessionId = params?.sessionId;

  if (typeof sessionId !== "string") {
    return { notFound: true };
  }

  return { props: { sessionId } };
}) satisfies GetServerSideProps<RandomQuizResultPageProps>;

export default function RandomQuizResultPage({
  sessionId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <RoutePlaceholder
      eyebrow="SCR-12"
      title="랜덤 퀴즈 결과"
      description="랜덤 퀴즈 회차의 결과와 기사 탐색 행동을 보여주는 화면입니다."
      sessionId={sessionId}
    />
  );
}
