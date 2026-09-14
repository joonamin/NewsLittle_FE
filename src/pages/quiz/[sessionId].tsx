import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { RoutePlaceholder } from "@/components/layout/route-placeholder";

type QuizPlayPageProps = {
  sessionId: string;
};

export const getServerSideProps = (async ({ params }) => {
  const sessionId = params?.sessionId;

  if (typeof sessionId !== "string") {
    return { notFound: true };
  }

  return { props: { sessionId } };
}) satisfies GetServerSideProps<QuizPlayPageProps>;

export default function QuizPlayPage({
  sessionId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <RoutePlaceholder
      eyebrow="SCR-04"
      title="숏폼 퀴즈 풀이"
      description="회원의 고정된 숏폼 퀴즈 회차를 푸는 화면입니다."
      sessionId={sessionId}
    />
  );
}
