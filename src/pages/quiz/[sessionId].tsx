import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { z } from "zod";

import { EvidenceAttribution } from "@/components/attribution/evidence-attribution";
import { AsyncBoundary } from "@/components/ui/async-boundary";
import { Button } from "@/components/ui/button";
import { ExplanationBlock } from "@/components/ui/explanation-block";
import { ProgressBar, ProgressLabel } from "@/components/ui/progress";
import { QuestionNavigation } from "@/components/ui/question-navigation";
import { QuizOptionChoice, QuizOptionOX } from "@/components/ui/quiz-option";
import { ErrorState, LoadingState } from "@/components/ui/state-view";
import {
  navigationQueryOptions,
  quizSessionQueryOptions,
} from "@/features/contracts/query-keys";
import { screenApi } from "@/features/contracts/screen-api";
import type { QuizPlayViewModel } from "@/features/contracts/view-models";
import { useHomeFlow } from "@/features/home/home-flow";
import { submitValidated, useValidatedForm } from "@/lib/form";

type QuizPlayPageProps = {
  sessionId: string;
};

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
  const router = useRouter();
  const { loginOpen, requestLogin } = useHomeFlow();
  const navigationQuery = useQuery(navigationQueryOptions);
  const requestedLoginRef = useRef(false);
  const wasLoginOpenRef = useRef(false);
  const isNavigationSettled =
    !navigationQuery.isPending && !navigationQuery.isPlaceholderData;
  const isGuest =
    isNavigationSettled && navigationQuery.data?.account.status === "guest";

  useEffect(() => {
    if (isGuest && !requestedLoginRef.current) {
      requestedLoginRef.current = true;
      requestLogin();
    }
  }, [isGuest, requestLogin]);

  useEffect(() => {
    if (wasLoginOpenRef.current && !loginOpen && isGuest) {
      router.back();
    }
    wasLoginOpenRef.current = loginOpen;
  }, [isGuest, loginOpen, router]);

  if (!isNavigationSettled) {
    return (
      <Page>
        <LoadingState title="회원 정보를 확인하고 있어요" />
      </Page>
    );
  }

  if (isGuest) {
    return (
      <Page>
        <ErrorState
          title="로그인이 필요해요"
          description="숏폼 퀴즈는 오늘 목록을 사용하는 회원 전용 기능이에요."
          retryLabel="로그인"
          onRetry={requestLogin}
          onGoHome={() => void router.push("/")}
        />
      </Page>
    );
  }

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
      <QuizPlayContent sessionId={sessionId} />
    </AsyncBoundary>
  );
}

