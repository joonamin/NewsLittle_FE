// lib: 홈 · 오늘 목록 사이드바 (BtNvT), 타임라인_아이템 (diE46), 타임라인 레일 (CfqQX)
import { LockKeyhole, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { HomeViewModel } from "@/features/contracts/view-models";
import { useDebouncedAction } from "@/hooks/use-debounced-action";
import { ApiError } from "@/lib/api-client";

import { Badge } from "./badge";
import { Button } from "./button";
import { Spinner } from "./spinner";

type TodayList = NonNullable<HomeViewModel["todayList"]>;

function formatDateCompact(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

// 세션 안에서만 증가한다 — 같은 날 기본값으로 여러 번 아카이빙해도 제목이
// 겹치지 않게 하는 용도라 페이지를 새로고침하면 1부터 다시 시작해도 된다.
let untitledSequence = 0;

function createUntitledTitle() {
  untitledSequence += 1;
  return `${formatDateCompact(new Date())}_${untitledSequence}`;
}

export type TodayListSidebarProps = {
  isLoggedIn: boolean;
  list: TodayList | null;
  onLogin: () => void;
  onOpenArticle: (url: string) => void;
  onRemoveArticle: (articleId: string) => void;
  onStartQuiz: () => void;
  onArchive: (title: string) => Promise<void>;
};

function TimelineRail({ order, isFirst, isLast, isPreparing }: { order: number; isFirst: boolean; isLast: boolean; isPreparing: boolean }) {
  return (
    <div className="flex w-6 shrink-0 flex-col items-center self-stretch">
      <span className={isFirst ? "h-1.5 w-0.5 bg-transparent" : "h-1.5 w-0.5 bg-nl-border"} />
      <span className={isPreparing ? "flex h-6 w-6 items-center justify-center rounded-full border border-nl-border bg-nl-bg text-[11px] font-bold text-nl-muted" : "flex h-6 w-6 items-center justify-center rounded-full border border-nl-accent bg-nl-accent text-[11px] font-bold text-nl-on-accent"}>{String(order).padStart(2, "0")}</span>
      {!isLast ? <span className="min-h-6 w-0.5 flex-1 bg-nl-border" /> : null}
    </div>
  );
}

export function TodayListSidebar({
  isLoggedIn,
  list,
  onLogin,
  onOpenArticle,
  onRemoveArticle,
  onStartQuiz,
  onArchive,
}: TodayListSidebarProps) {
  const items = list?.items ?? [];
  const readyCount = items.filter((item) => item.quizStatusLabel === "출제 가능").length;
  const preparingCount = items.filter((item) => item.quizStatusLabel === "문항 준비 중").length;

  const [title, setTitle] = useState(createUntitledTitle);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const { run: runArchive, pending: isArchiving } = useDebouncedAction();
  const { run: runRemove } = useDebouncedAction();

  const canArchive = title.trim().length > 0 && items.length > 0 && !isArchiving;

  const handleArchive = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || items.length === 0 || isArchiving) return;
    setArchiveError(null);
    void runArchive(async () => {
      try {
        await onArchive(trimmedTitle);
        setTitle(createUntitledTitle());
      } catch (error) {
        setArchiveError(
          error instanceof ApiError ? error.message : "아카이빙에 실패했어요. 다시 시도해 주세요.",
        );
      }
    });
  };

  return (
    <aside aria-label="오늘 목록" className="hidden h-full min-h-0 w-[336px] shrink-0 flex-col overflow-hidden border-l border-nl-border bg-nl-bg md:flex">
      <div className="flex shrink-0 flex-col gap-3 border-b border-nl-border px-6 pt-6 pb-4">
        {isLoggedIn ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="목록 제목을 입력하세요"
                aria-label="오늘 목록 제목"
                maxLength={200}
                suppressHydrationWarning
                className="min-w-0 flex-1 rounded-nl-button border border-nl-border bg-nl-bg px-3 py-1.5 text-[20px] leading-[1.5] font-bold text-nl-text outline-none focus:border-nl-accent"
              />
              <button
                type="button"
                aria-busy={isArchiving}
                disabled={!canArchive}
                onClick={() => void handleArchive()}
                className="relative flex shrink-0 items-center justify-center rounded-nl-button border border-nl-accent bg-nl-accent px-3 py-2 text-nl-caption font-bold text-nl-on-accent transition-colors hover:bg-nl-accent/90 disabled:opacity-40 disabled:hover:bg-nl-accent"
              >
                {isArchiving ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Spinner className="h-4 w-4 text-nl-on-accent" />
                  </span>
                ) : null}
                <span className={isArchiving ? "invisible" : undefined}>아카이빙</span>
              </button>
            </div>
            <p className="text-nl-caption text-nl-muted">{list?.dateLabel} · 선택한 순서대로</p>
            {archiveError ? <p className="text-nl-micro text-nl-negative">{archiveError}</p> : null}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] leading-[1.5] font-bold text-nl-text">오늘 목록</h2>
            <p className="text-nl-caption text-nl-muted">로그인하면 담은 기사가 여기에 쌓여요</p>
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        {isLoggedIn ? (
          items.length ? (
            <div className="flex flex-col">
              {items.map((item, index) => {
                const isPreparing = item.quizStatusLabel === "문항 준비 중";
                return (
                  <div key={item.articleId} className="flex min-h-[86px] gap-3">
                    <TimelineRail order={index + 1} isFirst={index === 0} isLast={index === items.length - 1} isPreparing={isPreparing} />
                    <div className="min-w-0 flex-1 pt-[7px] pb-[22px]">
                      <div className="flex items-center gap-2">
                        <a href={item.originalUrl} target="_blank" rel="noreferrer" onClick={(event) => { event.preventDefault(); onOpenArticle(item.originalUrl); }} className="min-w-0 flex-1 text-nl-caption leading-[1.5] text-nl-accent hover:underline">{item.title}</a>
                        <button type="button" aria-label={`${item.title} 삭제`} onClick={() => void runRemove(() => onRemoveArticle(item.articleId))} className="rounded-nl-button text-[20px] leading-[1.5] text-nl-muted transition-colors hover:bg-nl-subtle hover:text-nl-text"><X width={20} height={20} /></button>
                      </div>
                      <Badge tone={isPreparing ? "default" : "positive"} className="mt-1.5">{item.quizStatusLabel}</Badge>
                    </div>
                  </div>
                );
              })}
              <div className="flex gap-3">
                <div className="flex w-6 justify-center"><span className="mt-1 h-3 w-3 rounded-full border border-nl-border bg-nl-bg" /></div>
                <p className="pt-2 text-nl-micro text-nl-muted">기사를 담으면 여기에 이어서 쌓여요</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 pt-1">
              <div className="mt-1 flex w-6 justify-center"><span className="h-3 w-3 rounded-full border border-nl-border bg-nl-bg" /></div>
              <div className="space-y-1.5 pt-0.5">
                <p className="text-nl-caption font-bold text-nl-text">아직 담은 기사가 없어요</p>
                <p className="text-nl-micro text-nl-muted">기사에서 ‘오늘 목록에 담기’를 누르면 담은 순서대로 여기에 쌓여요.</p>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-2.5 pt-1">
            <LockKeyhole width={24} height={24} className="text-nl-accent" aria-hidden />
            <p className="text-nl-body font-bold text-nl-text">로그인하면 오늘 목록을 쓸 수 있어요</p>
            <p className="text-[13px] leading-[1.6] text-nl-muted">담은 기사는 계정에 저장돼서 다시 들어와도 그대로 이어져요. 오늘 담은 기사로 숏폼 퀴즈도 풀 수 있어요.</p>
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col gap-3 border-t border-nl-border bg-nl-bg p-6 shadow-[0_-6px_16px_rgb(27_29_34_/_0.08)]">
        {isLoggedIn ? (
          <>
            <p className="text-nl-micro text-nl-muted">{items.length ? `출제 가능 ${readyCount}개${preparingCount ? ` · 준비 중 ${preparingCount}개` : ""}` : "담은 기사 0개 · 1개 이상 담으면 퀴즈를 시작할 수 있어요"}</p>
            <Button className="w-full" disabled={items.length === 0} onClick={onStartQuiz}>숏폼 퀴즈 시작</Button>
            <p className="text-nl-micro text-nl-muted">아카이빙 하기 전까지 목록은 사라지지 않아요.</p>
          </>
        ) : (
          <>
            <Button className="w-full" onClick={onLogin}>로그인하고 기사 담기</Button>
            <p className="text-nl-micro text-nl-muted">로그인 없이도 기사는 읽을 수 있어요. 담기와 퀴즈만 로그인이 필요해요.</p>
          </>
        )}
        <div className="flex items-center justify-between border-t border-nl-border pt-3 text-[11px] text-nl-muted">
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
      </div>
    </aside>
  );
}
