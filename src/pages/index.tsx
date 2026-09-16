import { useState } from "react";
import { useRouter } from "next/router";

import { ArticleGesture } from "@/components/ui/article-gesture";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ErrorState, LoadingState } from "@/components/ui/state-view";
import { TodayListSidebar } from "@/components/ui/today-list-sidebar";
import { useHomeFlow } from "@/features/home/home-flow";

export default function HomePage() {
  const router = useRouter();
  const {
    home,
    requestLogin,
    requestArticleSelection,
    removeArticle,
    resolvePreviousLists,
    refresh,
    status,
  } = useHomeFlow();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (status === "loading" && !home) {
    return (
      <div className="p-6 md:p-12">
        <LoadingState title="뉴스를 불러오는 중이에요" />
      </div>
    );
  }

  if (status === "error" || !home) {
    return (
      <div className="p-6 md:p-12">
        <ErrorState
          title="뉴스를 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          onRetry={() => void refresh()}
          onGoHome={() => void router.replace("/")}
        />
      </div>
    );
  }

  const cardIndex = Math.min(currentIndex, Math.max(home.feed.cards.length - 1, 0));
  const card = home.feed.cards[cardIndex];
  const isSaved = card
    ? home.todayList?.items.some((item) => item.articleId === card.id) ?? false
    : false;
  const pendingPreviousArticleCount = home.pendingPreviousLists.reduce(
    (count, list) => count + list.items.length,
    0,
  );

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-nl-subtle">
      <main className="flex min-w-0 flex-1 flex-col p-6 md:px-12">
        {card ? (
          <ArticleGesture
            card={card}
            saved={isSaved}
            canGoPrevious={cardIndex > 0}
            canGoNext={cardIndex < home.feed.cards.length - 1}
            onPrevious={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
            onNext={() =>
              setCurrentIndex((index) => Math.min(index + 1, home.feed.cards.length - 1))
            }
            onSave={() => void requestArticleSelection(card.id)}
          />
        ) : (
          <LoadingState title="표시할 뉴스가 없어요" />
        )}
      </main>
      <TodayListSidebar
        isLoggedIn={home.viewer.isMember}
        list={home.todayList}
        onLogin={requestLogin}
        onOpenArticle={(url) => window.open(url, "_blank", "noopener,noreferrer")}
        onRemoveArticle={(articleId) => void removeArticle(articleId)}
        onStartQuiz={() => void router.push("/quiz")}
      />
      <Modal
        open={home.needsPreviousListDecision}
        onClose={() => undefined}
        title="이전 목록을 먼저 처리해 주세요"
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button variant="secondary" onClick={() => void resolvePreviousLists("discard")}>
              전체 버리기
            </Button>
            <Button onClick={() => void resolvePreviousLists("archive")}>전체 보관하기</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-nl-body text-nl-muted">
            이전 날짜에 담은 기사 {pendingPreviousArticleCount}개가 있어요. 처리 전에는 홈을 이용할 수 없어요.
          </p>
          <p className="text-nl-caption text-nl-muted">
            보관하면 선택 날짜별 아카이브에 기사 제목과 원문 링크만 저장돼요. 본문과 AI 요약은 보관하지 않아요.
          </p>
          <div className="max-h-56 space-y-4 overflow-y-auto border-y border-nl-border py-4">
            {home.pendingPreviousLists.map((list) => (
              <section key={list.dateLabel} aria-label={`${list.dateLabel} 이전 목록`}>
                <h2 className="text-nl-caption font-bold text-nl-text">{list.dateLabel}</h2>
                <ul className="mt-2 space-y-1.5">
                  {list.items.map((item) => (
                    <li key={item.articleId} className="text-nl-caption text-nl-muted">
                      {item.title}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
