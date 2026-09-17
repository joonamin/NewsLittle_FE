// lib: 홈 · 오늘 목록 사이드바 (BtNvT), 타임라인_아이템 (diE46), 타임라인 레일 (CfqQX)
import { LockKeyhole, X } from "lucide-react";

import type { HomeViewModel } from "@/features/contracts/view-models";

import { Badge } from "./badge";
import { Button } from "./button";

type TodayList = NonNullable<HomeViewModel["todayList"]>;

export type TodayListSidebarProps = {
  isLoggedIn: boolean;
  list: TodayList | null;
  onLogin: () => void;
  onOpenArticle: (url: string) => void;
  onRemoveArticle: (articleId: string) => void;
  onStartQuiz: () => void;
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
}: TodayListSidebarProps) {
  const items = list?.items ?? [];
  const readyCount = items.filter((item) => item.quizStatusLabel === "출제 가능").length;
  const preparingCount = items.filter((item) => item.quizStatusLabel === "문항 준비 중").length;

  return (
    <aside aria-label="오늘 목록" className="hidden h-full min-h-0 w-[336px] shrink-0 flex-col overflow-hidden border-l border-nl-border bg-nl-bg md:flex">
      <div className="flex shrink-0 flex-col gap-1 border-b border-nl-border px-6 pt-6 pb-4">
        <h2 className="text-[20px] leading-[1.5] font-bold text-nl-text">오늘 목록 {isLoggedIn ? ` ${items.length}` : ""}</h2>
        <p className="text-nl-caption text-nl-muted">{isLoggedIn ? `${list?.dateLabel} · 선택한 순서대로` : "로그인하면 담은 기사가 여기에 쌓여요"}</p>
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
                        <a href={item.originalUrl} target="_blank" rel="noreferrer" onClick={(event) => { event.preventDefault(); onOpenArticle(item.originalUrl); }} className="min-w-0 flex-1 text-nl-caption leading-[1.5] text-nl-accent">{item.title}</a>
                        <button type="button" aria-label={`${item.title} 삭제`} onClick={() => onRemoveArticle(item.articleId)} className="text-[20px] leading-[1.5] text-nl-muted"><X width={20} height={20} /></button>
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
            <p className="text-nl-micro text-nl-muted">기사 전환과 무관하게 유지돼요. 퀴즈를 마쳐도 목록은 사라지지 않아요.</p>
          </>
        ) : (
          <>
            <Button className="w-full" onClick={onLogin}>로그인하고 기사 담기</Button>
            <p className="text-nl-micro text-nl-muted">로그인 없이도 기사는 읽을 수 있어요. 담기와 퀴즈만 로그인이 필요해요.</p>
          </>
        )}
      </div>
    </aside>
  );
}
