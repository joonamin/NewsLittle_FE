import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { AsyncBoundary } from "@/components/ui/async-boundary";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { GoogleLoginButton } from "@/components/ui/google-login-button";
import { Modal } from "@/components/ui/modal";
import { StateNotice } from "@/components/ui/state-notice";
import { ErrorState, LoadingState } from "@/components/ui/state-view";
import type { DeletionRequestKind, TopicCode } from "@/features/contracts/api-models";
import { settingsQueryOptions } from "@/features/contracts/query-keys";
import { screenApi } from "@/features/contracts/screen-api";
import { dehydrateScreenQueries } from "@/features/contracts/server-prefetch";
import {
  withDeletionRequest,
  withUpdatedInterests,
  type SettingsDeletionViewModel,
} from "@/features/contracts/view-models";
import { useHomeFlow } from "@/features/home/home-flow";
import { getGuestTopics, setGuestTopics } from "@/lib/guest-topics";

/** 탈퇴 완료 안내를 보여 준 뒤 홈으로 옮겨 가기까지의 시간. */
const ACCOUNT_DELETED_REDIRECT_MS = 2_000;

export default function SettingsPage() {
  const router = useRouter();

  return (
    <AsyncBoundary
      pending={
        <Page>
          <LoadingState title="설정을 불러오고 있어요" />
        </Page>
      }
      rejected={({ reset }) => (
        <Page>
          <ErrorState
            title="설정을 불러오지 못했어요"
            description="잠시 후 다시 시도해 주세요."
            onRetry={reset}
            onGoHome={() => void router.push("/")}
          />
        </Page>
      )}
    >
      <SettingsContent />
    </AsyncBoundary>
  );
}

function SettingsContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { interestsSource, requestLogin, logout } = useHomeFlow();
  const { data: settings } = useSuspenseQuery(settingsQueryOptions);

  const [guestTopicIds, setGuestTopicIdsState] = useState<TopicCode[]>(() =>
    settings.viewer.isMember ? [] : getGuestTopics(),
  );
  const [confirmKind, setConfirmKind] = useState<DeletionRequestKind | null>(null);
  const [accountDeleted, setAccountDeleted] = useState(false);

  // AC-33: 로그인 직후 관심 주제가 어디서 왔는지(브라우저 설정 반영 / 계정 설정 유지)를
  // 한 번 안내한다. 값은 로그인 응답이 알려주므로 화면에서 추측하지 않으며, 어디서
  // 로그인했든 설정 화면에 들어오면 보이고 화면을 떠나면 비워진다.
  const loginAdoptionNotice = settings.viewer.isMember ? interestsSource : null;

  // 탈퇴가 완료되면 서버가 세션까지 지운다. 완료 안내를 잠깐 보여 준 뒤 모든 캐시를
  // 비우고 홈으로 옮겨 비회원 상태로 다시 시작한다.
  useEffect(() => {
    if (!accountDeleted) return;
    const timer = window.setTimeout(() => {
      void queryClient.invalidateQueries().then(() => router.push("/"));
    }, ACCOUNT_DELETED_REDIRECT_MS);
    return () => window.clearTimeout(timer);
  }, [accountDeleted, queryClient, router]);

  const updateTopics = useMutation({
    mutationFn: (topicIds: TopicCode[]) => screenApi.updateInterestTopics({ topicIds }),
    // 서버는 관심 주제만 돌려주므로 화면 모델의 해당 부분만 갱신한다.
    onSuccess: (data) =>
      queryClient.setQueryData(settingsQueryOptions.queryKey, (previous) =>
        previous ? withUpdatedInterests(previous, data.interests) : previous,
      ),
  });

  const requestDeletion = useMutation({
    mutationFn: (kind: DeletionRequestKind) => screenApi.requestDeletion(kind),
    onSuccess: (data, kind) => {
      queryClient.setQueryData(settingsQueryOptions.queryKey, (previous) =>
        previous ? withDeletionRequest(previous, kind, data) : previous,
      );
      if (kind === "account" && data.state === "DONE") setAccountDeleted(true);
    },
  });

  const displayedTopics = settings.viewer.isMember
    ? settings.topics
    : settings.topics.map((topic) => ({ ...topic, selected: guestTopicIds.includes(topic.id) }));

  function toggleTopic(topicId: TopicCode) {
    const isSelected = displayedTopics.some((topic) => topic.id === topicId && topic.selected);
    const nextSelected = isSelected
      ? displayedTopics.filter((topic) => topic.selected && topic.id !== topicId).map((topic) => topic.id)
      : [...displayedTopics.filter((topic) => topic.selected).map((topic) => topic.id), topicId];

    if (settings.viewer.isMember) {
      updateTopics.mutate(nextSelected);
      return;
    }
    setGuestTopics(nextSelected);
    setGuestTopicIdsState(nextSelected);
  }

  function confirmDeletion() {
    if (!confirmKind) return;
    const kind = confirmKind;
    setConfirmKind(null);
    requestDeletion.mutate(kind);
  }

  if (accountDeleted) {
    return (
      <Page>
        <h1 className="text-[32px] leading-[1.375] font-bold tracking-nl-tight text-nl-text">설정</h1>
        <StateNotice
          tone="accent"
          title="탈퇴 처리를 완료했어요"
          description="계정과 기록을 삭제했어요. 잠시 후 홈으로 이동합니다."
        />
      </Page>
    );
  }

  return (
    <Page>
      <h1 className="text-[32px] leading-[1.375] font-bold tracking-nl-tight text-nl-text">설정</h1>

      <section className="flex flex-col gap-5 rounded-nl-card border border-nl-border bg-nl-bg p-8">
        <h2 className="text-[20px] leading-[1.5] font-bold text-nl-text">어떤 소식이 궁금하세요?</h2>
        <p className="text-nl-caption text-nl-muted">
          여러 주제를 골라도, 고르지 않아도 괜찮아요. 선택은 추천 순서에만 참고하며 다른 주제도 보여요.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {displayedTopics.map((topic) => (
            <Chip
              key={topic.id}
              label={topic.label}
              selected={topic.selected}
              disabled={updateTopics.isPending}
              onClick={() => toggleTopic(topic.id)}
            />
          ))}
        </div>

        <p className="text-nl-micro font-bold text-nl-accent">
          저장 위치 · {settings.storageScope === "account" ? "계정" : "브라우저"}
        </p>
        <p className="text-nl-micro text-nl-muted">{settings.persistenceDescription}</p>
        {!settings.viewer.isMember ? (
          <p className="text-nl-micro text-nl-muted">
            브라우저 데이터를 지우면 선택한 관심 주제를 복구할 수 없어요.
          </p>
        ) : null}
        {updateTopics.isError ? (
          <p role="status" className="text-nl-caption text-nl-text">
            관심 주제를 저장하지 못했어요. 다시 선택해 주세요.
          </p>
        ) : null}
        {loginAdoptionNotice ? (
          <p role="status" className="text-nl-caption text-nl-accent">
            {loginAdoptionNotice === "browser"
              ? "브라우저에 저장돼 있던 관심 주제를 계정에 반영했어요."
              : "로그인 후 계정에 저장된 관심 주제를 유지했어요."}
          </p>
        ) : null}
      </section>

      {settings.viewer.isMember ? (
        <section className="flex flex-col gap-5 rounded-nl-card border border-nl-border bg-nl-bg p-8">
          <h2 className="text-[20px] leading-[1.5] font-bold text-nl-text">계정</h2>
          <p className="text-nl-body text-nl-text">Google 계정 · {settings.email}</p>
          <div>
            <Button variant="secondary" onClick={() => void logout()}>
              로그아웃
            </Button>
          </div>

          <h3 className="text-[18px] leading-[1.5] font-bold text-nl-text">내 기록 관리</h3>
          <p className="text-nl-caption text-nl-muted">
            관심 주제와 보관 기록을 제공하기 위해 계정에 저장해요.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="secondary"
              disabled={requestDeletion.isPending || !settings.recordsDeletion.canRequest}
              onClick={() => setConfirmKind("records")}
            >
              기록 삭제 요청
            </Button>
            <Button
              variant="secondary"
              disabled={requestDeletion.isPending || !settings.accountDeletion.canRequest}
              onClick={() => setConfirmKind("account")}
            >
              탈퇴 요청
            </Button>
          </div>
          {requestDeletion.isPending ? (
            <p role="status" className="text-nl-caption text-nl-muted">
              요청을 처리하고 있어요.
            </p>
          ) : null}
          {requestDeletion.isError ? (
            <StateNotice
              title="요청을 접수하지 못했어요"
              description="일시적인 오류로 요청이 전달되지 않았어요. 다시 시도해 주세요."
            />
          ) : null}
          {/* AC-26: 기록 삭제와 탈퇴는 별개 요청이라 각각의 접수·완료·실패를 따로 표시한다. */}
          <DeletionRequestNotice
            deletion={settings.recordsDeletion}
            onRetry={() => requestDeletion.mutate("records")}
          />
          <DeletionRequestNotice
            deletion={settings.accountDeletion}
            onRetry={() => requestDeletion.mutate("account")}
          />
          <p className="text-nl-micro text-nl-muted">
            삭제·탈퇴는 확인 단계를 거쳐요. 요청 접수와 삭제 완료를 구분해 알려드려요.
          </p>
        </section>
      ) : (
        <section className="flex flex-col gap-4 rounded-nl-card border border-nl-border bg-nl-bg p-8">
          <h2 className="text-[20px] leading-[1.5] font-bold text-nl-text">계정</h2>
          <p className="text-nl-caption text-nl-muted">
            로그인하면 관심 주제가 계정에 저장되고 보관·기록 관리 같은 회원 기능을 이용할 수 있어요. 홈 탐색과
            랜덤 퀴즈는 로그인 없이도 이용할 수 있어요.
          </p>
          <div className="max-w-[280px]">
            <GoogleLoginButton onClick={requestLogin} />
          </div>
        </section>
      )}

      <Link href="/privacy" className="text-nl-caption text-nl-accent">
        개인정보 처리 안내 ↗
      </Link>

      <Modal
        open={confirmKind === "records"}
        onClose={() => setConfirmKind(null)}
        title="기록 삭제를 요청할까요?"
        confirmLabel="삭제 요청"
        onConfirm={confirmDeletion}
        onCancel={() => setConfirmKind(null)}
      >
        <p className="text-nl-body text-nl-muted">
          오늘 목록과 아카이브가 삭제 대상이에요. 관심 주제와 계정은 그대로 유지돼요.
        </p>
      </Modal>

      <Modal
        open={confirmKind === "account"}
        onClose={() => setConfirmKind(null)}
        title="계정 탈퇴를 요청할까요?"
        confirmLabel="탈퇴 요청"
        onConfirm={confirmDeletion}
        onCancel={() => setConfirmKind(null)}
      >
        <p className="text-nl-body text-nl-muted">
          계정·관심 주제·보관 기록이 삭제 대상입니다. 법정 보존 예외는 별도로 처리합니다.
        </p>
      </Modal>
    </Page>
  );
}

