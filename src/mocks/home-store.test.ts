import { describe, expect, it } from "vitest";

import type { PreviousListApiModel } from "@/features/contracts/api-models";

import { firstArticle, secondArticle } from "./fixtures";
import { createMockHomeStore } from "./home-store";

describe("mock home store", () => {
  it("keeps the first selection order, ignores duplicates, and appends after removal", () => {
    const store = createMockHomeStore();

    store.addToTodayList(secondArticle.id);
    store.addToTodayList(secondArticle.id);
    store.removeFromTodayList(firstArticle.id);
    store.addToTodayList(firstArticle.id);

    expect(store.home().todayList?.items.map((item) => item.article.id)).toEqual([
      secondArticle.id,
      firstArticle.id,
    ]);
  });

  it("archives every pending date once before clearing the pending decision", () => {
    const pendingPreviousLists: PreviousListApiModel[] = [
      {
        date: "2026-09-11",
        items: [
          {
            article: secondArticle,
            selectedAt: "2026-09-11T11:00:00+09:00",
            selectionOrder: 1,
            quizStatus: "ready",
            isFromPreviousFeedDate: true,
          },
        ],
      },
    ];
    const store = createMockHomeStore({ pendingPreviousLists });

    store.archivePreviousLists();
    store.archivePreviousLists();

    expect(store.home().pendingPreviousLists).toEqual([]);
    expect(store.archive().groups.find((group) => group.date === "2026-09-11")?.entries).toHaveLength(1);
  });

  it("deletes an archive entry and drops the group once it is empty, but rejects an unknown id", () => {
    const store = createMockHomeStore();
    const entry = store.archive().groups[0]!.entries[0]!;

    expect(() => store.deleteArchiveEntry("no-such-entry")).toThrow("NOT_FOUND");

    store.deleteArchiveEntry(entry.id);

    expect(
      store.archive().groups.flatMap((group) => group.entries).some((candidate) => candidate.id === entry.id),
    ).toBe(false);
  });

  it("reports a guest with no interests and no account fields", () => {
    const store = createMockHomeStore({ activeAccountId: "guest" });

    const me = store.authMe();

    expect(me.status).toBe("guest");
    expect(me.email).toBeNull();
    expect(me.interests).toEqual([]);
  });

  it("saves a member's interest topics sorted and rejects a guest", () => {
    const store = createMockHomeStore();

    const interests = store.updateInterestTopics(["WORLD", "AI_IT"]);

    expect(interests.interests).toEqual(["AI_IT", "WORLD"]);
    expect(store.authMe().interests).toEqual(["AI_IT", "WORLD"]);

    const guestStore = createMockHomeStore({ activeAccountId: "guest" });
    expect(() => guestStore.updateInterestTopics(["ECONOMY"])).toThrow("AUTHENTICATION_REQUIRED");
  });

  it("keeps the account after a records deletion but ends the session after a withdrawal", () => {
    const store = createMockHomeStore();

    const records = store.requestDeletion("records");
    expect(records).toMatchObject({ state: "DONE" });
    expect(store.authMe().status).toBe("authenticated");
    expect(store.authMe().recordsDeletionRequest).toMatchObject({ state: "DONE" });
    expect(store.archive().groups).toEqual([]);

    const account = store.requestDeletion("account");
    expect(account).toMatchObject({ state: "DONE" });
    // 탈퇴가 끝나면 계정이 사라져 세션도 남지 않는다.
    expect(store.authMe().status).toBe("guest");

    const guestStore = createMockHomeStore({ activeAccountId: "guest" });
    expect(() => guestStore.requestDeletion("records")).toThrow("AUTHENTICATION_REQUIRED");
  });

  it("reports where the login adopted interests from (AC-33)", () => {
    const withAccountInterests = createMockHomeStore({ activeAccountId: "guest" });
    expect(withAccountInterests.login(["WORLD"]).interestsSource).toBe("account");

    const store = createMockHomeStore({ activeAccountId: "guest" });
    store.login();
    store.requestDeletion("account");
    // 새 계정에는 설정된 관심 주제가 없어 브라우저 설정이 반영된다.
    expect(store.login(["WORLD"]).interestsSource).toBe("browser");
  });

  it("serves next feed page fixture when demo-next-cursor is passed and default feed otherwise", () => {
    const store = createMockHomeStore();

    const initialFeed = store.feed();
    expect(initialFeed.items).toHaveLength(3);
    expect(initialFeed.nextCursor).toBe("demo-next-cursor");

    const nextFeed = store.feed("demo-next-cursor");
    expect(nextFeed.items).toHaveLength(1);
    expect(nextFeed.items[0]?.article.id).toBe("article-next-page-demo");
    expect(nextFeed.nextCursor).toBeNull();
  });
});
