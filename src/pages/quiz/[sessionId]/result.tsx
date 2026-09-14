import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { RoutePlaceholder } from "@/components/layout/route-placeholder";

type QuizResultPageProps = {
  sessionId: string;
};

export const getServerSideProps = (async ({ params }) => {
  const sessionId = params?.sessionId;

  if (typeof sessionId !== "string") {
    return { notFound: true };
  }

  return { props: { sessionId } };
}) satisfies GetServerSideProps<QuizResultPageProps>;

export default function QuizResultPage({
  sessionId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <RoutePlaceholder
      eyebrow="SCR-05"
      title="숏폼 퀴즈 결과"
      description="숏폼 퀴즈 회차의 결과와 다음 행동을 보여주는 화면입니다."
      sessionId={sessionId}
    />
  );
}
