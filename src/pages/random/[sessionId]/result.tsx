import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { type ReactNode, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ArticleSourceMeta } from "@/components/attribution/article-source-meta";
import { EvidenceAttribution } from "@/components/attribution/evidence-attribution";
import { AsyncBoundary } from "@/components/ui/async-boundary";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/ui/state-view";
import { quizResultQueryOptions } from "@/features/contracts/query-keys";
import type { QuizRecapItemViewModel } from "@/features/contracts/view-models";
import { useHomeFlow } from "@/features/home/home-flow";

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
      <RandomQuizResultContent sessionId={sessionId} />
    </AsyncBoundary>
  );
}

function RandomQuizResultContent({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { data: result } = useSuspenseQuery(quizResultQueryOptions("random", sessionId));
  const { home, requestArticleSelection } = useHomeFlow();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [savingArticleId, setSavingArticleId] = useState<string | null>(null);
  const [savedArticleIds, setSavedArticleIds] = useState<Record<string, true>>({});

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const isArticleSaved = (articleId: string) =>
    Boolean(savedArticleIds[articleId] || home?.todayList?.items.some((item) => item.articleId === articleId));

  const handleSaveArticle = async (articleId: string) => {
    if (savingArticleId === articleId || isArticleSaved(articleId)) return;
    setSavingArticleId(articleId);
    try {
      const result = await requestArticleSelection(articleId);
      if (result === "added" || result === "already-selected") {
        setSavedArticleIds((current) => ({ ...current, [articleId]: true }));
      }
    } finally {
      setSavingArticleId(null);
    }
  };

  if (result.isServiceEnded) {
    return (
      <Page>
        <div className="flex w-full flex-col gap-6 rounded-nl-card border border-nl-border bg-nl-bg p-8">
          <h1 className="text-[28px] font-bold leading-[1.5] text-nl-text">
            서비스 사유로 퀴즈가 종료되었어요
          </h1>
          <p className="text-nl-body text-nl-muted">
            준비된 문항의 권리 중단 또는 제공사 요청으로 인해 이번 회차를 완료하지 못했습니다.
            채점 분모와 오답 집계에서 제외되었으며 정상 완료로 집계되지 않았습니다.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="l"
              onClick={() => void router.push(`/random?format=${result.format}`)}
            >
              새 회차 시작
            </Button>
            <Button variant="secondary" size="l" onClick={() => void router.push("/")}>
              홈으로
            </Button>
          </div>
        </div>
      </Page>
    );
  }

  const { summary, recapItems } = result;

  return (
    <Page>
      <h1 className="text-[28px] font-bold leading-[1.5] text-nl-text">
        다섯 문제로 만난 오늘의 뉴스
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
            <p className="text-nl-caption text-nl-muted font-normal">정답</p>
          </div>
          <div className="flex flex-col gap-1 rounded-nl-card bg-nl-subtle p-4 text-center">
            <p className="text-[28px] font-bold text-nl-text">{summary.choiceIncorrect}</p>
            <p className="text-nl-caption text-nl-muted font-normal">
              {result.format === "choice" ? "선택형 오답" : "오답"}
            </p>
          </div>
          <div className="flex flex-col gap-1 rounded-nl-card bg-nl-subtle p-4 text-center">
            <p className="text-[28px] font-bold text-nl-text">{summary.givenUp}</p>
            <p className="text-nl-caption text-nl-muted font-normal">포기</p>
          </div>
          <div className="flex flex-col gap-1 rounded-nl-card bg-nl-subtle p-4 text-center">
            <p className="text-[28px] font-bold text-nl-text">{summary.excludedByService}</p>
            <p className="text-nl-caption text-nl-muted font-normal">서비스 제외</p>
          </div>
        </div>

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
              isSaved={item.evidence ? isArticleSaved(item.evidence.id) : false}
              isSaving={item.evidence ? savingArticleId === item.evidence.id : false}
              onToggle={() => toggleExpand(idx)}
              onSaveArticle={() => {
                if (item.evidence) void handleSaveArticle(item.evidence.id);
              }}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="primary"
            size="l"
            onClick={() => void router.push(`/random?format=${result.format}`)}
          >
            새 회차 시작
          </Button>
          <Button variant="secondary" size="l" onClick={() => void router.push("/")}>
            홈으로
          </Button>
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
  isSaved,
  isSaving,
  onToggle,
  onSaveArticle,
}: {
  item: QuizRecapItemViewModel;
  isExpanded: boolean;
  isSaved: boolean;
  isSaving: boolean;
  onToggle: () => void;
  onSaveArticle: () => void;
}) {
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
        className="flex w-full items-center justify-between gap-4 text-left font-bold"
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
          <p className="text-nl-caption text-nl-text">
            내 답 {item.userAnswer ?? "포기"} · 정답 {item.correctAnswer ?? "-"}
          </p>
          {item.explanation ? (
            <p className="text-nl-caption text-nl-muted leading-[1.5]">{item.explanation}</p>
          ) : null}

          {item.evidence && item.evidence.isRestricted ? (
            <EvidenceAttribution
              articleTitle={item.evidence.title}
              sourceName={item.evidence.sourceName}
              publishedLabel={item.evidence.publishedLabel}
              originalUrl={item.evidence.originalIsAvailable ? item.evidence.originalUrl : null}
              summaryUnavailable
            />
          ) : null}
          {item.evidence && !item.evidence.isRestricted ? (
            <article className="space-y-3 rounded-nl-card border border-nl-border bg-nl-accent-wash p-5">
              <p className="text-nl-micro font-bold text-nl-accent">이 문제의 뉴스</p>
              <h3 className="text-[18px] font-bold text-nl-text">{item.evidence.title}</h3>

              {item.evidence.summaryText ? (
                <p className="text-nl-caption text-nl-muted">{item.evidence.summaryText}</p>
              ) : null}

              <ArticleSourceMeta
                sourceName={item.evidence.sourceName}
                publishedLabel={item.evidence.publishedLabel}
                originalUrl={item.evidence.originalIsAvailable ? item.evidence.originalUrl : null}
                showsAiSummary={item.evidence.showsAiSummary}
              />

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Button
                  variant={isSaved ? "default" : "secondary"}
                  size="s"
                  disabled={isSaved || isSaving}
                  onClick={onSaveArticle}
                >
                  {isSaved ? "오늘 목록에 담김" : isSaving ? "담는 중…" : "오늘 목록에 담기"}
                </Button>
              </div>
            </article>
          ) : null}

          <button type="button" className="text-nl-micro text-nl-negative hover:underline">
            판정 오류 신고
          </button>
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
