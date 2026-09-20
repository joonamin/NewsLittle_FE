import { useCallback, useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";

import { ArticleGesture } from "@/components/ui/article-gesture";
import { ReportDialog } from "@/components/reports/report-dialog";
import { AsyncBoundary } from "@/components/ui/async-boundary";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { StateNotice } from "@/components/ui/state-notice";
import { ErrorState, LoadingState } from "@/components/ui/state-view";
import { TodayListSidebar } from "@/components/ui/today-list-sidebar";
import { feedInfiniteQueryOptions, homeQueryOptions } from "@/features/contracts/query-keys";
import { screenApi } from "@/features/contracts/screen-api";
import { dehydrateScreenQueries } from "@/features/contracts/server-prefetch";
import { useHomeFlow } from "@/features/home/home-flow";

export default function HomePage() {
  const router = useRouter();

  return (
    <AsyncBoundary
      pending={
        <div className="p-6 md:p-12">
          <LoadingState title="뉴스를 불러오는 중이에요" />
        </div>
      }
      rejected={({ reset }) => (
        <div className="p-6 md:p-12">
          <ErrorState
            title="뉴스를 불러오지 못했어요"
            description="잠시 후 다시 시도해 주세요."
            onRetry={reset}
            onGoHome={() => void router.replace("/")}
          />
        </div>
      )}
    >
      <HomeContent />
    </AsyncBoundary>
  );
}

function HomeContent() {
  const router = useRouter();
  const { data: home } = useSuspenseQuery(homeQueryOptions);
  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(feedInfiniteQueryOptions(home.feed));

  const {
    requestLogin,
    requestArticleSelection,
    removeArticle,
    resolvePreviousLists,
    previousListDecision,
    previousListError,
  } = useHomeFlow();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reportArticleId, setReportArticleId] = useState<string | null>(null);

  const allCards = useMemo(
    () => feedData?.pages.flatMap((page) => page.cards) ?? home.feed.cards,
    [feedData, home.feed.cards],
  );

  const cardIndex = Math.min(currentIndex, Math.max(allCards.length - 1, 0));
  const card = allCards[cardIndex];
  const isSaved = card ? home.todayList?.items.some((item) => item.articleId === card.id) ?? false : false;
  const pendingPreviousArticleCount = home.pendingPreviousLists.reduce(
    (count, list) => count + list.items.length,
    0,
  );

  const canGoPrevious = cardIndex > 0;
  const canGoNext = cardIndex < allCards.length - 1 || Boolean(hasNextPage);

  const handleNext = useCallback(async () => {
    if (cardIndex < allCards.length - 1) {
      setCurrentIndex((index) => index + 1);
      // UX 최적화: 마지막 카드에 가까워지면 백그라운드에서 다음 커서 데이터 미리 요청
      if (cardIndex + 1 >= allCards.length - 1 && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
      return;
    }

    if (hasNextPage && !isFetchingNextPage) {
      const result = await fetchNextPage();
      const updatedCards = result.data?.pages.flatMap((page) => page.cards) ?? [];
      if (updatedCards.length > allCards.length) {
        setCurrentIndex((index) => index + 1);
      }
    }
  }, [allCards.length, cardIndex, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  return (
    <>
      <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-nl-subtle">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col p-6 md:px-12">
          {card ? (
            <ArticleGesture
              card={card}
              saved={isSaved}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              isLoadingNext={isFetchingNextPage && cardIndex === allCards.length - 1}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onToggleSave={() => {
                if (isSaved) {
                  void removeArticle(card.id);
                  return;
                }
                void requestArticleSelection(card.id);
              }}
              onReport={() => setReportArticleId(card.id)}
            />
          ) : <LoadingState title="표시할 뉴스가 없어요" />}
          <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-nl-muted md:hidden">
            <Link href="/privacy" className="hover:text-nl-text underline underline-offset-2">
              개인정보 처리방침
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-nl-text underline underline-offset-2">
              서비스 이용약관
            </Link>
            <span>·</span>
            <span>사이드 프로젝트</span>
          </div>
        </main>
        <TodayListSidebar
          isLoggedIn={home.viewer.isMember}
          list={home.todayList}
          onLogin={requestLogin}
          onOpenArticle={(url) => window.open(url, "_blank", "noopener,noreferrer")}
          onRemoveArticle={(articleId) => void removeArticle(articleId)}
          onStartQuiz={() => void router.push("/quiz")}
        />
      </div>
      {reportArticleId ? (
        <ReportDialog
          open
          target={{
            surface: "HOME_CARD",
            articleId: reportArticleId,
            articleTitle: allCards.find((item) => item.id === reportArticleId)?.title ?? "뉴스 기사",
          }}
          onClose={() => setReportArticleId(null)}
        />
      ) : null}
      <Modal
        open={home.needsPreviousListDecision}
        onClose={() => undefined}
        title="이전 목록을 먼저 처리해 주세요"
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button variant="secondary" disabled={previousListDecision !== null} onClick={() => void resolvePreviousLists("discard")}>전체 버리기</Button>
            <Button disabled={previousListDecision !== null} onClick={() => void resolvePreviousLists("archive")}>
              {previousListDecision === "archive" ? <Spinner className="text-nl-on-accent" /> : null}
              전체 보관하기
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-nl-body text-nl-muted">이전 날짜에 담은 기사 {pendingPreviousArticleCount}개가 있어요. 처리 전에는 홈을 이용할 수 없어요.</p>
          <p className="text-nl-caption text-nl-muted">보관하면 선택 날짜별 아카이브에 기사 제목과 원문 링크만 저장돼요. 본문과 AI 요약은 보관하지 않아요.</p>
          <div className="max-h-56 space-y-4 overflow-y-auto border-y border-nl-border py-4">
            {home.pendingPreviousLists.map((list) => (
              <section key={list.dateLabel} aria-label={`${list.dateLabel} 이전 목록`}>
                <h2 className="text-nl-caption font-bold text-nl-text">{list.dateLabel}</h2>
                <ul className="mt-2 space-y-1.5">
                  {list.items.map((item) => <li key={item.articleId} className="text-nl-caption text-nl-muted">{item.title}</li>)}
                </ul>
              </section>
            ))}
          </div>
          {previousListError ? <StateNotice title="이전 목록을 처리하지 못했어요" description="목록은 그대로 유지돼요. 다시 시도해 주세요." tone="accent" /> : null}
        </div>
      </Modal>
    </>
  );
}

/** 홈은 뷰어·오늘 목록이 섞인 사용자별 화면이라 요청마다 서버에서 채운다. */
export const getServerSideProps: GetServerSideProps = async ({ req }) => ({
  props: await dehydrateScreenQueries(req, (queryClient, init) =>
    queryClient.prefetchQuery({ ...homeQueryOptions, queryFn: () => screenApi.home(init) }),
  ),
});
