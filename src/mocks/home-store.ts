import type {
  ArchiveApiModel,
  AuthenticationApiModel,
  AuthMeApiModel,
  DeletionRequestApiModel,
  DeletionRequestKind,
  FeedApiModel,
  HomeApiModel,
  InterestsApiModel,
  NavigationApiModel,
  PreviousListApiModel,
  TodayListApiModel,
  TopicCode,
  ViewerApiModel,
} from "@/features/contracts/api-models";

import {
  adminNavigationFixture,
  archiveFixture,
  guestNavigationFixture,
  homeFixture,
  memberNavigationFixture,
  mockViewer,
  nextFeedPageFixture,
} from "./fixtures";
import { articles as randomQuizArticles } from "./random-quiz-fixtures";

type AccountId = "member-demo" | "member-alt" | "admin-demo";
type ActiveAccountId = AccountId | "guest";

type MemberRecord = {
  viewer: ViewerApiModel;
  email: string;
  interests: TopicCode[];
  interestsSetAt: string | null;
  todayList: TodayListApiModel;
  pendingPreviousLists: PreviousListApiModel[];
  archive: ArchiveApiModel;
  accountDeletionRequest: DeletionRequestApiModel | null;
  recordsDeletionRequest: DeletionRequestApiModel | null;
};

