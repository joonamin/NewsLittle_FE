import { describe, expect, it } from "vitest";

import {
  adminNavigationFixture,
  homeFixture,
  settingsFixture,
  shortformPreviewFixture,
  shortformResultFixture,
  shortformSessionFixture,
} from "@/mocks/fixtures";

import {
  toGlobalNavigationViewModel,
  toHomeViewModel,
  toQuizPlayViewModel,
  toQuizResultViewModel,
  toQuizStartViewModel,
  toSettingsViewModel,
} from "./view-models";

describe("screen view-model mappers", () => {
  it("keeps API-only article fields out of the home view model", () => {
    const viewModel = toHomeViewModel(homeFixture);

    expect(viewModel.viewer.isMember).toBe(true);
    expect(viewModel.feed.cards[0]).toMatchObject({
      sourceName: "데모 뉴스",
      showsAiSummary: true,
      isRestricted: false,
    });
    expect(viewModel.feed.cards[0]).not.toHaveProperty("topicIds");
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

  it("maps a member's settings with masked email and all six interest topics", () => {
    const viewModel = toSettingsViewModel(settingsFixture);

    expect(viewModel.viewer.isMember).toBe(true);
    expect(viewModel.emailMasked).toBe("me•••@newslittle.example");
    expect(viewModel.canRequestDeletion).toBe(true);
    expect(viewModel.topics).toHaveLength(6);
    expect(viewModel.topics).toContainEqual({ id: "WORLD", label: "국제", selected: false });
    expect(viewModel.lastDeletionRequest).toBeNull();
  });

  it("falls back to a browser persistence description and hides account fields for a guest", () => {
    const viewModel = toSettingsViewModel({
      ...settingsFixture,
      viewer: { id: null, role: "guest", displayName: null, storageScope: "browser" },
      account: null,
    });

    expect(viewModel.viewer.isMember).toBe(false);
    expect(viewModel.canRequestDeletion).toBe(false);
    expect(viewModel.emailMasked).toBeNull();
    expect(viewModel.lastDeletionRequest).toBeNull();
    expect(viewModel.persistenceDescription).toBe("관심 주제는 이 브라우저에 저장됩니다.");
  });

  it("maps a failed deletion request so the screen can show a retry prompt", () => {
    const viewModel = toSettingsViewModel({
      ...settingsFixture,
      account: {
        ...settingsFixture.account!,
        lastDeletionRequest: { kind: "account", outcome: "failed", requestedAt: "2026-09-13T00:00:00+09:00" },
      },
    });

    expect(viewModel.lastDeletionRequest).toMatchObject({ kind: "account", outcome: "failed" });
  });
});
