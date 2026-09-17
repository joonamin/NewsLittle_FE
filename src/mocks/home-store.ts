import type {
  ArchiveApiModel,
  HomeApiModel,
  NavigationApiModel,
  PreviousListApiModel,
  QuizPreviewApiModel,
  TodayListApiModel,
  ViewerApiModel,
} from "@/features/contracts/api-models";

import {
  archiveFixture,
  guestNavigationFixture,
  homeFixture,
  memberNavigationFixture,
  mockViewer,
} from "./fixtures";
import { articles as randomQuizArticles } from "./random-quiz-fixtures";

type AccountId = "member-demo" | "member-alt";
type ActiveAccountId = AccountId | "guest";

type MemberRecord = {
  viewer: ViewerApiModel;
  todayList: TodayListApiModel;
  pendingPreviousLists: PreviousListApiModel[];
  archive: ArchiveApiModel;
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
  const displayName = isPrimaryAccount ? mockViewer.displayName : "다른 뉴스리틀 사용자";

  return {
    viewer: {
      id: accountId,
      role: "member",
      displayName,
      storageScope: "account",
    },
    todayList: isPrimaryAccount
      ? clone(homeFixture.todayList!)
      : { selectedForDate: "2026-09-13", items: [] },
    pendingPreviousLists: [],
    archive: isPrimaryAccount ? clone(archiveFixture) : { groups: [] },
  };
}

export function createMockHomeStore(options: MockHomeStoreOptions = {}) {
  const accounts = new Map<AccountId, MemberRecord>([
    ["member-demo", createMemberRecord("member-demo")],
    ["member-alt", createMemberRecord("member-alt")],
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

    const result = clone(memberNavigationFixture);
    result.account = {
      status: "member",
      displayName: member.viewer.displayName ?? "뉴스리틀 사용자",
      menuItems: result.account.status === "member" ? result.account.menuItems : [],
    };
    result.todayListCount = member.todayList.items.length;
    return result;
  }

  function shortformPreview(): QuizPreviewApiModel {
    const member = activeMember();
    if (!member) throw new Error("AUTHENTICATION_REQUIRED");

    const candidates = member.todayList.items.map((item) => ({
      articleId: item.article.id,
      title: item.article.title,
      status: item.quizStatus === "ready" ? ("included" as const) : ("excluded" as const),
      exclusionReason:
        item.quizStatus === "ready"
          ? null
          : item.quizStatus === "preparing"
            ? ("preparing" as const)
            : item.quizStatus,
    }));
    const includedCandidates = candidates.filter((candidate) => candidate.status === "included");
    const unavailableReason = includedCandidates.length > 0 ? null : "출제 가능한 기사가 없어요.";

    return {
      domain: "shortform",
      defaultFormat: "choice",
      formatAvailability: {
        choice: { enabled: includedCandidates.length > 0, reason: unavailableReason },
        written: { enabled: includedCandidates.length > 0, reason: unavailableReason },
      },
      plannedQuestionCount: Math.min(includedCandidates.length, 10),
      remainingCandidateCount: Math.max(includedCandidates.length - 10, 0),
      candidates,
    };
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

  function archivePreviousLists(): HomeApiModel {
    const member = activeMember();
    if (!member) throw new Error("AUTHENTICATION_REQUIRED");

    for (const list of member.pendingPreviousLists) {
      const existingGroup = member.archive.groups.find((group) => group.date === list.date);
      const group = existingGroup ?? { date: list.date, entries: [] };
      if (!existingGroup) member.archive.groups.push(group);

      for (const item of list.items) {
        if (group.entries.some((entry) => entry.article?.id === item.article.id)) continue;
        group.entries.push({
          id: `archive-${list.date}-${item.article.id}`,
          selectedAt: item.selectedAt,
          article: item.article,
          displayStatus: item.quizStatus === "suspended" ? "restricted" : "available",
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

  return {
    addToTodayList,
    archive: () => clone(activeMember()?.archive ?? { groups: [] }),
    archivePreviousLists,
    discardPreviousLists,
    home,
    login: () => {
      activeAccountId = "member-demo";
      return clone(accounts.get(activeAccountId)!.viewer);
    },
    logout: () => {
      activeAccountId = "guest";
      return clone(guestViewer);
    },
    navigation,
    removeFromTodayList,
    shortformPreview,
    setActiveAccountId: (accountId: ActiveAccountId) => {
      activeAccountId = accountId;
    },
  };
}

export const mockHomeStore = createMockHomeStore();

export function resetMockHomeStore() {
  const replacement = createMockHomeStore();
  Object.assign(mockHomeStore, replacement);
}
