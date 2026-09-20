import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { type ReactNode, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { EvidenceAttribution } from "@/components/attribution/evidence-attribution";
import { AsyncBoundary } from "@/components/ui/async-boundary";
import { AnswerComparison } from "@/components/ui/answer-comparison";
import { Button } from "@/components/ui/button";
import { StateNotice } from "@/components/ui/state-notice";
import { ErrorState, LoadingState } from "@/components/ui/state-view";
import { quizResultQueryOptions } from "@/features/contracts/query-keys";
import { screenApi } from "@/features/contracts/screen-api";
import { dehydrateScreenQueries, type DehydratedProps } from "@/features/contracts/server-prefetch";
import type { QuizRecapItemViewModel } from "@/features/contracts/view-models";
import { useHomeFlow } from "@/features/home/home-flow";
import { useReportFlow } from "@/features/report/report-flow";

type QuizResultPageProps = DehydratedProps & {
  sessionId: string;
};

export const getServerSideProps = (async ({ params, req }) => {
  const sessionId = params?.sessionId;

  if (typeof sessionId !== "string") {
    return { notFound: true };
  }

  const prefetched = await dehydrateScreenQueries(req, (queryClient, init) =>
    queryClient.prefetchQuery({
      ...quizResultQueryOptions("shortform", sessionId),
      queryFn: () => screenApi.result("shortform", sessionId, init),
    }),
  );

  return { props: { sessionId, ...prefetched } };
}) satisfies GetServerSideProps<QuizResultPageProps>;

export default function QuizResultPage({
  sessionId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  return (
    <AsyncBoundary
      pending={
        <Page>
          <LoadingState title="결과를 불러오고 있어요" />
        </Page>
      }
      rejected={({ reset }) => (
        <Page>
          <ErrorState
            title="결과를 불러오지 못했어요"
            description="잠시 후 다시 시도해 주세요."
            onRetry={reset}
            onGoHome={() => void router.push("/")}
          />
        </Page>
      )}
    >
      <QuizResultContent sessionId={sessionId} />
    </AsyncBoundary>
  );
}

function QuizResultContent({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { data: result } = useSuspenseQuery(quizResultQueryOptions("shortform", sessionId));
  const { home } = useHomeFlow();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  if (result.isServiceEnded) {
    return (
      <Page>
        <h1 className="text-[28px] font-bold leading-[1.5] text-nl-text">숏폼 퀴즈</h1>
        <StateNotice
          title="서비스 사유로 퀴즈가 종료되었어요"
          description="준비된 문항의 권리 중단 또는 제공사 요청으로 인해 이번 회차를 완료하지 못했습니다. 채점 분모와 오답 집계에서 제외되었으며 정상 완료로 집계되지 않았습니다."
          tone="accent"
          className="max-w-none"
          actions={<Button onClick={() => void router.push("/")}>홈으로</Button>}
        />
      </Page>
    );
  }

  const { summary, recapItems } = result;
  const todayListCount = home?.todayList?.count ?? 0;

  return (
    <Page>
      <h1 className="text-[28px] font-bold leading-[1.5] text-nl-text">
        고른 뉴스의 퀴즈를 마쳤어요
      </h1>

      <section
        className="flex w-full flex-col gap-5 rounded-nl-card border border-nl-border bg-nl-bg p-6 md:p-8"
        aria-label="결과 요약"
      >
        <p className="text-nl-caption text-nl-muted">
          최초 계획 {summary.planned}문제 · 실제 처리 {summary.processed}문제
          {summary.excludedByService > 0 ? ` · 서비스 제외 ${summary.excludedByService}문제` : ""}
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1 rounded-nl-card bg-nl-subtle p-4 text-center">
            <p className="text-[28px] font-bold text-nl-accent">{summary.correct}</p>
            <p className="text-nl-caption font-normal text-nl-muted">정답</p>
          </div>
          <div className="flex flex-col gap-1 rounded-nl-card bg-nl-subtle p-4 text-center">
            <p className="text-[28px] font-bold text-nl-text">{summary.choiceIncorrect}</p>
            <p className="text-nl-caption font-normal text-nl-muted">
              {result.format === "choice" ? "선택형 오답" : "오답"}
            </p>
          </div>
          <div className="flex flex-col gap-1 rounded-nl-card bg-nl-subtle p-4 text-center">
            <p className="text-[28px] font-bold text-nl-text">{summary.givenUp}</p>
            <p className="text-nl-caption font-normal text-nl-muted">포기</p>
          </div>
          <div className="flex flex-col gap-1 rounded-nl-card bg-nl-subtle p-4 text-center">
            <p className="text-[28px] font-bold text-nl-text">{summary.excludedByService}</p>
            <p className="text-nl-caption font-normal text-nl-muted">서비스 제외</p>
          </div>
        </div>

        <p className="text-nl-caption text-nl-muted">
          {todayListCount > 0
            ? `오늘 목록 ${todayListCount}개는 그대로 남아 있어요.`
            : "오늘 목록은 그대로 남아 있어요."}
          {result.canStartNextRound ? " 남은 출제 대상이 있어요." : " 남은 출제 대상은 없어요."}
        </p>

        {summary.excludedByService > 0 ? (
          <p className="text-nl-caption text-nl-muted">
            서비스 제외 {summary.excludedByService}문제는 채점 분모와 오답에서 제외했어요.
          </p>
        ) : null}

        {result.format === "written" && summary.writtenCorrect ? (
          <p className="text-nl-micro text-nl-muted">
            주관식 정답 집계: 첫 시도 {summary.writtenCorrect.firstAttempt}문제 · 힌트 없는 재시도{" "}
            {summary.writtenCorrect.retryWithoutHint}문제 · 힌트 후{" "}
            {summary.writtenCorrect.retryWithHint}문제
          </p>
        ) : null}
      </section>

      <section
        className="flex w-full flex-col gap-4 rounded-nl-card border border-nl-border bg-nl-bg p-6 md:p-8"
        aria-label="문항별 복기"
      >
        <h2 className="text-[20px] font-bold text-nl-text">문항별 복기</h2>

        <div className="divide-y divide-nl-border">
          {recapItems.map((item, idx) => (
            <RecapRow
              key={idx}
              item={item}
              isExpanded={expandedIndex === idx}
              onToggle={() => toggleExpand(idx)}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          {result.canStartNextRound ? (
            <>
              <Button
                variant="primary"
                size="l"
                onClick={() => void router.push(`/quiz?format=${result.format}`)}
              >
                다음 회차 풀기
              </Button>
              <Button variant="secondary" size="l" onClick={() => void router.push("/")}>
                홈으로
              </Button>
            </>
          ) : (
            <Button variant="primary" size="l" onClick={() => void router.push("/")}>
              홈으로
            </Button>
          )}
        </div>
        <p className="text-nl-caption text-nl-muted">
          여기서 이용을 마쳐도 괜찮아요. 정답 수는 학습 효과를 뜻하지 않아요.
        </p>
      </div>
    </Page>
  );
}

function RecapRow({
  item,
  isExpanded,
  onToggle,
}: {
  item: QuizRecapItemViewModel;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { openReport } = useReportFlow();
  const openQuestionReport = (defaultReason: "JUDGMENT_ERROR" | "CONTENT_ERROR") => {
    if (!item.evidence || !item.quizId) return;
    openReport({
      surface: "QUIZ",
      articleId: item.evidence.id,
      quizId: item.quizId,
      answerRef: item.answerRef,
      targetLabel: item.prompt,
      availableReasons: ["JUDGMENT_ERROR", "CONTENT_ERROR"],
      defaultReason,
    });
  };
  const outcomeColor =
    item.outcome === "correct"
      ? "text-nl-positive"
      : item.outcome === "incorrect"
        ? "text-nl-text"
        : "text-nl-muted";

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 rounded-nl-button px-2 -mx-2 text-left font-bold transition-colors hover:bg-nl-subtle"
      >
        <span className="text-nl-body text-nl-text">
          {String(item.index).padStart(2, "0")}  {item.prompt}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-nl-caption font-bold ${outcomeColor}`}>{item.outcomeLabel}</span>
          {isExpanded ? (
            <ChevronUp width={20} height={20} className="text-nl-text" aria-hidden />
          ) : (
            <ChevronDown width={20} height={20} className="text-nl-text" aria-hidden />
          )}
        </div>
      </button>

      {isExpanded ? (
        <div className="mt-4 space-y-4 pt-2">
          <AnswerComparison
            userAnswer={item.userAnswer}
            correctAnswer={item.correctAnswer}
            outcome={item.outcome}
          />
          {item.explanation ? (
            <p className="text-nl-caption text-nl-muted leading-[1.5]">{item.explanation}</p>
          ) : null}

          {item.outcome === "service-excluded" ? (
            <StateNotice
              title="문항 서비스 제외"
              description="이용 조건이 변경되어 문항을 제외했어요. 오답과 채점 분모에 포함하지 않아요."
              tone="accent"
              className="max-w-none"
            />
          ) : null}

          {item.evidence ? (
            <>
              {!item.evidence.originalIsAvailable ? (
                <StateNotice
                  title="원문을 열 수 없어요"
                  description="현재 제공처에서 원문 접근을 지원하지 않아요. 풀이 결과는 그대로 유지됩니다."
                  className="max-w-none"
                />
              ) : null}
              <EvidenceAttribution
                articleTitle={item.evidence.title}
                sourceName={item.evidence.sourceName}
                publishedLabel={item.evidence.publishedLabel}
                originalUrl={item.evidence.originalIsAvailable ? item.evidence.originalUrl : null}
                asOfLabel="문항 생성 기준 2026.09.14"
              />
            </>
          ) : null}

          <div className="flex items-center gap-4 pt-1">
            <button
              type="button"
              onClick={() => openQuestionReport("JUDGMENT_ERROR")}
              className="text-nl-micro text-nl-negative hover:underline"
            >
              판정 오류 신고
            </button>
            <button
              type="button"
              onClick={() => openQuestionReport("CONTENT_ERROR")}
              className="text-nl-micro text-nl-muted hover:underline"
            >
              내용 오류 신고
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Page({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-5 py-9 md:px-8">
      {children}
    </div>
  );
}
