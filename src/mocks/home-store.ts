import type {
  ArchiveApiModel,
  AuthenticationApiModel,
  DeletionRequestApiModel,
  DeletionRequestKind,
  HomeApiModel,
  NavigationApiModel,
  PreviousListApiModel,
  SettingsApiModel,
  TodayListApiModel,
  TopicCode,
  ViewerApiModel,
} from "@/features/contracts/api-models";

import {
  archiveFixture,
  guestNavigationFixture,
  homeFixture,
  memberNavigationFixture,
  mockViewer,
  topicCatalog,
} from "./fixtures";
import { articles as randomQuizArticles } from "./random-quiz-fixtures";

type AccountId = "member-demo" | "member-alt";
type ActiveAccountId = AccountId | "guest";

type MemberRecord = {
  viewer: ViewerApiModel;
  email: string;
  interests: TopicCode[];
  interestsSetAt: string | null;
  todayList: TodayListApiModel;
  pendingPreviousLists: PreviousListApiModel[];
  archive: ArchiveApiModel;
  lastDeletionRequest: DeletionRequestApiModel;
};

/** 개인정보 보호를 위해 이메일 로컬파트 앞 두 글자만 남기고 나머지는 가린다. */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local.slice(0, 2)}•••@${domain}`;
}

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
    email: isPrimaryAccount ? "member-demo@newslittle.example" : "member-alt@newslittle.example",
    // 백엔드는 interests를 ORDER BY topic(알파벳순)으로 내려주며, 프론트가 보낸 순서를 보존하지 않는다.
    interests: isPrimaryAccount ? ["AI_IT", "ECONOMY"] : [],
    interestsSetAt: isPrimaryAccount ? "2026-09-01T00:00:00+09:00" : null,
    todayList: isPrimaryAccount
      ? clone(homeFixture.todayList!)
      : { selectedForDate: "2026-09-13", items: [] },
    pendingPreviousLists: [],
    archive: isPrimaryAccount ? clone(archiveFixture) : { groups: [] },
    lastDeletionRequest: null,
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

  /** FR-12 설정 화면(SCR-09)의 관심 주제·계정 영역을 구성한다. */
  function settings(): SettingsApiModel {
    const member = activeMember();
    return {
      viewer: member ? clone(member.viewer) : clone(guestViewer),
      topics: topicCatalog.map((topic) => ({
        ...topic,
        selected: member?.interests.includes(topic.id) ?? false,
      })),
      account: member
        ? {
            emailMasked: maskEmail(member.email),
            canRequestDeletion: true,
            persistenceDescription: "관심 주제와 오늘 목록, 아카이브는 계정에 저장됩니다.",
            lastDeletionRequest: member.lastDeletionRequest,
          }
        : null,
    };
  }

  /** FR-12: 회원이 설정 화면에서 관심 주제를 직접 저장한다(가중치일 뿐 주제 제한이 아니다). */
  function updateInterestTopics(topicIds: TopicCode[]): SettingsApiModel {
    const member = activeMember();
    if (!member) throw new Error("AUTHENTICATION_REQUIRED");
    member.interests = [...topicIds].sort();
    member.interestsSetAt = new Date().toISOString();
    return settings();
  }

  /**
   * FR-15/AC-26: 기록·계정 삭제 요청을 접수한다. 실제 처리는 운영 백엔드가 비동기로
   * 수행하므로 이 목은 즉시 완료로 응답하지만, 실패 상태 표시·재시도 안내는 화면이
   * lastDeletionRequest.outcome을 그대로 렌더링하도록 만들어 둔다.
   */
  function requestAccountDeletion(kind: DeletionRequestKind): SettingsApiModel {
    const member = activeMember();
    if (!member) throw new Error("AUTHENTICATION_REQUIRED");
    member.lastDeletionRequest = {
      kind,
      outcome: "completed",
      requestedAt: new Date().toISOString(),
    };
    return settings();
  }

  return {
    addToTodayList,
    archive: () => clone(activeMember()?.archive ?? { groups: [] }),
    archivePreviousLists,
    deleteArchiveEntry,
    discardPreviousLists,
    home,
    /**
     * FR-12/AC-33: 계정에 관심 주제가 설정된 적이 없을 때만(interestsSetAt이 null일 때만)
     * 브라우저에 저장돼 있던 topicIds를 계정에 반영하고, 이미 설정된 계정은 그대로 보존한다.
     */
    login: (topicIds?: TopicCode[]): AuthenticationApiModel => {
      activeAccountId = "member-demo";
      const member = accounts.get(activeAccountId)!;
      if (!member.interestsSetAt && topicIds && topicIds.length > 0) {
        // 백엔드는 저장된 topicIds를 그대로 echo하지 않고 알파벳순으로 정렬해 내려준다.
        member.interests = [...topicIds].sort();
        member.interestsSetAt = new Date().toISOString();
      }
      return {
        email: member.email,
        displayName: member.viewer.displayName ?? "",
        isNewUser: false,
        interests: clone(member.interests),
        interestsSetAt: member.interestsSetAt,
        role: "member",
      };
    },
    logout: () => {
      activeAccountId = "guest";
      return clone(guestViewer);
    },
    navigation,
    removeFromTodayList,
    requestAccountDeletion,
    setActiveAccountId: (accountId: ActiveAccountId) => {
      activeAccountId = accountId;
    },
    settings,
    updateInterestTopics,
  };
}

export const mockHomeStore = createMockHomeStore();

export function resetMockHomeStore() {
  const replacement = createMockHomeStore();
  Object.assign(mockHomeStore, replacement);
}
