import { useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

import { AsyncBoundary } from "@/components/ui/async-boundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StateNotice } from "@/components/ui/state-notice";
import { ErrorState, LoadingState } from "@/components/ui/state-view";
import type { QuizFormat } from "@/features/contracts/api-models";
import { quizPreviewQueryOptions } from "@/features/contracts/query-keys";
import { screenApi } from "@/features/contracts/screen-api";
import { cn } from "@/lib/cn";

const formatDescription: Record<QuizFormat, string> = {
  choice: "주어진 보기에서 답을 골라요.",
  written: "자신의 말로 답하고 힌트를 받아요.",
};

export default function QuizStartPage() {
  const router = useRouter();

  return (
    <AsyncBoundary
      pending={
        <PageContainer>
          <LoadingState
            title="숏폼 퀴즈를 준비하고 있어요"
            description="오늘 목록의 출제 가능 여부를 확인 중이에요."
          />
        </PageContainer>
      }
      rejected={({ reset }) => (
        <PageContainer>
          <ErrorState
            title="퀴즈 정보를 불러오지 못했어요"
            description="잠시 후 다시 시도해 주세요. 문제가 계속되면 홈에서 오늘 목록을 확인할 수 있어요."
            onRetry={reset}
            onGoHome={() => void router.push("/")}
          />
        </PageContainer>
      )}
    >
      <QuizStartContent />
    </AsyncBoundary>
  );
}

function QuizStartContent() {
  const router = useRouter();
  const { data: preview } = useSuspenseQuery(quizPreviewQueryOptions("shortform"));
  const [selectedFormat, setSelectedFormat] = useState<QuizFormat>(preview.defaultFormatId);
  const startQuiz = useMutation({
    mutationFn: (format: QuizFormat) => screenApi.createSession("shortform", { format }),
    onSuccess: (session) => {
      void router.push(`/quiz/${session.id}`);
    },
  });

  const selectedOption = preview.formats.find((format) => format.id === selectedFormat);
  const includedCandidates = preview.candidates.filter((candidate) => candidate.included);
  const excludedCandidates = preview.candidates.filter((candidate) => !candidate.included);
  const unavailableFormats = preview.formats.filter((format) => !format.enabled && format.reason);
  const canStart = Boolean(selectedOption?.enabled) && preview.plannedQuestionCount > 0;

  return (
    <PageContainer>
      <header className="space-y-2">
        <h1 className="text-nl-title-xl font-bold tracking-nl-tight">
          내가 고른 뉴스, 얼마나 기억할까요?
        </h1>
        <p className="text-nl-body text-nl-muted">
          오늘 목록에서 출제 가능한 기사만 문제로 만나요.
        </p>
      </header>

      <section className="space-y-4 rounded-nl-card border border-nl-border bg-nl-bg p-8">
        <div className="flex flex-wrap items-center gap-4">
          <Badge tone="accent">숏폼 퀴즈 · 회원</Badge>
          <p className="text-[20px] leading-[1.5] font-bold">이번 회 {preview.plannedQuestionCount}문제</p>
        </div>

        <fieldset className="space-y-4">
          <legend className="text-[20px] leading-[1.5] font-bold">어떤 방식으로 답할까요?</legend>
          <div className="grid gap-4 md:grid-cols-2" role="radiogroup" aria-label="퀴즈 형식">
            {preview.formats.map((format) => {
              const isSelected = selectedFormat === format.id;
              const label = format.id === "choice" ? "OX·객관식" : format.label;

              return (
                <button
                  key={format.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!format.enabled}
                  onClick={() => setSelectedFormat(format.id)}
                  className="text-left disabled:cursor-not-allowed"
                >
                  <StateNotice
                    title={`${isSelected ? "◉" : "○"} ${label}`}
                    description={format.enabled ? formatDescription[format.id] : format.reason ?? "현재 이용할 수 없어요."}
                    tone={isSelected ? "accent" : "plain"}
                    className={cn(
                      "max-w-none transition-colors",
                      isSelected && "border-nl-accent bg-nl-accent-wash",
                      !format.enabled && "bg-nl-subtle text-nl-disabled-content",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="h-px bg-nl-border" />

        <section aria-labelledby="quiz-candidates" className="space-y-3">
          <h2 id="quiz-candidates" className="text-[18px] leading-[1.5] font-bold">
            이번 회 출제 대상
          </h2>
          {includedCandidates.length > 0 ? (
            <ol className="space-y-2 text-nl-caption">
              {includedCandidates.slice(0, 10).map((candidate, index) => (
                <li key={candidate.title}>
                  {index + 1}. {candidate.title}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-nl-caption text-nl-muted">
              출제 가능한 기사가 없어요. 홈에서 기사를 오늘 목록에 담아 주세요.
            </p>
          )}

          {excludedCandidates.length > 0 ? (
            <div className="rounded-nl-button bg-nl-accent-subtle p-4 text-nl-caption text-nl-accent" role="status">
              제외 {excludedCandidates.length}개 · {excludedCandidates.map((candidate) => `${candidate.title} — ${candidate.exclusionReason}`).join(", ")}
            </div>
          ) : null}
        </section>

        <p className="text-nl-micro text-nl-muted">
          기사당 1문제 · 남은 대상 {preview.remainingCandidateCount}개 · 최대 10문제씩 출제
        </p>

        {unavailableFormats.map((format) => (
          <p key={format.id} className="text-nl-caption text-nl-negative" role="alert">
            {format.label}은 지금 이용할 수 없어요. {format.reason}
          </p>
        ))}
        {startQuiz.isError ? (
          <p className="text-nl-caption text-nl-negative" role="alert">
            퀴즈를 시작하지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button
            disabled={!canStart || startQuiz.isPending}
            onClick={() => startQuiz.mutate(selectedFormat)}
          >
            {startQuiz.isPending ? "시작하는 중…" : `${preview.plannedQuestionCount}문제 시작하기`}
          </Button>
          <Button variant="secondary" disabled={startQuiz.isPending} onClick={() => void router.push("/")}>
            취소
          </Button>
        </div>
      </section>
    </PageContainer>
  );
}

function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-5 py-10">{children}</div>;
}
