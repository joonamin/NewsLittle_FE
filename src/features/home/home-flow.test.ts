import { describe, expect, it } from "vitest";

import { homeFlowReducer, initialHomeFlowState, isHomeRoute } from "./home-flow";

describe("home flow reducer", () => {
  it("keeps a pending article while a login or previous-list decision is required", () => {
    const pending = homeFlowReducer(initialHomeFlowState, {
      type: "set-pending-selection",
      articleId: "article-science-class",
    });

    expect(pending.pendingAction).toEqual({
      type: "select-article",
      articleId: "article-science-class",
    });
  });

  it("clears only the deferred action without closing login", () => {
    const opened = homeFlowReducer(
      homeFlowReducer(initialHomeFlowState, {
        type: "set-pending-selection",
        articleId: "article-science-class",
      }),
      { type: "open-login" },
    );
    const cleared = homeFlowReducer(opened, { type: "clear-pending-action" });

    expect(cleared.pendingAction).toBeNull();
    expect(cleared.loginOpen).toBe(true);
  });

  it("refreshes the home query only after a return to the home route", () => {
    expect(isHomeRoute("/")).toBe(true);
    expect(isHomeRoute("/?source=quiz")).toBe(true);
    expect(isHomeRoute("/quiz")).toBe(false);
  });
});