function DeletionRequestNotice({
  deletion,
  onRetry,
}: {
  deletion: SettingsDeletionViewModel;
  onRetry: () => void;
}) {
  const request = deletion.request;
  if (!request) return null;

  const actionLabel = request.kind === "account" ? "탈퇴 요청" : "기록 삭제 요청";

  if (request.state === "FAILED") {
    return (
      <StateNotice
        title="요청을 처리하지 못했어요"
        description={`${actionLabel}이 일시적인 오류로 처리되지 않았어요. 다시 시도해 주세요.`}
        actions={
          <Button variant="secondary" onClick={onRetry}>
            다시 시도
          </Button>
        }
      />
    );
  }

  // 접수(REQUESTED)와 처리 중(PROCESSING)은 완료와 구분해 알린다(AC-26).
  if (request.state !== "DONE") {
    return (
      <StateNotice
        title={`${actionLabel}을 접수했어요`}
        description={`${request.requestedAtLabel}에 접수했어요. 처리가 끝나면 알려드릴게요.`}
      />
    );
  }

  return (
    <StateNotice
      tone="accent"
      title={request.kind === "account" ? "탈퇴 요청을 완료했어요" : "기록 삭제를 완료했어요"}
      description={`${request.requestedAtLabel}에 접수한 요청 처리를 완료했어요.`}
    />
  );
}

function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-5 py-9 md:px-8">{children}</div>;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => ({
  props: await dehydrateScreenQueries(req, (queryClient, init) =>
    queryClient.prefetchQuery({ ...settingsQueryOptions, queryFn: () => screenApi.settings(init) }),
  ),
});
