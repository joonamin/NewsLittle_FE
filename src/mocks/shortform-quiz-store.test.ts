import { describe, expect, it } from "vitest";

import {
  createShortformQuizSession,
  getShortformQuizPreview,
  getShortformSessionSnapshot,
} from "./shortform-quiz-store";

describe("shortform quiz mock store", () => {
  it("matches the SCR-03 normal design example", () => {
    const preview = getShortformQuizPreview({ scenario: "normal" });
    expect(preview).toMatchObject({ domain: "shortform", plannedQuestionCount: 3, remainingCandidateCount: 0 });
    expect(preview.candidates.filter((candidate) => candidate.status === "included")).toHaveLength(3);
    expect(preview.candidates).toContainEqual(
      expect.objectContaining({ status: "excluded", exclusionReason: "preparing" }),
    );
  });

  it("blocks session creation data when every candidate is excluded", () => {
    const preview = getShortformQuizPreview({ scenario: "empty" });
    expect(preview.plannedQuestionCount).toBe(0);
    expect(preview.formatAvailability.choice.enabled).toBe(false);
    expect(preview.candidates.every((candidate) => candidate.status === "excluded")).toBe(true);
  });

  it("splits twelve eligible candidates into ten now and two remaining", () => {
    const preview = getShortformQuizPreview({ scenario: "twelve" });
    expect(preview.plannedQuestionCount).toBe(10);
    expect(preview.remainingCandidateCount).toBe(2);
  });

  it("disables only written format when judgement is unavailable", () => {
    const preview = getShortformQuizPreview({ scenario: "written-unavailable" });
    expect(preview.formatAvailability.choice.enabled).toBe(true);
    expect(preview.formatAvailability.written).toEqual({
      enabled: false,
      reason: "주관식 판정 서비스를 사용할 수 없어요.",
    });
  });

  it("uses the previous format and only remaining candidates for the next round", () => {
    const preview = getShortformQuizPreview({ scenario: "next-round", previousFormat: "written" });
    expect(preview.defaultFormat).toBe("written");
    expect(preview.plannedQuestionCount).toBe(2);
    expect(preview.candidates.map((candidate) => candidate.articleId)).toEqual([
      "shortform-article-11",
      "shortform-article-12",
    ]);
  });

  it("freezes candidates and their order when creating a session", () => {
    getShortformQuizPreview({ scenario: "twelve" });
    const session = createShortformQuizSession("choice");
    const snapshotBeforeChange = getShortformSessionSnapshot(session.id);
    getShortformQuizPreview({ scenario: "empty" });

    expect(session.progress.total).toBe(10);
    expect(snapshotBeforeChange?.candidateIds).toEqual(
      Array.from({ length: 10 }, (_, index) => `shortform-article-${index + 1}`),
    );
    expect(getShortformSessionSnapshot(session.id)).toEqual(snapshotBeforeChange);
  });
});