export type MockHomeStoreOptions = {
  activeAccountId?: ActiveAccountId;
  pendingPreviousLists?: PreviousListApiModel[];
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

function createMemberRecord(accountId: AccountId): MemberRecord {
  const isPrimaryAccount = accountId === "member-demo";
  const isAdminAccount = accountId === "admin-demo";
  const displayName = isAdminAccount
    ? "뉴스리틀 관리자"
    : isPrimaryAccount
      ? mockViewer.displayName
      : "다른 뉴스리틀 사용자";

  return {
    viewer: {
      id: accountId,
      role: isAdminAccount ? "admin" : "member",
      displayName,
      storageScope: "account",
    },
    email: isAdminAccount
      ? "dev-admin@newslittle.local"
      : isPrimaryAccount
        ? "member-demo@newslittle.example"
        : "member-alt@newslittle.example",
    // 백엔드는 interests를 ORDER BY topic(알파벳순)으로 내려주며, 프론트가 보낸 순서를 보존하지 않는다.
    interests: isPrimaryAccount ? ["AI_IT", "ECONOMY"] : [],
    interestsSetAt: isPrimaryAccount ? "2026-09-01T00:00:00+09:00" : null,
    todayList: isPrimaryAccount || isAdminAccount
      ? clone(homeFixture.todayList!)
      : { selectedForDate: "2026-09-13", items: [] },
    pendingPreviousLists: [],
    archive: isPrimaryAccount || isAdminAccount ? clone(archiveFixture) : { groups: [] },
    accountDeletionRequest: null,
    recordsDeletionRequest: null,
  };
}

export function createMockHomeStore(options: MockHomeStoreOptions = {}) {
  const accounts = new Map<AccountId, MemberRecord>([
    ["member-demo", createMemberRecord("member-demo")],
    ["member-alt", createMemberRecord("member-alt")],
    ["admin-demo", createMemberRecord("admin-demo")],
  ]);
  let activeAccountId: ActiveAccountId = options.activeAccountId ?? "member-demo";

  if (options.pendingPreviousLists) {
    accounts.get("member-demo")!.pendingPreviousLists = clone(options.pendingPreviousLists);
  }

  const guestViewer: ViewerApiModel = {
    id: null,
    role: "guest",
    displayName: null,
    storageScope: "browser",
  };

  function activeMember() {
    return activeAccountId === "guest" ? null : accounts.get(activeAccountId)!;
  }

  function feedItem(articleId: string) {
    const homeItem = homeFixture.feed.items.find((item) => item.article.id === articleId);
    if (homeItem) return homeItem;

    const nextPageItem = nextFeedPageFixture.items.find((item) => item.article.id === articleId);
    if (nextPageItem) return nextPageItem;

    const quizArticle = randomQuizArticles.find((article) => article.id === articleId);
    return quizArticle ? { article: quizArticle, isFromPreviousFeedDate: false } : null;
  }

  function home(): HomeApiModel {
    const member = activeMember();
    return {
      viewer: member ? clone(member.viewer) : clone(guestViewer),
      feed: clone(homeFixture.feed),
      todayList: member ? clone(member.todayList) : null,
      pendingPreviousLists: member ? clone(member.pendingPreviousLists) : [],
    };
  }

  function navigation(): NavigationApiModel {
    const member = activeMember();
    if (!member) return clone(guestNavigationFixture);

    const isAdmin = member.viewer.role === "admin";
    const template = isAdmin ? adminNavigationFixture : memberNavigationFixture;
    const result = clone(template);
    result.account = {
      status: "member",
      displayName: member.viewer.displayName ?? (isAdmin ? "뉴스리틀 관리자" : "뉴스리틀 사용자"),
      menuItems: result.account.status === "member" ? result.account.menuItems : [],
    };
    result.todayListCount = member.todayList.items.length;
    return result;
  }

  function addToTodayList(articleId: string): TodayListApiModel {
    const member = activeMember();
    if (!member) throw new Error("AUTHENTICATION_REQUIRED");

    if (member.todayList.items.some((item) => item.article.id === articleId)) {
      return clone(member.todayList);
    }

    const item = feedItem(articleId);
    if (!item) throw new Error("ARTICLE_NOT_FOUND");

    const lastOrder = Math.max(0, ...member.todayList.items.map((entry) => entry.selectionOrder));
    member.todayList.items.push({
      article: item.article,
      selectedAt: "2026-09-13T10:05:00+09:00",
      selectionOrder: lastOrder + 1,
      quizStatus: "ready",
      isFromPreviousFeedDate: item.isFromPreviousFeedDate,
    });
    return clone(member.todayList);
  }

  function removeFromTodayList(articleId: string): TodayListApiModel {
    const member = activeMember();
    if (!member) throw new Error("AUTHENTICATION_REQUIRED");
    member.todayList.items = member.todayList.items.filter((item) => item.article.id !== articleId);
    return clone(member.todayList);
  }

  function archiveTodayList(title: string): { archiveGroupId: string; title: string; archivedCount: number } {
    const member = activeMember();
    if (!member) throw new Error("AUTHENTICATION_REQUIRED");

    const trimmedTitle = title.trim();
    if (!trimmedTitle) throw new Error("DUPLICATE_ARCHIVE_TITLE");
    if (member.archive.groups.some((group) => group.title === trimmedTitle)) {
      throw new Error("DUPLICATE_ARCHIVE_TITLE");
    }

    const date = member.todayList.selectedForDate;
    const archiveGroupId = `archive-group-${date}-${trimmedTitle}`;
    const entries = member.todayList.items.map((item) => ({
      id: `archive-${date}-${item.article.id}`,
      selectedAt: item.selectedAt,
      article: item.article,
      displayStatus:
        item.quizStatus === "suspended"
          ? ("discontinued" as const)
          : ("available" as const),
      archiveGroupTitle: trimmedTitle,
    }));

    // 실제 BE는 archived_at 최신순으로 정렬해 내려준다 — 목도 방금 아카이빙한
    // 그룹이 맨 앞(기본 펼침 대상)에 오도록 맞춘다.
    member.archive.groups.unshift({ id: archiveGroupId, date, title: trimmedTitle, entries });
    const archivedCount = member.todayList.items.length;
    member.todayList = { selectedForDate: date, items: [] };

    return { archiveGroupId, title: trimmedTitle, archivedCount };
  }

  function archivePreviousLists(): HomeApiModel {
    const member = activeMember();
    if (!member) throw new Error("AUTHENTICATION_REQUIRED");

    for (const list of member.pendingPreviousLists) {
      const dateGroupId = `date:${list.date}`;
      const existingGroup = member.archive.groups.find((group) => group.id === dateGroupId);
      const group = existingGroup ?? { id: dateGroupId, date: list.date, entries: [] };
      if (!existingGroup) member.archive.groups.push(group);

      for (const item of list.items) {
        if (group.entries.some((entry) => entry.article?.id === item.article.id)) continue;
        group.entries.push({
          id: `archive-${list.date}-${item.article.id}`,
          selectedAt: item.selectedAt,
          article: item.article,
          displayStatus: item.quizStatus === "suspended" ? "discontinued" : "available",
        });
      }
    }

    member.pendingPreviousLists = [];
    return home();
  }

  function discardPreviousLists(): HomeApiModel {
    const member = activeMember();
    if (!member) throw new Error("AUTHENTICATION_REQUIRED");
    member.pendingPreviousLists = [];
    return home();
  }

  /** SCR-07 개별 삭제(FR-10·FR-15). 본인 소유가 아니거나 없는 항목은 NOT_FOUND. */
  function deleteArchiveEntry(entryId: string): void {
    const member = activeMember();
    if (!member) throw new Error("AUTHENTICATION_REQUIRED");

    for (const group of member.archive.groups) {
      const index = group.entries.findIndex((entry) => entry.id === entryId);
      if (index === -1) continue;
      group.entries.splice(index, 1);
      member.archive.groups = member.archive.groups.filter((g) => g.entries.length > 0);
      return;
    }

    throw new Error("NOT_FOUND");
  }

  /**
   * GET /api/v1/auth/me. 설정 화면(SCR-09)은 전용 조회 엔드포인트가 없어 이 응답
   * 하나로 구성된다. 비회원도 200이며 status만 "guest"다.
   */
  function authMe(): AuthMeApiModel {
    const member = activeMember();
    if (!member) {
      return {
        status: "guest",
        email: null,
        displayName: null,
        role: "guest",
        interests: [],
        interestsSetAt: null,
        accountDeletionRequest: null,
        canRequestAccountDeletion: true,
        recordsDeletionRequest: null,
        canRequestRecordsDeletion: true,
      };
    }

    return {
      status: "authenticated",
      email: member.email,
      displayName: member.viewer.displayName,
      role: member.viewer.role,
      interests: clone(member.interests),
      interestsSetAt: member.interestsSetAt,
      accountDeletionRequest: clone(member.accountDeletionRequest),
      canRequestAccountDeletion: !isPending(member.accountDeletionRequest),
      recordsDeletionRequest: clone(member.recordsDeletionRequest),
      canRequestRecordsDeletion: !isPending(member.recordsDeletionRequest),
    };
  }

  /** 서버와 같은 규칙: 접수·처리 중인 요청이 있으면 같은 종류를 다시 받지 않는다. */
  function isPending(request: DeletionRequestApiModel | null): boolean {
    return request?.state === "REQUESTED" || request?.state === "PROCESSING";
  }

  /** FR-12: 회원이 설정 화면에서 관심 주제를 직접 저장한다(가중치일 뿐 주제 제한이 아니다). */
  function updateInterestTopics(topicIds: TopicCode[]): InterestsApiModel {
    const member = activeMember();
    if (!member) throw new Error("AUTHENTICATION_REQUIRED");
    member.interests = [...topicIds].sort();
    member.interestsSetAt = new Date().toISOString();
    return { interests: clone(member.interests), interestsSetAt: member.interestsSetAt };
  }

  /**
   * FR-15/AC-26: 기록 삭제 요청과 탈퇴 요청은 별개 동작이라 서버도 경로를 나눈다.
   * 실제 처리는 백엔드가 같은 요청 안에서 끝내므로 이 목도 즉시 DONE으로 응답하고,
   * 탈퇴는 계정이 사라지므로 세션까지 비운다.
   */
  function requestDeletion(kind: DeletionRequestKind): DeletionRequestApiModel {
    const member = activeMember();
    if (!member) throw new Error("AUTHENTICATION_REQUIRED");

    const now = new Date().toISOString();
    const request: DeletionRequestApiModel = { state: "DONE", requestedAt: now, completedAt: now };

    if (kind === "account") {
      member.accountDeletionRequest = request;
      // 계정 자체가 사라지므로 저장된 기록을 비우고 세션도 끊는다. 다시 로그인하면
      // 새 계정으로 시작한다.
      accounts.set(activeAccountId as AccountId, createMemberRecord(activeAccountId as AccountId));
      accounts.get(activeAccountId as AccountId)!.interests = [];
      accounts.get(activeAccountId as AccountId)!.interestsSetAt = null;
      activeAccountId = "guest";
    } else {
      member.recordsDeletionRequest = request;
      member.todayList = { selectedForDate: member.todayList.selectedForDate, items: [] };
      member.archive = { groups: [] };
    }

    return clone(request);
  }

  return {
    addToTodayList,
    archive: () => clone(activeMember()?.archive ?? { groups: [] }),
    archiveTodayList,
    authMe,
    archivePreviousLists,
    deleteArchiveEntry,
    discardPreviousLists,
    feed: (cursor?: string | null): FeedApiModel => {
      if (cursor === "demo-next-cursor") {
        return clone(nextFeedPageFixture);
      }
      return clone(homeFixture.feed);
    },
    home,
    /**
     * FR-12/AC-33: 계정에 관심 주제가 설정된 적이 없을 때만(interestsSetAt이 null일 때만)
     * 브라우저에 저장돼 있던 topicIds를 계정에 반영하고, 이미 설정된 계정은 그대로 보존한다.
     */
    login: (topicIds?: TopicCode[]): AuthenticationApiModel => {
      activeAccountId = "member-demo";
      const member = accounts.get(activeAccountId)!;
      const hadAccountInterests = member.interestsSetAt !== null;
      let interestsSource: AuthenticationApiModel["interestsSource"] = null;
      if (!hadAccountInterests && topicIds && topicIds.length > 0) {
        // 백엔드는 저장된 topicIds를 그대로 echo하지 않고 알파벳순으로 정렬해 내려준다.
        member.interests = [...topicIds].sort();
        member.interestsSetAt = new Date().toISOString();
        interestsSource = "browser";
      } else if (hadAccountInterests) {
        interestsSource = "account";
      }
      return {
        email: member.email,
        displayName: member.viewer.displayName ?? "",
        isNewUser: false,
        interests: clone(member.interests),
        interestsSetAt: member.interestsSetAt,
        interestsSource,
        role: "member",
      };
    },
    loginAsAdmin: () => {
      activeAccountId = "admin-demo";
      return clone(accounts.get(activeAccountId)!.viewer);
    },
    logout: () => {
      activeAccountId = "guest";
      return clone(guestViewer);
    },
    navigation,
    removeFromTodayList,
    requestDeletion,
    setActiveAccountId: (accountId: ActiveAccountId) => {
      activeAccountId = accountId;
    },
    updateInterestTopics,
  };
}

export const mockHomeStore = createMockHomeStore();

export function resetMockHomeStore() {
  const replacement = createMockHomeStore();
  Object.assign(mockHomeStore, replacement);
}
