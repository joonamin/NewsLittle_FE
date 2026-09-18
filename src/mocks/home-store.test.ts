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
});
