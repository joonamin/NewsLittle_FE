import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ExplanationBlock } from "@/components/ui/explanation-block";
import { ProgressBar, ProgressLabel } from "@/components/ui/progress";
import { QuizOptionChoice, QuizOptionOX } from "@/components/ui/quiz-option";
import { ErrorState, LoadingState } from "@/components/ui/state-view";
import { screenApi } from "@/features/contracts/screen-api";
import type { QuizPlayViewModel } from "@/features/contracts/view-models";

type RandomQuizPlayPageProps = { sessionId: string };

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
  return typeof sessionId === "string" ? { props: { sessionId } } : { notFound: true };
}) satisfies GetServerSideProps<RandomQuizPlayPageProps>;

export default function RandomQuizPlayPage({ sessionId }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [session, setSession] = useState<QuizPlayViewModel | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [isJudging, setIsJudging] = useState(false);
  const [error, setError] = useState(false);

  const loadSession = async () => {
    setError(false);
    try {
      setSession(await screenApi.session("random", sessionId));
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    let cancelled = false;
    void screenApi.session("random", sessionId).then(
      (value) => { if (!cancelled) setSession(value); },
      () => { if (!cancelled) setError(true); },
    );
    return () => { cancelled = true; };
  }, [sessionId]);

  useEffect(() => {
    const confirmExit = (event: BeforeUnloadEvent) => {
      if (!session?.resolution) event.preventDefault();
    };
    window.addEventListener("beforeunload", confirmExit);
    return () => window.removeEventListener("beforeunload", confirmExit);
  }, [session?.resolution]);

  const submit = async () => {
    const answer = session?.format === "written" ? writtenAnswer.trim() : selectedAnswer;
    if (!answer || isJudging) return;
    setIsJudging(true);
    setError(false);
    try {
      const timeoutMs = session?.format === "written" ? 10_000 : 1_000;
      setSession(await withTimeout(screenApi.submitAnswer("random", sessionId, { answer }), timeoutMs));
    } catch {
      setError(true);
    } finally {
      setIsJudging(false);
    }
  };

  const giveUp = async () => {
    if (isJudging) return;
    setIsJudging(true);
    try {
      setSession(await screenApi.giveUpQuestion("random", sessionId));
    } catch {
      setError(true);
    } finally {
      setIsJudging(false);
    }
  };

  const nextQuestion = async () => {
    if (!session) return;
    if (session.progress.current >= session.progress.total) {
      await router.push(`/random/${sessionId}/result`);
      return;
    }
    setSession(await screenApi.nextQuestion("random", sessionId));
    setSelectedAnswer("");
    setWrittenAnswer("");
  };

  if (error && !session) return <Page><ErrorState title="문제를 불러오지 못했어요" description="잠시 후 다시 시도해 주세요." onRetry={() => void loadSession()} onGoHome={() => void router.push("/")} /></Page>;
  if (!session?.question) return <Page><LoadingState title="문제를 준비하고 있어요" /></Page>;

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
        <Resolution session={session} onNext={() => void nextQuestion()} />
      ) : (
        <section className="space-y-6 rounded-nl-card border border-nl-border bg-nl-bg p-6 md:p-8">
          <p className="text-nl-caption text-nl-muted">{question.context}</p>
          <h2 className="text-nl-title font-bold tracking-nl-tight">{question.prompt}</h2>

          {session.format === "choice" ? (
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="답 선택">
              {question.choices?.map((choice, index) => choice.label === "O" || choice.label === "X" ? (
                <QuizOptionOX key={choice.id} label={choice.label} selected={selectedAnswer === choice.id} disabled={isJudging} onClick={() => setSelectedAnswer(choice.id)} />
              ) : (
                <QuizOptionChoice key={choice.id} index={index + 1} text={choice.label} selected={selectedAnswer === choice.id} disabled={isJudging} onClick={() => setSelectedAnswer(choice.id)} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <label htmlFor="written-answer" className="text-nl-caption font-bold">내 답변</label>
              <textarea id="written-answer" value={writtenAnswer} disabled={isJudging} onChange={(event) => setWrittenAnswer(event.target.value)} placeholder="답변을 입력해 주세요." className="min-h-32 w-full rounded-nl-card border border-nl-border bg-nl-bg p-4 text-nl-body" />
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
            </div>
          )}

          {error ? <p role="alert" className="text-nl-caption text-nl-negative">판정을 완료하지 못했어요. 오답으로 기록하지 않았습니다. 재시도하거나 포기해 주세요.</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button disabled={!answer || isJudging} onClick={() => void submit()}>{isJudging ? "판정 중…" : question.hint ? "다시 제출" : "제출하기"}</Button>
            <Button variant="secondary" disabled={isJudging} onClick={() => void giveUp()}>포기</Button>
          </div>
        </section>
      )}
    </Page>
  );
}

function Resolution({ session, onNext }: { session: QuizPlayViewModel; onNext: () => void }) {
  const resolution = session.resolution!;
  const evidence = resolution.evidence;
  const positive = resolution.outcome === "correct";
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saveArticle = async () => {
    if (!evidence || isSaved || isSaving) return;
    setIsSaving(true);
    try {
      await screenApi.addToTodayList({ articleId: evidence.id });
      setIsSaved(true);
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
        <button type="button" className="text-nl-micro text-nl-negative">판정 오류 신고</button>
        {evidence ? (
          <article className="space-y-3 rounded-nl-card border border-nl-border bg-nl-accent-wash p-6">
            <p className="text-nl-micro font-bold text-nl-accent">이 문제의 뉴스</p>
            <h3 className="text-[20px] font-bold">{evidence.title}</h3>
            {evidence.summaryText ? <p className="text-nl-caption text-nl-muted">{evidence.summaryText}</p> : null}
            <p className="text-nl-micro text-nl-muted">{evidence.sourceName} · {evidence.publishedLabel}{evidence.showsAiSummary ? " · AI 요약" : ""}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant={isSaved ? "default" : "secondary"} size="s" disabled={isSaved || isSaving} onClick={() => void saveArticle()}>
                {isSaved ? "오늘 목록에 담김" : isSaving ? "담는 중…" : "오늘 목록에 담기"}
              </Button>
              {evidence.originalIsAvailable ? <a href={evidence.originalUrl} target="_blank" rel="noreferrer" className="text-nl-caption font-bold text-nl-accent">원문 보기 ↗</a> : null}
            </div>
          </article>
        ) : null}
      </section>
      <Button onClick={onNext}>{session.progress.current >= session.progress.total ? "결과 보기 →" : "다음 문제 →"}</Button>
    </>
  );
}

function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-5 py-9 md:px-8">{children}</div>;
}
