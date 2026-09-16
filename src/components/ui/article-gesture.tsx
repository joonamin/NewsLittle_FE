// lib: 독립 제스처 영역 · 카드와 세로 탐색 (faiKJ), 숏폼 기사 카드 (z6wA0)
import { Check, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useRef, useState } from "react";
import type { PointerEvent, WheelEvent } from "react";

import type { HomeArticleCardViewModel } from "@/features/contracts/view-models";
import { cn } from "@/lib/cn";

export type SaveToTodayButtonProps = {
  saved: boolean;
  onClick: () => void;
};

export function SaveToTodayButton({ saved, onClick }: SaveToTodayButtonProps) {
  const Icon = saved ? Check : Plus;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[52px] w-full items-center justify-center gap-2 rounded-nl-button border px-5 text-nl-body font-bold",
        "shadow-nl-save-button",
        saved
          ? "border-2 border-nl-accent bg-nl-accent-subtle text-nl-accent"
          : "border-nl-accent bg-nl-accent text-nl-on-accent",
      )}
    >
      <Icon width={20} height={20} aria-hidden />
      {saved ? "오늘 목록에 담김" : "오늘 목록에 담기"}
    </button>
  );
}

export type ArticleGestureProps = {
  card: HomeArticleCardViewModel;
  saved: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onReport?: () => void;
};

export function ArticleGesture({
  card,
  saved,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onSave,
  onReport,
}: ArticleGestureProps) {
  const pointerStartY = useRef<number | null>(null);
  const lastWheelAt = useRef(0);
  const [failedImageArticleId, setFailedImageArticleId] = useState<string | null>(null);
  const usesPhoto = card.image !== null && failedImageArticleId !== card.id;

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    pointerStartY.current = event.clientY;
  };

  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    if (pointerStartY.current === null) return;
    const distance = event.clientY - pointerStartY.current;
    pointerStartY.current = null;
    if (distance <= -56 && canGoNext) onNext();
    if (distance >= 56 && canGoPrevious) onPrevious();
  };

  const onWheel = (event: WheelEvent<HTMLElement>) => {
    if (Math.abs(event.deltaY) < 32 || Date.now() - lastWheelAt.current < 350) return;
    if (event.deltaY > 0 && canGoNext) {
      event.preventDefault();
      lastWheelAt.current = Date.now();
      onNext();
    }
    if (event.deltaY < 0 && canGoPrevious) {
      event.preventDefault();
      lastWheelAt.current = Date.now();
      onPrevious();
    }
  };

  return (
    <section
      aria-label="숏폼 뉴스 피드"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onWheel={onWheel}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" && canGoNext) {
          event.preventDefault();
          onNext();
        }
        if (event.key === "ArrowUp" && canGoPrevious) {
          event.preventDefault();
          onPrevious();
        }
        if (event.key === "Enter") {
          event.preventDefault();
          onSave();
        }
      }}
      className="relative isolate flex h-full min-h-0 w-full flex-1 flex-col items-center gap-4 overflow-hidden outline-none"
    >
      {card.image ? (
        <img
          src={card.image.url}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25 [mask-image:radial-gradient(ellipse_72%_78%_at_50%_46%,black_0%,transparent_100%)]"
        />
      ) : null}
      <div className="relative z-10 flex h-full min-h-0 w-full flex-1 items-center gap-5">
        <article
          onDoubleClick={onSave}
          className={cn(
            "relative flex h-full min-h-[680px] min-w-0 flex-1 self-stretch items-center justify-center overflow-hidden rounded-[24px] border p-[10%]",
            usesPhoto
              ? "border-nl-backdrop-card-stroke bg-nl-bg shadow-nl-backdrop-card"
              : "border-nl-border bg-nl-bg",
          )}
        >
          {usesPhoto && card.image ? (
            <>
              <img src={card.image.url} alt={card.image.alt} onError={() => setFailedImageArticleId(card.id)} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-nl-backdrop-tint" aria-hidden />
            </>
          ) : null}
          <div
            className={cn(
              "relative flex h-full w-full max-w-none flex-col gap-4 overflow-y-auto rounded-[20px] p-6",
              usesPhoto
                ? "border-[1.5px] border-nl-backdrop-panel-stroke bg-nl-backdrop-panel-fill shadow-nl-backdrop-panel backdrop-blur-[5px]"
                : "bg-nl-bg",
            )}
          >
            <div className="flex w-full items-center justify-between gap-4">
              <span className={cn("rounded-full px-3 py-1.5 text-nl-micro font-bold", card.image ? "border border-white/30 bg-black/40 text-white backdrop-blur-xl" : "bg-nl-subtle text-nl-text")}>
                {card.category}
              </span>
              {saved ? <span className="rounded-full border border-white/40 bg-nl-positive/80 px-3 py-1.5 text-nl-micro font-bold text-white backdrop-blur-xl">✓ 담긴 기사</span> : null}
            </div>
            <h1 className="text-nl-title leading-[1.375] font-bold tracking-[-0.0175em] text-nl-text">{card.title}</h1>
            {card.bodyText ? <p className="text-[18px] leading-[1.7] font-medium tracking-nl-tight text-nl-text">{card.bodyText}</p> : null}
            {card.showsAiSummary && card.summaryText ? (
              <div className="flex items-center gap-3 rounded-[14px] border border-white/90 bg-linear-to-r from-nl-ai-summary-start to-nl-ai-summary-end p-4 backdrop-blur-[14px]">
                <img src="/images/ai-summary-logo.png" alt="" width={28} height={28} />
                <div className="min-w-0">
                  <p className="text-nl-micro font-bold text-nl-accent">AI 한 줄 요약</p>
                  <p className="text-nl-body leading-[1.5] font-medium text-nl-ai-summary-text">{card.summaryText}</p>
                </div>
              </div>
            ) : null}
            <p className="text-nl-micro text-nl-muted">{card.sourceName} · 원문 게시 {card.publishedLabel}</p>
            <div className="flex items-center gap-4 text-nl-micro">
              {card.originalIsAvailable ? (
                <a className="flex-1 text-nl-accent" href={card.originalUrl} target="_blank" rel="noreferrer">
                  원문 읽기 ↗
                </a>
              ) : <span className="flex-1 text-nl-muted">원문을 제공하지 않아요</span>}
              {onReport ? <button type="button" onClick={onReport} className="text-nl-negative">신고</button> : <span className="text-nl-negative">신고</span>}
            </div>
            <div className="h-px w-full bg-nl-border/55" aria-hidden />
            <SaveToTodayButton saved={saved} onClick={onSave} />
          </div>
        </article>
        <div className="flex w-14 shrink-0 flex-col items-center gap-4">
          <button type="button" aria-label="이전 기사" disabled={!canGoPrevious} onClick={onPrevious} className="flex h-14 w-14 items-center justify-center rounded-full border border-nl-border bg-nl-bg text-nl-text disabled:opacity-40"><ChevronUp width={24} height={24} /></button>
          <button type="button" aria-label="다음 기사" disabled={!canGoNext} onClick={onNext} className="flex h-14 w-14 items-center justify-center rounded-full border border-nl-border bg-nl-bg text-nl-text disabled:opacity-40"><ChevronDown width={24} height={24} /></button>
        </div>
      </div>
      <p className="rounded-full border border-white/80 bg-white/75 px-4 py-2 text-nl-micro text-nl-muted shadow-nl-glass backdrop-blur-xl">
        ↓ 아래로 드래그 · 휠 아래 · ↓ 다음 / ↑ 이전 · Enter로 담기
      </p>
    </section>
  );
}
