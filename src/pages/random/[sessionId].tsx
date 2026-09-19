import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";

import { ArticleSourceMeta } from "@/components/attribution/article-source-meta";
import { AsyncBoundary } from "@/components/ui/async-boundary";
import { Button } from "@/components/ui/button";
import { ExplanationBlock } from "@/components/ui/explanation-block";
import { ProgressBar, ProgressLabel } from "@/components/ui/progress";
import { QuestionNavigation } from "@/components/ui/question-navigation";
import { QuizOptionChoice, QuizOptionOX } from "@/components/ui/quiz-option";
import { StateNotice } from "@/components/ui/state-notice";
import { ErrorState, LoadingState } from "@/components/ui/state-view";
import { quizSessionQueryOptions } from "@/features/contracts/query-keys";
import { screenApi } from "@/features/contracts/screen-api";
import { dehydrateScreenQueries, type DehydratedProps } from "@/features/contracts/server-prefetch";
import type { QuizPlayViewModel } from "@/features/contracts/view-models";
import { useHomeFlow } from "@/features/home/home-flow";
import {
  CHOICE_JUDGEMENT_TIMEOUT_MS,
  WRITTEN_JUDGEMENT_TIMEOUT_MS,
} from "@/features/quiz/judgement-timeout";
import { useQuizAbandonGuard } from "@/features/quiz/use-quiz-abandon-guard";
import { useReportFlow } from "@/features/report/report-flow";
import { submitValidated, useValidatedForm } from "@/lib/form";

type RandomQuizPlayPageProps = DehydratedProps & { sessionId: string };

const writtenAnswerSchema = z.object({
  answer: z.string().trim().min(1),
});

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timer = 0;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error("judgement-timeout")), timeoutMs);
      }),
    ]);
  } finally {
    window.clearTimeout(timer);
  }
}

export const getServerSideProps = (async ({ params, req }) => {
  const sessionId = params?.sessionId;
  if (typeof sessionId !== "string") {
    return { notFound: true };
  }

  const prefetched = await dehydrateScreenQueries(req, (queryClient, init) =>
    queryClient.prefetchQuery({
      ...quizSessionQueryOptions("random", sessionId),
      queryFn: () => screenApi.session("random", sessionId, init),
    }),
  );

  return { props: { sessionId, ...prefetched } };
}) satisfies GetServerSideProps<RandomQuizPlayPageProps>;

export default function RandomQuizPlayPage({ sessionId }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  return (
    <AsyncBoundary
      pending={
        <Page>
          <LoadingState title="문제를 준비하고 있어요" />
        </Page>
      }
      rejected={({ reset }) => (
        <Page>
          <ErrorState
            title="문제를 불러오지 못했어요"
            description="잠시 후 다시 시도해 주세요."
            onRetry={reset}
            onGoHome={() => void router.push("/")}
          />
        </Page>
      )}
    >
      <RandomQuizPlayContent sessionId={sessionId} />
    </AsyncBoundary>
  );
}

