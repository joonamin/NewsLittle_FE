import { describe, expect, it } from "vitest";

import {
  adminNavigationFixture,
  homeFixture,
  nextFeedPageFixture,
  authMeFixture,
  shortformPreviewFixture,
  shortformResultFixture,
  shortformSessionFixture,
} from "@/mocks/fixtures";

import {
  toFeedViewModel,
  toGlobalNavigationViewModel,
  toHomeViewModel,
  toQuizPlayViewModel,
  toQuizResultViewModel,
  toQuizStartViewModel,
  toSettingsViewModel,
  withDeletionRequest,
  withUpdatedInterests,
} from "./view-models";

describe("screen view-model mappers", () => {
  it("keeps API-only article fields out of the home view model and maps nextCursor", () => {
    const viewModel = toHomeViewModel(homeFixture);

    expect(viewModel.viewer.isMember).toBe(true);
    expect(viewModel.feed.nextCursor).toBe("demo-next-cursor");
    expect(viewModel.feed.cards[0]).toMatchObject({
      sourceName: "데모 뉴스",
      showsAiSummary: true,
      isRestricted: false,
    });
    expect(viewModel.feed.cards[0]).not.toHaveProperty("topicIds");
  });

  it("maps bodyText from article.body and summaryText from article.summary separately", () => {
    const card = toHomeViewModel(homeFixture).feed.cards[0];

    expect(card?.bodyText).toBe(homeFixture.feed.items[0]?.article.body.text);
    expect(card?.summaryText).toBe(homeFixture.feed.items[0]?.article.summary.text);
    expect(card?.bodyText).not.toBe(card?.summaryText);
  });

  it("falls back to the summary as body and hides the AI summary box when body is unavailable", () => {
    const legacy = structuredClone(homeFixture);
    legacy.feed.items[0]!.article.body = { status: "unavailable", text: null };
    const card = toHomeViewModel(legacy).feed.cards[0];

    expect(card?.bodyText).toBe(legacy.feed.items[0]?.article.summary.text);
    expect(card?.summaryText).toBeNull();
    expect(card?.showsAiSummary).toBe(false);
    expect(card?.isRestricted).toBe(false);
  });

  it("hides the AI summary box when body and summary are effectively the same text", () => {
    const duplicated = structuredClone(homeFixture);
    const article = duplicated.feed.items[0]!.article;
    article.body = { status: "available", text: `${article.summary.text} ` };
    const card = toHomeViewModel(duplicated).feed.cards[0];

    expect(card?.summaryText).toBeNull();
    expect(card?.showsAiSummary).toBe(false);
  });

  it("marks the card restricted only when both body and summary are unavailable", () => {
    const expired = structuredClone(homeFixture);
    const article = expired.feed.items[0]!.article;
    article.body = { status: "unavailable", text: null };
    article.summary = { ...article.summary, status: "unavailable", text: null };
    const card = toHomeViewModel(expired).feed.cards[0];

    expect(card?.bodyText).toBeNull();
    expect(card?.isRestricted).toBe(true);
  });

  it("maps feed API model to FeedViewModel with cards and nextCursor", () => {
    const feedViewModel = toFeedViewModel(nextFeedPageFixture);

    expect(feedViewModel.cards).toHaveLength(1);
    expect(feedViewModel.cards[0]?.title).toBe("모의 기사: 다음 커서로 불러온 새로운 기사입니다");
    expect(feedViewModel.nextCursor).toBeNull();
    expect(feedViewModel.canLoadPreviousDates).toBe(false);
  });

  it("maps quiz format availability into UI-ready labels", () => {
    const viewModel = toQuizStartViewModel(shortformPreviewFixture);

    expect(viewModel.domainLabel).toBe("숏폼 퀴즈");
    expect(viewModel.defaultFormatId).toBe("choice");
    expect(viewModel.formats).toContainEqual({
      id: "written",
      label: "주관식형",
      enabled: true,
      reason: null,
    });
  });

  it("preserves server-authorized navigation items without deriving an admin role", () => {
    const viewModel = toGlobalNavigationViewModel(adminNavigationFixture);

    expect(viewModel.primaryItems).toContainEqual(
      expect.objectContaining({ id: "operations", href: "/admin" }),
    );
    expect(viewModel).not.toHaveProperty("isAdmin");
  });

  it("maps quiz result into recap items with outcome labels and evidence card", () => {
    const viewModel = toQuizResultViewModel(shortformResultFixture);

    expect(viewModel.sessionId).toBe(shortformResultFixture.sessionId);
    expect(viewModel.format).toBe("choice");
    expect(viewModel.isServiceEnded).toBe(false);
    expect(viewModel.canStartNextRound).toBe(false);
    expect(viewModel.recapItems).toHaveLength(1);
    expect(viewModel.recapItems[0]).toMatchObject({
      index: 1,
      outcome: "correct",
      outcomeLabel: "정답",
    });
    expect(viewModel.recapItems[0].evidence?.title).toBe(shortformResultFixture.explanations[0].evidence.title);
  });

  it("enables next round in quiz result view model when remaining candidates exist", () => {
    const viewModel = toQuizResultViewModel({
      ...shortformResultFixture,
      remainingCandidateCount: 2,
    });

    expect(viewModel.canStartNextRound).toBe(true);
  });

  it("preserves a service-ended play session as a distinct screen state", () => {
    const viewModel = toQuizPlayViewModel({
      ...shortformSessionFixture,
      status: "ended-by-service",
      progress: { current: 0, total: 0, processed: 0 },
      question: null,
      resolution: null,
    });

    expect(viewModel).toMatchObject({
      isFinished: true,
      isServiceEnded: true,
      status: "ended-by-service",
      question: null,
    });
  });

  it("maps a member's settings from /auth/me with all six interest topics", () => {
    const viewModel = toSettingsViewModel(authMeFixture);

    expect(viewModel.viewer.isMember).toBe(true);
    expect(viewModel.email).toBe("member-demo@newslittle.example");
    expect(viewModel.storageScope).toBe("account");
    expect(viewModel.accountDeletion.canRequest).toBe(true);
    expect(viewModel.topics).toHaveLength(6);
    expect(viewModel.topics).toContainEqual({ id: "WORLD", label: "국제", selected: false });
    expect(viewModel.topics).toContainEqual({ id: "AI_IT", label: "AI·IT", selected: true });
    expect(viewModel.accountDeletion.request).toBeNull();
    expect(viewModel.recordsDeletion.request).toBeNull();
  });

  it("falls back to a browser persistence description and hides account fields for a guest", () => {
    const viewModel = toSettingsViewModel({
      ...authMeFixture,
      status: "guest",
      role: "guest",
      email: null,
      displayName: null,
      interests: [],
      interestsSetAt: null,
    });

    expect(viewModel.viewer.isMember).toBe(false);
    expect(viewModel.storageScope).toBe("browser");
    expect(viewModel.email).toBeNull();
    expect(viewModel.topics.every((topic) => !topic.selected)).toBe(true);
    expect(viewModel.persistenceDescription).toBe("관심 주제는 이 브라우저에 저장됩니다.");
  });

  it("maps a failed deletion request so the screen can show a retry prompt", () => {
    const viewModel = toSettingsViewModel({
      ...authMeFixture,
      accountDeletionRequest: {
        state: "FAILED",
        requestedAt: "2026-09-13T00:00:00+09:00",
        completedAt: null,
      },
      canRequestAccountDeletion: true,
    });

    expect(viewModel.accountDeletion.request).toMatchObject({ kind: "account", state: "FAILED" });
    expect(viewModel.accountDeletion.canRequest).toBe(true);
  });

  it("blocks a re-request while a deletion request is still being processed", () => {
    const viewModel = toSettingsViewModel({
      ...authMeFixture,
      recordsDeletionRequest: {
        state: "PROCESSING",
        requestedAt: "2026-09-13T00:00:00+09:00",
        completedAt: null,
      },
      canRequestRecordsDeletion: false,
    });

    expect(viewModel.recordsDeletion.request).toMatchObject({ kind: "records", state: "PROCESSING" });
    expect(viewModel.recordsDeletion.canRequest).toBe(false);
  });

  it("patches only the changed part of the settings model from a partial response", () => {
    const base = toSettingsViewModel(authMeFixture);

    const withTopics = withUpdatedInterests(base, ["WORLD"]);
    expect(withTopics.topics.filter((topic) => topic.selected).map((topic) => topic.id)).toEqual([
      "WORLD",
    ]);
    expect(withTopics.email).toBe(base.email);

    const withRecords = withDeletionRequest(withTopics, "records", {
      state: "DONE",
      requestedAt: "2026-09-13T00:00:00+09:00",
      completedAt: "2026-09-13T00:00:05+09:00",
    });
    expect(withRecords.recordsDeletion.request).toMatchObject({ kind: "records", state: "DONE" });
    expect(withRecords.recordsDeletion.canRequest).toBe(true);
    expect(withRecords.accountDeletion.request).toBeNull();
    expect(withRecords.topics).toEqual(withTopics.topics);
  });

  it("provides default O and X choices for choice-format quiz when question.choices is null or empty", () => {
    const viewModel = toQuizPlayViewModel({
      ...shortformSessionFixture,
      format: "choice",
      question: {
        ...shortformSessionFixture.question!,
        choices: null,
      },
    });

    expect(viewModel.question?.choices).toEqual([
      { id: "O", label: "O" },
      { id: "X", label: "X" },
    ]);
  });
});

