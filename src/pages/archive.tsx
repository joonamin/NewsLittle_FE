import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ArchiveGroup } from "@/components/attribution/archive-group";
import { LoginPromptModal } from "@/components/layout/login-prompt-modal";
import { ErrorState, LoadingState } from "@/components/ui/state-view";
import { screenApi } from "@/features/contracts/screen-api";
import type { ArchiveViewModel } from "@/features/contracts/view-models";

type LoadState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "guest" }
  | { kind: "ready"; archive: ArchiveViewModel };

export default function ArchivePage() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const fetchArchive = async (): Promise<LoadState> => {
    let isGuest = false;
    try {
      const navigation = await screenApi.navigation();
      isGuest = navigation.account.status === "guest";
    } catch {
      // 내비게이션 조회가 실패하면 AppShell과 같은 원칙으로 게스트 취급한다(회원 전용
      // 화면을 안전한 기본값으로 보호한다).
      isGuest = true;
    }

    if (isGuest) {
      return { kind: "guest" };
    }

    try {
      const archive = await screenApi.archive();
      return { kind: "ready", archive };
    } catch {
      return { kind: "error" };
    }
  };

  useEffect(() => {
    let cancelled = false;
    void fetchArchive().then((next) => {
      if (cancelled) return;
      setState(next);
      if (next.kind === "ready") {
        setExpandedDates(new Set(next.archive.groups.slice(0, 1).map((group) => group.date)));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const retry = () => {
    setState({ kind: "loading" });
    void fetchArchive().then((next) => {
      setState(next);
      if (next.kind === "ready") {
        setExpandedDates(new Set(next.archive.groups.slice(0, 1).map((group) => group.date)));
      }
    });
  };

  const toggleGroup = (date: string) => {
    setExpandedDates((previous) => {
      const next = new Set(previous);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const deleteEntry = async (entryId: string) => {
    try {
      await screenApi.deleteArchiveEntry(entryId);
      setDeletedIds((previous) => new Set(previous).add(entryId));
    } catch {
      // 삭제 요청이 실패하면 항목을 그대로 두어, 버튼을 다시 눌러 재시도할 수 있게 한다.
    }
  };

  const groups =
    state.kind === "ready"
      ? state.archive.groups
          .map((group) => ({
            ...group,
            items: group.items.filter((item) => !deletedIds.has(item.id)),
          }))
          .filter((group) => group.items.length > 0)
      : [];

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-5 py-9 md:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.375] font-bold tracking-nl-tight text-nl-text">아카이브</h1>
        <p className="text-nl-body text-nl-muted">고른 날짜별로, 다시 읽고 싶은 기사를 찾아보세요.</p>
      </div>

      {state.kind === "loading" ? <LoadingState title="보관한 기사를 불러오고 있어요" /> : null}

      {state.kind === "error" ? (
        <ErrorState
          title="아카이브를 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          onRetry={retry}
          onGoHome={() => void router.push("/")}
        />
      ) : null}

      {state.kind === "guest" ? (
        <LoginPromptModal
          open
          onClose={() => router.back()}
          onSuccess={retry}
          description="아카이브는 회원만 이용할 수 있어요."
        />
      ) : null}

      {state.kind === "ready" ? (
        <>
          <div className="rounded-nl-button bg-nl-accent-subtle p-4">
            <p className="text-nl-caption text-nl-accent">
              제목과 원문 링크만 보관해요. 기사 본문·요약은 저장하지 않으며, 다시 푸는 퀴즈는 제공하지 않아요.
            </p>
          </div>

          {groups.length === 0 ? (
            <div className="rounded-nl-card border border-nl-border bg-nl-bg p-8 text-center">
              <p className="text-[20px] leading-[1.5] font-bold text-nl-text">아직 보관한 기사가 없어요</p>
              <p className="mt-2 text-nl-caption text-nl-muted">
                다음 날 다시 찾아오면 어제 목록이 자동으로 보관돼요.
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.date}
                className="flex flex-col gap-4 rounded-nl-card border border-nl-border bg-nl-bg p-6"
              >
                <ArchiveGroup
                  dateLabel={`${group.dateLabel} 선택 · ${group.items.length}개`}
                  items={group.items}
                  expanded={expandedDates.has(group.date)}
                  onToggleExpanded={() => toggleGroup(group.date)}
                  onDeleteItem={(id) => void deleteEntry(id)}
                />
              </div>
            ))
          )}
        </>
      ) : null}
    </div>
  );
}