function QuizPlayContent({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionOptions = quizSessionQueryOptions("shortform", sessionId);
  const { data: session } = useSuspenseQuery(sessionOptions);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const writtenForm = useValidatedForm(writtenAnswerSchema, {
    defaultValues: { answer: "" },
  });
  const writtenAnswer = writtenForm.watch("answer");

  const updateSession = (next: QuizPlayViewModel) => {
    queryClient.setQueryData(sessionOptions.queryKey, next);
  };

  const resetDraft = () => {
    setSelectedAnswer("");
    writtenForm.reset({ answer: "" });
  };

  const submitMutation = useMutation({
    mutationFn: (answer: string) =>
      withTimeout(
        screenApi.submitAnswer("shortform", sessionId, { answer }),
        session.format === "written" ? 10_000 : 1_000,
      ),
    onSuccess: updateSession,
  });
  const giveUpMutation = useMutation({
    mutationFn: () => screenApi.giveUpQuestion("shortform", sessionId),
    onSuccess: updateSession,
  });
  const nextQuestionMutation = useMutation({
    mutationFn: () => screenApi.nextQuestion("shortform", sessionId),
    onSuccess: (next) => {
      updateSession(next);
      resetDraft();
    },
  });
  const previousQuestionMutation = useMutation({
    mutationFn: () => screenApi.previousQuestion("shortform", sessionId),
    onSuccess: (previous) => {
      updateSession(previous);
      resetDraft();
    },
  });

  const isJudging =
    submitMutation.isPending ||
    giveUpMutation.isPending ||
    nextQuestionMutation.isPending ||
    previousQuestionMutation.isPending;
  const judgementIncomplete = submitMutation.isError || giveUpMutation.isError;

  const goNext = async () => {
    if (session.progress.current >= session.progress.total) {
      await router.push(`/quiz/${sessionId}/result`);
      return;
    }
    nextQuestionMutation.mutate();
  };

  const goPrevious = () => {
    previousQuestionMutation.mutate();
  };

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
      <h1 className="text-[28px] leading-[1.5] font-bold text-nl-text">숏폼 퀴즈</h1>

      <div className="space-y-3">
        <ProgressLabel
          category={session.format === "choice"
            ? "오늘 목록 · OX·객관식"
            : `숏폼 퀴즈 · 주관식형 · ${question.showsSemanticFeedback ? "의미형" : "사실형"}`}
          progress={`${String(session.progress.current).padStart(2, "0")} / ${String(session.progress.total).padStart(2, "0")}`}
        />
        <ProgressBar current={session.progress.current} total={session.progress.total} />
      </div>

      <section className="space-y-6 rounded-nl-card border border-nl-border bg-nl-bg p-6 md:p-8">
        <div className="space-y-3">
          <p className="text-nl-caption font-bold text-nl-accent">
            기사 {String(session.progress.current).padStart(2, "0")} · {question.title}
          </p>
          <h2 className="text-nl-title font-bold tracking-nl-tight text-nl-text">
            {question.prompt}
          </h2>
          {question.context ? (
            <p className="text-nl-caption text-nl-muted">{question.context}</p>
          ) : null}
        </div>

        {resolution ? (
          <Resolution session={session} />
        ) : session.format === "choice" ? (
          <ChoiceAnswer
            session={session}
            selectedAnswer={selectedAnswer}
            isJudging={isJudging}
            judgementIncomplete={judgementIncomplete}
            onSelect={setSelectedAnswer}
            onSubmit={() => submitMutation.mutate(selectedAnswer)}
            onGiveUp={() => giveUpMutation.mutate()}
          />
        ) : (
          <form
            className="space-y-4"
            onSubmit={submitValidated(writtenForm, ({ answer: nextAnswer }) =>
              submitMutation.mutateAsync(nextAnswer),
            )}
          >
            <label htmlFor="written-answer" className="text-nl-caption font-bold text-nl-text">
              내 답변
            </label>
            <textarea
              id="written-answer"
              disabled={isJudging}
              placeholder="핵심 개념을 짧게 입력해 주세요."
              className="min-h-32 w-full rounded-nl-card border border-nl-border bg-nl-bg p-4 text-nl-body text-nl-text disabled:bg-nl-subtle"
              {...writtenForm.register("answer")}
            />
            {!writtenAnswer.trim() ? (
              <p className="text-nl-caption text-nl-muted">
                빈 답변은 시도·오답으로 기록하지 않아요.
              </p>
            ) : null}
            {question.hint ? (
              <>
                <ExplanationBlock
                  header={`아직 정답이 아니에요 · ${question.hintLevel}차 힌트`}
                  body={question.hint}
                  hint="힌트를 참고해 다시 답하거나 포기할 수 있어요."
                />
                {question.showsSemanticFeedback && question.semanticFeedback ? (
                  <div
                    role="status"
                    className="space-y-1 rounded-nl-button bg-nl-subtle p-4 text-nl-caption"
                  >
                    <p className="font-bold text-nl-text">
                      의미 유사도 {question.semanticFeedback.similarityScore}%
                    </p>
                    <p className="text-nl-muted">
                      부족한 방향: {question.semanticFeedback.missingDirection}
                    </p>
                  </div>
                ) : null}
              </>
            ) : null}
            {judgementIncomplete ? <JudgementIncomplete /> : null}
            <ActionButtons
              canSubmit={Boolean(answer)}
              isJudging={isJudging}
              submitLabel={question.hint ? "다시 제출" : "답변 제출"}
              onGiveUp={() => giveUpMutation.mutate()}
            />
          </form>
        )}
      </section>

      <QuestionNavigation
        current={session.progress.current}
        total={session.progress.total}
        canGoNext={Boolean(resolution)}
        pending={isJudging}
        onPrevious={goPrevious}
        onNext={() => void goNext()}
      />

      <p className="text-center text-nl-micro text-nl-muted">
        시간 제한은 없어요. 이동·새로고침 시 확인 후 회차가 중도 종료돼요.
      </p>
    </Page>
  );
}

