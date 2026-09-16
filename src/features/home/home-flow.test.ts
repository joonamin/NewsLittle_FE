import { describe, expect, it } from "vitest";

import { homeFixture, memberNavigationFixture } from "@/mocks/fixtures";

import { toGlobalNavigationViewModel, toHomeViewModel } from "@/features/contracts/view-models";

import { homeFlowReducer, initialHomeFlowState, isHomeRoute } from "./home-flow";

describe("home flow reducer", () => {
  const home = toHomeViewModel(homeFixture);
  const navigation = toGlobalNavigationViewModel(memberNavigationFixture);

  it("keeps a pending article while a login or previous-list decision is required", () => {
    const loaded = homeFlowReducer(initialHomeFlowState, {
      type: "load-success",
      home,
      navigation,
    });
    const pending = homeFlowReducer(loaded, {
      type: "set-pending-selection",
      articleId: "article-science-class",
    });

    expect(pending.status).toBe("ready");
    expect(pending.pendingAction).toEqual({
      type: "select-article",
      articleId: "article-science-class",
    });
  });

  it("clears only the deferred action without discarding the refreshed home state", () => {
    const loaded = homeFlowReducer(initialHomeFlowState, {
      type: "load-success",
      home,
      navigation,
    });
    const cleared = homeFlowReducer(
      homeFlowReducer(loaded, { type: "set-pending-selection", articleId: "article-science-class" }),
      { type: "clear-pending-action" },
    );

    expect(cleared.home).toEqual(home);
    expect(cleared.pendingAction).toBeNull();
  });

  it("refreshes the home state only after a return to the home route", () => {
    expect(isHomeRoute("/")).toBe(true);
    expect(isHomeRoute("/?source=quiz")).toBe(true);
    expect(isHomeRoute("/quiz")).toBe(false);
  });

  it("keeps the authorized navigation when the home feed is temporarily unavailable", () => {
    const state = homeFlowReducer(initialHomeFlowState, { type: "navigation-success", navigation });

    expect(state.navigation.account.status).toBe("member");
    expect(state.home).toBeNull();
  });
});
