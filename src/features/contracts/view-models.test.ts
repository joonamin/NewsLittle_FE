import { describe, expect, it } from "vitest";

import { adminNavigationFixture, homeFixture, shortformPreviewFixture } from "@/mocks/fixtures";

import { toGlobalNavigationViewModel, toHomeViewModel, toQuizStartViewModel } from "./view-models";

describe("screen view-model mappers", () => {
  it("keeps API-only article fields out of the home view model", () => {
    const viewModel = toHomeViewModel(homeFixture);

    expect(viewModel.viewer.isMember).toBe(true);
    expect(viewModel.feed.cards[0]).toMatchObject({
      sourceName: "데모 뉴스",
      showsAiSummary: true,
    });
    expect(viewModel.feed.cards[0]).not.toHaveProperty("topicIds");
  });

  it("maps quiz format availability into UI-ready labels", () => {
    const viewModel = toQuizStartViewModel(shortformPreviewFixture);

    expect(viewModel.domainLabel).toBe("숏폼 퀴즈");
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
});