function ChoiceAnswer({
  session,
  selectedAnswer,
  isJudging,
  judgementIncomplete,
  onSelect,
  onSubmit,
  onGiveUp,
}: {
  session: QuizPlayViewModel;
  selectedAnswer: string;
  isJudging: boolean;
  judgementIncomplete: boolean;
  onSelect: (answer: string) => void;
  onSubmit: () => void;
  onGiveUp: () => void;
}) {
  const choices = session.question?.choices ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="답 선택">
        {choices.map((choice, index) =>
          choice.label === "O" || choice.label === "X" ? (
            <QuizOptionOX
              key={choice.id}
              label={choice.label}
              selected={selectedAnswer === choice.id}
              disabled={isJudging}
              onClick={() => onSelect(choice.id)}
            />
          ) : (
            <QuizOptionChoice
              key={choice.id}
              index={index + 1}
              text={choice.label}
              selected={selectedAnswer === choice.id}
              disabled={isJudging}
              onClick={() => onSelect(choice.id)}
            />
          ),
        )}
      </div>
      {judgementIncomplete ? <JudgementIncomplete /> : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={!selectedAnswer || isJudging} onClick={onSubmit}>
          {isJudging ? "판정 중…" : "답변 제출"}
        </Button>
        <Button variant="secondary" disabled={isJudging} onClick={onGiveUp}>
          포기
        </Button>
      </div>
    </div>
  );
}

function ActionButtons({
  canSubmit,
  isJudging,
  submitLabel,
  onGiveUp,
}: {
  canSubmit: boolean;
  isJudging: boolean;
  submitLabel: string;
  onGiveUp: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button type="submit" disabled={!canSubmit || isJudging}>
        {isJudging ? "판정 중…" : submitLabel}
      </Button>
      <Button type="button" variant="secondary" disabled={isJudging} onClick={onGiveUp}>
        포기
      </Button>
    </div>
  );
}

function JudgementIncomplete() {
  return (
    <p role="alert" className="text-nl-caption text-nl-negative">
      판정을 완료하지 못했어요. 오답으로 기록하지 않았습니다. 재시도하거나 포기해 주세요.
    </p>
  );
}

function Resolution({ session }: { session: QuizPlayViewModel }) {
  const resolution = session.resolution!;
  const evidence = resolution.evidence;
  const positive = resolution.outcome === "correct";

  return (
    <div className="space-y-5">
      <p
        role="status"
        className={`text-[20px] font-bold ${positive ? "text-nl-positive" : "text-nl-text"}`}
      >
        {positive ? "✓ 정답이에요" : resolution.outcomeLabel}
      </p>
      <p className="text-nl-caption text-nl-text">
        내 답 {resolution.userAnswer ?? "포기"} · 정답 {resolution.answer ?? "-"}
      </p>
      {resolution.explanation ? (
        <ExplanationBlock
          header={positive ? "정답 해설" : "정답과 해설"}
          body={resolution.explanation}
        />
      ) : null}
      <button type="button" className="text-nl-micro text-nl-negative underline-offset-4 hover:underline">
        판정 오류 신고
      </button>
      {evidence ? (
        <EvidenceAttribution
          articleTitle={evidence.title}
          sourceName={evidence.sourceName}
          publishedLabel={evidence.publishedLabel}
          originalUrl={evidence.originalIsAvailable ? evidence.originalUrl : null}
          asOfLabel="문항 생성 기준 2026.09.14"
        />
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