function RandomQuizPlayContent({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionOptions = quizSessionQueryOptions("random", sessionId);
  const { data: session } = useSuspenseQuery(sessionOptions);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const writtenForm = useValidatedForm(writtenAnswerSchema, { defaultValues: { answer: "" } });
  const writtenAnswer = writtenForm.watch("answer");
  const finishWithoutAbandon = useQuizAbandonGuard({
    active: session.status === "in-progress",
    domain: "random",
    router,
    sessionId,
  });

  const updateSession = (next: QuizPlayViewModel) => {
    queryClient.setQueryData(sessionOptions.queryKey, next);
  };

  const resetDraft = () => {
    setSelectedAnswer("");
    writtenForm.reset({ answer: "" });
  };

  const submitMutation = useMutation({
    mutationFn: async (answer: string) => {
      const timeoutMs = session.format === "written"
        ? WRITTEN_JUDGEMENT_TIMEOUT_MS
        : CHOICE_JUDGEMENT_TIMEOUT_MS;
      return withTimeout(screenApi.submitAnswer("random", sessionId, { answer }), timeoutMs);
    },
    onSuccess: updateSession,
  });
  const giveUpMutation = useMutation({
    mutationFn: () => screenApi.giveUpQuestion("random", sessionId),
    onSuccess: updateSession,
  });
  const nextQuestionMutation = useMutation({
    mutationFn: () => screenApi.nextQuestion("random", sessionId),
    onSuccess: (next) => {
      updateSession(next);
      resetDraft();
    },
  });
  const previousQuestionMutation = useMutation({
    mutationFn: () => screenApi.previousQuestion("random", sessionId),
    onSuccess: (previous) => {
      updateSession(previous);
      resetDraft();
    },
  });

  const isJudging = submitMutation.isPending || giveUpMutation.isPending || nextQuestionMutation.isPending || previousQuestionMutation.isPending;
  const submitError = submitMutation.isError || giveUpMutation.isError;

  const goNext = async () => {
    if (session.progress.current >= session.progress.total) {
      finishWithoutAbandon();
      await router.push(`/random/${sessionId}/result`);
      return;
    }
    nextQuestionMutation.mutate();
  };

  const goPrevious = () => {
    previousQuestionMutation.mutate();
  };

  if (session.status === "abandoned") {
    return (
      <Page>
        <h1 className="text-[28px] leading-[1.5] font-bold">랜덤 퀴즈</h1>
        <StateNotice
          title="중도 종료된 퀴즈예요"
          description="이 회차는 다시 이어서 풀 수 없어요. 새로운 퀴즈를 시작해 주세요."
          tone="accent"
          className="max-w-none"
          actions={<Button onClick={() => void router.push("/random")}>새 퀴즈 시작</Button>}
        />
      </Page>
    );
  }

  if (!session.question) {
    return (
      <Page>
        <LoadingState title="문제를 준비하고 있어요" />
      </Page>
    );
  }

  const { question, resolution } = session;
  const answer = session.format === "written" ? writtenAnswer.trim() : selectedAnswer;

  return (
    <Page>
      <h1 className="text-[28px] leading-[1.5] font-bold">랜덤 퀴즈</h1>
      <div className="space-y-3">
        <ProgressLabel category={session.format === "choice" ? "OX·객관식" : "주관식형"} progress={`${String(session.progress.current).padStart(2, "0")} / ${String(session.progress.total).padStart(2, "0")}`} />
        <ProgressBar current={session.progress.current} total={session.progress.total} />
      </div>

      {resolution ? (
        <Resolution session={session} />
      ) : (
        <section className="space-y-6 rounded-nl-card border border-nl-border bg-nl-bg p-6 md:p-8">
          <p className="text-nl-caption text-nl-muted">{question.context}</p>
          <h2 className="text-nl-title font-bold tracking-nl-tight">{question.prompt}</h2>

          {session.format === "choice" ? (
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="답 선택">
              {(question.choices && question.choices.length > 0
                ? question.choices
                : [
                    { id: "O", label: "O" },
                    { id: "X", label: "X" },
                  ]
              ).map((choice, index) => choice.label === "O" || choice.label === "X" ? (
                <QuizOptionOX key={choice.id} label={choice.label} selected={selectedAnswer === choice.id} disabled={isJudging} onClick={() => setSelectedAnswer(choice.id)} />
              ) : (
                <QuizOptionChoice key={choice.id} index={index + 1} text={choice.label} selected={selectedAnswer === choice.id} disabled={isJudging} onClick={() => setSelectedAnswer(choice.id)} />
              ))}
            </div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={submitValidated(writtenForm, ({ answer: nextAnswer }) => submitMutation.mutateAsync(nextAnswer))}
            >
              <label htmlFor="written-answer" className="text-nl-caption font-bold">내 답변</label>
              <textarea
                id="written-answer"
                disabled={isJudging}
                placeholder="답변을 입력해 주세요."
                className="min-h-32 w-full rounded-nl-card border border-nl-border bg-nl-bg p-4 text-nl-body"
                {...writtenForm.register("answer")}
              />
              {!writtenAnswer.trim() ? <p className="text-nl-caption text-nl-muted">빈 입력은 시도·오답으로 집계하지 않아요.</p> : null}
              {question.hint ? (
                <div className="space-y-3">
                  <ExplanationBlock header={`아직 정답이 아니에요 · ${question.hintLevel}차 힌트`} body={question.hint} hint="힌트를 참고해 다시 답하거나 포기할 수 있어요." />
                  {question.showsSemanticFeedback && question.semanticFeedback ? (
                    <div className="rounded-nl-button bg-nl-subtle p-4 text-nl-caption" role="status">
                      <p className="font-bold">의미 유사도 {question.semanticFeedback.similarityScore}%</p>
                      <p className="mt-1 text-nl-muted">부족한 방향: {question.semanticFeedback.missingDirection}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {submitError ? <p role="alert" className="text-nl-caption text-nl-negative">판정을 완료하지 못했어요. 오답으로 기록하지 않았습니다. 재시도하거나 포기해 주세요.</p> : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" disabled={!answer || isJudging}>{isJudging ? "판정 중…" : question.hint ? "다시 제출" : "제출하기"}</Button>
                <Button type="button" variant="secondary" disabled={isJudging} onClick={() => giveUpMutation.mutate()}>포기</Button>
              </div>
            </form>
          )}

          {session.format === "choice" ? (
            <>
              {submitError ? <p role="alert" className="text-nl-caption text-nl-negative">판정을 완료하지 못했어요. 오답으로 기록하지 않았습니다. 재시도하거나 포기해 주세요.</p> : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button disabled={!answer || isJudging} onClick={() => submitMutation.mutate(selectedAnswer)}>{isJudging ? "판정 중…" : question.hint ? "다시 제출" : "제출하기"}</Button>
                <Button variant="secondary" disabled={isJudging} onClick={() => giveUpMutation.mutate()}>포기</Button>
              </div>
            </>
          ) : null}
        </section>
      )}
      <QuestionNavigation
        current={session.progress.current}
        total={session.progress.total}
        canGoNext={Boolean(resolution)}
        pending={isJudging}
        onPrevious={goPrevious}
        onNext={() => void goNext()}
      />
    </Page>
  );
}

function Resolution({ session }: { session: QuizPlayViewModel }) {
  const resolution = session.resolution!;
  const evidence = resolution.evidence;
  const positive = resolution.outcome === "correct";
  const { home, requestArticleSelection } = useHomeFlow();
  const { openReport } = useReportFlow();
  const [isSaving, setIsSaving] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const isSaved =
    savedLocally ||
    Boolean(evidence && home?.todayList?.items.some((item) => item.articleId === evidence.id));

  const saveArticle = async () => {
    if (!evidence || isSaved || isSaving) return;
    setIsSaving(true);
    try {
      const result = await requestArticleSelection(evidence.id);
      if (result === "added" || result === "already-selected") setSavedLocally(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <section className="space-y-5 rounded-nl-card border border-nl-border bg-nl-bg p-6 md:p-8">
        <p className={`text-[20px] font-bold ${positive ? "text-nl-positive" : "text-nl-text"}`}>{positive ? "✓ 정답이에요" : resolution.outcomeLabel}</p>
        <h2 className="text-nl-title font-bold">{session.question?.prompt}</h2>
        <p className="text-nl-caption">내 답 {resolution.userAnswer ?? "포기"} · 정답 {resolution.answer}</p>
        {resolution.explanation ? <p className="text-nl-body text-nl-muted">{resolution.explanation}</p> : null}
        {evidence ? (
          <article className="space-y-3 rounded-nl-card border border-nl-border bg-nl-accent-wash p-6">
            <p className="text-nl-micro font-bold text-nl-accent">이 문제의 뉴스</p>
            <h3 className="text-[20px] font-bold">{evidence.title}</h3>
            {evidence.summaryText ? <p className="text-nl-caption text-nl-muted">{evidence.summaryText}</p> : null}
            <ArticleSourceMeta
              sourceName={evidence.sourceName}
              publishedLabel={evidence.publishedLabel}
              originalUrl={evidence.originalIsAvailable ? evidence.originalUrl : null}
              showsAiSummary={evidence.showsAiSummary}
              onReport={() =>
                openReport({
                  surface: "HOME_CARD",
                  articleId: evidence.id,
                  targetLabel: evidence.title,
                  availableReasons: ["CONTENT_ERROR", "RIGHTS", "SOURCE_UNREACHABLE"],
                })
              }
            />
            <div className="flex flex-wrap items-center gap-4">
              <Button variant={isSaved ? "default" : "secondary"} size="s" disabled={isSaved || isSaving} onClick={() => void saveArticle()}>
                {isSaved ? "오늘 목록에 담김" : isSaving ? "담는 중…" : "오늘 목록에 담기"}
              </Button>
            </div>
          </article>
        ) : null}
        {evidence && session.question ? (
          <button
            type="button"
            onClick={() =>
              openReport({
                surface: "QUIZ",
                articleId: evidence.id,
                quizId: session.question!.id,
                targetLabel: session.question!.prompt,
                availableReasons: ["JUDGMENT_ERROR", "CONTENT_ERROR"],
                defaultReason: "JUDGMENT_ERROR",
              })
            }
            className="text-nl-micro text-nl-negative underline-offset-4 hover:underline"
          >
            판정 오류 신고
          </button>
        ) : null}
      </section>
    </>
  );
}

function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-5 py-9 md:px-8">{children}</div>;
}
