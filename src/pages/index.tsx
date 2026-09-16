import { useState } from "react";
import { useRouter } from "next/router";

import { ArticleGesture } from "@/components/ui/article-gesture";
import { ErrorState, LoadingState } from "@/components/ui/state-view";
import { TodayListSidebar } from "@/components/ui/today-list-sidebar";
import { useHomeFlow } from "@/features/home/home-flow";

export default function HomePage() {
  const router = useRouter();
  const { home, requestLogin, requestArticleSelection, removeArticle, refresh, status } =
    useHomeFlow();
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
    </div>
  );
}
