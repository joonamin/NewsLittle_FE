import { useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

import { AsyncBoundary } from "@/components/ui/async-boundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/ui/state-view";
import type { QuizFormat } from "@/features/contracts/api-models";
import { quizPreviewQueryOptions } from "@/features/contracts/query-keys";
import { screenApi } from "@/features/contracts/screen-api";
import { cn } from "@/lib/cn";

const formatDescription: Record<QuizFormat, string> = {
  choice: "주어진 보기에서 답을 골라요.",
  written: "자신의 말로 답하고 힌트를 받아요.",
};

export default function RandomQuizStartPage() {
  const router = useRouter();

  return (
    <AsyncBoundary
      pending={
        <PageContainer>
          <LoadingState title="랜덤 퀴즈를 준비하고 있어요" description="출제 가능한 문제를 확인 중이에요." />
        </PageContainer>
      }
      rejected={({ reset }) => (
        <PageContainer>
          <ErrorState
            title="퀴즈 정보를 불러오지 못했어요"
            description="잠시 후 다시 시도해 주세요. 문제가 계속되면 홈에서 다른 뉴스를 둘러볼 수 있어요."
            onRetry={reset}
            onGoHome={() => void router.push("/")}
          />
        </PageContainer>
      )}
    >
      <RandomQuizStartContent />
    </AsyncBoundary>
  );
}

function RandomQuizStartContent() {
  const router = useRouter();
  const { data: preview } = useSuspenseQuery(quizPreviewQueryOptions("random"));
  const [selectedFormat, setSelectedFormat] = useState<QuizFormat>(preview.defaultFormatId);
  const startQuiz = useMutation({
    mutationFn: (format: QuizFormat) => screenApi.createSession("random", { format }),
    onSuccess: (session) => {
      void router.push(`/random/${session.id}`);
    },
  });

  const selectedOption = preview.formats.find((format) => format.id === selectedFormat);
  const unavailableFormats = preview.formats.filter((format) => !format.enabled && format.reason);
  const canStart = Boolean(selectedOption?.enabled);

  return (
    <PageContainer>
      <header className="space-y-2">
        <h1 className="text-nl-title-xl font-bold tracking-nl-tight">퀴즈로 새로운 뉴스를 만나보세요</h1>
        <p className="text-nl-body text-nl-muted">읽은 기사나 로그인 없이도 바로 시작할 수 있어요.</p>
      </header>

      <section aria-labelledby="random-quiz-options" className="space-y-6 rounded-nl-card border border-nl-border bg-nl-bg p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <Badge tone="accent">랜덤 퀴즈 · 누구나</Badge>
          <p className="text-[20px] leading-[1.5] font-bold">이번 회 {preview.plannedQuestionCount}문제</p>
        </div>

        <fieldset className="space-y-4">
          <legend id="random-quiz-options" className="text-[20px] leading-[1.5] font-bold">어떤 방식으로 답할까요?</legend>
          {unavailableFormats.map((format) => (
            <p key={format.id} className="rounded-nl-button bg-nl-negative-subtle p-4 text-nl-caption text-nl-negative" role="alert">
              {format.label}은 지금 이용할 수 없어요. {format.reason}
            </p>
          ))}
          <div className="grid gap-4 md:grid-cols-2" role="radiogroup" aria-labelledby="random-quiz-options">
            {preview.formats.map((format) => {
              const isSelected = selectedFormat === format.id;
              return (
                <button
                  key={format.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!format.enabled}
                  onClick={() => setSelectedFormat(format.id)}
                  className={cn(
                    "min-h-28 rounded-nl-card border p-6 text-left transition-colors",
                    isSelected ? "border-nl-accent bg-nl-accent-wash" : "border-nl-border bg-nl-bg hover:border-nl-accent",
                    "disabled:cursor-not-allowed disabled:bg-nl-subtle disabled:text-nl-disabled-content",
                  )}
                >
                  <span className={cn("block text-[18px] leading-[1.5] font-bold", isSelected && "text-nl-accent")}>
                    <span aria-hidden>{isSelected ? "◉" : "○"}</span>{" "}
                    {format.id === "choice" ? "OX·객관식" : format.label}
                  </span>
                  <span className="mt-2 block text-nl-caption text-nl-muted">{formatDescription[format.id]}</span>
                  {!format.enabled && format.reason ? <span className="mt-2 block text-nl-micro text-nl-negative">{format.reason}</span> : null}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="h-px bg-nl-border" />

        <div className="space-y-3">
          <h2 className="text-[18px] leading-[1.5] font-bold">서로 다른 기사에서 한 문제씩, 총 {preview.plannedQuestionCount}문제</h2>
          <p className="text-nl-body text-nl-muted">검수를 통과한 전체 뉴스에서 출제해요. 관심 주제는 추천에 참고하며, 다른 주제도 나올 수 있어요.</p>
          <Badge>관심 주제 미설정 · 설정 없이도 이용 가능</Badge>
        </div>

        <p className="rounded-nl-button bg-nl-accent-subtle p-4 text-nl-caption text-nl-accent" role="note">
          모르는 문제는 포기하고 해설을 볼 수 있어요. 제한 시간은 없어요.
        </p>

        {startQuiz.isError ? <p className="text-nl-caption text-nl-negative" role="alert">퀴즈를 시작하지 못했어요. 잠시 후 다시 시도해 주세요.</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            disabled={!canStart || startQuiz.isPending}
            onClick={() => {
              if (!selectedFormat) return;
              startQuiz.mutate(selectedFormat);
            }}
            className="sm:min-w-40"
          >
            {startQuiz.isPending ? "시작하는 중…" : `${preview.plannedQuestionCount}문제 시작하기`}
          </Button>
          <Button variant="secondary" disabled={startQuiz.isPending} onClick={() => router.back()} className="sm:min-w-24">취소</Button>
        </div>
      </section>
    </PageContainer>
  );
}

function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-5 py-10 md:px-8">{children}</div>;
}
