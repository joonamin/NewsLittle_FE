import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { ArchiveGroup } from "@/components/attribution/archive-group";
import { AsyncBoundary } from "@/components/ui/async-boundary";
import { ErrorState, LoadingState } from "@/components/ui/state-view";
import { archiveQueryOptions, navigationQueryOptions } from "@/features/contracts/query-keys";
import { screenApi } from "@/features/contracts/screen-api";
import { dehydrateScreenQueries } from "@/features/contracts/server-prefetch";
import type { ArchiveViewModel } from "@/features/contracts/view-models";
import { useHomeFlow } from "@/features/home/home-flow";

export default function ArchivePage() {
  const router = useRouter();
  const { loginOpen, requestLogin } = useHomeFlow();
  const navigationQuery = useQuery(navigationQueryOptions);
  // navigationQueryOptions의 placeholderData는 로딩 중 기본값으로 "guest"를 쓰므로,
  // 실제 응답이 오기 전까지는 회원인지 게스트인지 아직 판단할 수 없다.
  const isNavigationSettled = !navigationQuery.isPending && !navigationQuery.isPlaceholderData;
  const isGuest = isNavigationSettled && navigationQuery.data?.account.status === "guest";
  const requestedLoginRef = useRef(false);
  const wasLoginOpenRef = useRef(false);

  // 비로그인 진입: 로그인 모달(SCR-08)을 자동으로 띄운다(FR-11).
  useEffect(() => {
    if (isGuest && !requestedLoginRef.current) {
      requestedLoginRef.current = true;
      requestLogin();
    }
  }, [isGuest, requestLogin]);

  // 로그인 없이 모달을 닫으면(취소) 이전 화면으로 돌아간다(FR-16).
  useEffect(() => {
    if (wasLoginOpenRef.current && !loginOpen && isGuest) {
      router.back();
    }
    wasLoginOpenRef.current = loginOpen;
  }, [loginOpen, isGuest, router]);

  if (!isNavigationSettled) {
    return (
      <Page>
        <LoadingState title="보관한 기사를 불러오고 있어요" />
      </Page>
    );
  }

  if (isGuest) {
    return (
      <Page>
        <ErrorState
          title="로그인이 필요해요"
          description="아카이브는 회원만 이용할 수 있어요."
          retryLabel="로그인"
          onRetry={requestLogin}
          onGoHome={() => void router.push("/")}
        />
      </Page>
    );
  }

  return (
    <AsyncBoundary
      pending={
        <Page>
          <LoadingState title="보관한 기사를 불러오고 있어요" />
        </Page>
      }
      rejected={({ reset }) => (
        <Page>
          <ErrorState
            title="아카이브를 불러오지 못했어요"
            description="잠시 후 다시 시도해 주세요."
            onRetry={reset}
            onGoHome={() => void router.push("/")}
          />
        </Page>
      )}
    >
      <ArchiveContent />
    </AsyncBoundary>
  );
}

function ArchiveContent() {
  const queryClient = useQueryClient();
  const { data: archive } = useSuspenseQuery(archiveQueryOptions);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(
    () => new Set(archive.groups.slice(0, 1).map((group) => group.id)),
  );

  const deleteEntry = useMutation({
    mutationFn: (entryId: string) => screenApi.deleteArchiveEntry(entryId),
    onSuccess: (_result, entryId) => {
      queryClient.setQueryData(archiveQueryOptions.queryKey, (previous?: ArchiveViewModel) =>
        previous && {
          groups: previous.groups
            .map((group) => ({ ...group, items: group.items.filter((item) => item.id !== entryId) }))
            .filter((group) => group.items.length > 0),
        },
      );
    },
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroupIds((previous) => {
      const next = new Set(previous);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  return (
    <Page>
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.375] font-bold tracking-nl-tight text-nl-text">아카이브</h1>
        <p className="text-nl-body text-nl-muted">고른 날짜별로, 다시 읽고 싶은 기사를 찾아보세요.</p>
      </div>

      <div className="rounded-nl-button bg-nl-accent-subtle p-4">
        <p className="text-nl-caption text-nl-accent">
          제목과 원문 링크만 보관해요. 기사 본문·요약은 저장하지 않으며, 다시 푸는 퀴즈는 제공하지 않아요.
        </p>
      </div>

      {archive.groups.length === 0 ? (
        <div className="rounded-nl-card border border-nl-border bg-nl-bg p-8 text-center">
          <p className="text-[20px] leading-[1.5] font-bold text-nl-text">아직 보관한 기사가 없어요</p>
          <p className="mt-2 text-nl-caption text-nl-muted">
            다음 날 다시 찾아오면 어제 목록이 자동으로 보관돼요.
          </p>
        </div>
      ) : (
        archive.groups.map((group) => (
          <div
            key={group.id}
            className="flex flex-col gap-4 rounded-nl-card border border-nl-border bg-nl-bg p-6"
          >
            <ArchiveGroup
              dateLabel={`${group.title ? `${group.title} · ` : ""}${group.dateLabel} 선택 · ${group.items.length}개`}
              items={group.items}
              expanded={expandedGroupIds.has(group.id)}
              onToggleExpanded={() => toggleGroup(group.id)}
              onDeleteItem={(id) => deleteEntry.mutate(id)}
            />
          </div>
        ))
      )}
    </Page>
  );
}

function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-5 py-9 md:px-8">{children}</div>;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => ({
  props: await dehydrateScreenQueries(req, (queryClient, init) =>
    queryClient.prefetchQuery({ ...archiveQueryOptions, queryFn: () => screenApi.archive(init) }),
  ),
});
