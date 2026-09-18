import { beforeEach, describe, expect, it } from "vitest";

import { createAdminReviewStore } from "./admin-review-store";

describe("admin review store", () => {
  let store: ReturnType<typeof createAdminReviewStore>;

  beforeEach(() => {
    store = createAdminReviewStore();
  });

  it("returns review queue summary with all loaded articles", () => {
    const summary = store.getQueueSummary();

    expect(summary.totalCount).toBeGreaterThanOrEqual(4);
    expect(summary.items[0]).toMatchObject({
      articleId: 3,
      articleCode: "N-0913-03",
      usageBasisStatus: "CONDITIONAL",
    });
    expect(summary.items[0].bodyDeletionHoursRemaining).toBe(18);
  });

  it("retrieves article review with body, summary, and quiz items", () => {
    const review = store.getArticleReview(3);

    expect(review).not.toBeNull();
    expect(review?.articleId).toBe(3);
    expect(review?.bodyText).toContain("이재명");
    expect(review?.quizzes.length).toBe(3);

    // Contains OX, Multiple Choice, Subjective formats
    const formats = review?.quizzes.map((q) => q.answer_format);
    expect(formats).toContain("OX");
    expect(formats).toContain("MULTIPLE_CHOICE");
    expect(formats).toContain("SUBJECTIVE");
  });

  it("approves article for home and quiz delivery", () => {
    const approved = store.submitDecision(3, {
      decisionType: "APPROVE",
      homeApproved: true,
      quizApproved: true,
    });

    expect(approved.homeApproved).toBe(true);
    expect(approved.quizApproved).toBe(true);
    expect(approved.summary.reviewStatus).toBe("APPROVED");
    expect(approved.quizzes.every((q) => q.review_status === "APPROVED")).toBe(true);
    expect(approved.quizzes[0].reviewed_by).toBe("dev-admin@newslittle.local");
  });

  it("rejects article with mandatory reason and marks status as REJECTED", () => {
    const rejected = store.submitDecision(3, {
      decisionType: "REJECT",
      reason: "원문 대조 결과 오정보가 포함되어 있습니다.",
    });

    expect(rejected.homeApproved).toBe(false);
    expect(rejected.quizApproved).toBe(false);
    expect(rejected.summary.reviewStatus).toBe("REJECTED");
    expect(rejected.rejectedReason).toBe("원문 대조 결과 오정보가 포함되어 있습니다.");
    expect(rejected.quizzes.every((q) => q.review_status === "REJECTED")).toBe(true);
  });

  it("requests regeneration and resets quiz review status to PENDING", () => {
    // First approve
    store.submitDecision(3, {
      decisionType: "APPROVE",
      homeApproved: true,
      quizApproved: true,
    });

    // Then request regeneration
    const regen = store.submitDecision(3, {
      decisionType: "REGENERATE",
      reason: "퀴즈 난이도 재조정 필요",
    });

    expect(regen.homeApproved).toBe(false);
    expect(regen.summary.reviewStatus).toBe("PENDING");
    expect(regen.quizzes.every((q) => q.review_status === "PENDING")).toBe(true);
    expect(regen.rejectedReason).toContain("퀴즈 난이도 재조정 필요");
  });

  it("throws an error when article ID is not found", () => {
    expect(() =>
      store.submitDecision(99999, {
        decisionType: "APPROVE",
        homeApproved: true,
        quizApproved: true,
      }),
    ).toThrow("not found in review queue");
  });
});
