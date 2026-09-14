import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { RoutePlaceholder } from "@/components/layout/route-placeholder";

type RandomQuizPlayPageProps = {
  sessionId: string;
};

export const getServerSideProps = (async ({ params }) => {
  const sessionId = params?.sessionId;

  if (typeof sessionId !== "string") {
    return { notFound: true };
  }

  return { props: { sessionId } };
}) satisfies GetServerSideProps<RandomQuizPlayPageProps>;

export default function RandomQuizPlayPage({
  sessionId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <RoutePlaceholder
      eyebrow="SCR-11"
      title="랜덤 퀴즈 풀이"
      description="랜덤 퀴즈의 고정된 회차를 푸는 화면입니다."
      sessionId={sessionId}
    />
  );
}
