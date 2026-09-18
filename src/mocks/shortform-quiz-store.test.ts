import { describe, expect, it } from "vitest";

import {
  abandonShortformQuizSession,
  createShortformQuizSession,
  excludeShortformQuizQuestion,
  getShortformQuizPreview,
  getShortformQuizResult,
  getShortformQuizSession,
  getShortformSessionSnapshot,
  giveUpShortformQuizQuestion,
  nextShortformQuizQuestion,
  previousShortformQuizQuestion,
  submitShortformQuizAnswer,
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

  it("resolves a choice answer without changing the frozen session order", () => {
    getShortformQuizPreview({ scenario: "normal" });
    const session = createShortformQuizSession("choice");
    const snapshot = getShortformSessionSnapshot(session.id);

    const resolved = submitShortformQuizAnswer(session.id, "wrong");

    expect(resolved.resolution).toMatchObject({
      outcome: "incorrect",
      userAnswer: "X",
      correctAnswer: "O",
    });
    expect(getShortformSessionSnapshot(session.id)).toEqual(snapshot);
  });

  it("reveals written hints in order and only shows semantic feedback for semantic questions", () => {
    getShortformQuizPreview({ scenario: "normal" });
    const session = createShortformQuizSession("written");

    const firstHint = submitShortformQuizAnswer(session.id, "광합성");
    expect(firstHint.question).toMatchObject({
      kind: "fact",
      hint: { level: 1 },
      judgementFeedback: null,
    });

    const secondHint = submitShortformQuizAnswer(session.id, "수분 배출");
    expect(secondHint.question?.hint.level).toBe(2);

    const resolved = submitShortformQuizAnswer(session.id, "증산 작용");
    expect(resolved.resolution).toMatchObject({ outcome: "correct", userAnswer: "증산 작용" });

    nextShortformQuizQuestion(session.id);
    const semanticHint = submitShortformQuizAnswer(session.id, "생활비");
    expect(semanticHint.question).toMatchObject({
      kind: "semantic",
      hint: { level: 1 },
      judgementFeedback: {
        similarityScore: 35,
        missingDirection: "기사에서 사용한 핵심 표현을 답에 포함해 보세요.",
      },
    });
  });

  it("reveals the answer on give-up and advances only after resolution", () => {
    getShortformQuizPreview({ scenario: "normal" });
    const session = createShortformQuizSession("written");

    expect(nextShortformQuizQuestion(session.id).progress.current).toBe(1);

    const givenUp = giveUpShortformQuizQuestion(session.id);
    expect(givenUp.resolution).toMatchObject({ outcome: "given-up", correctAnswer: "증산" });

    const next = nextShortformQuizQuestion(session.id);
    expect(next.progress.current).toBe(2);
    expect(next.resolution).toBeNull();
    expect(getShortformQuizSession(session.id).question?.articleId).toBe("shortform-article-2");

    const previous = previousShortformQuizQuestion(session.id);
    expect(previous.progress.current).toBe(1);
    expect(previous.resolution).toMatchObject({ outcome: "given-up", correctAnswer: "증산" });

    expect(nextShortformQuizQuestion(session.id).progress.current).toBe(2);
  });

  it("restores a direct-entry mock session from the session id", () => {
    const session = getShortformQuizSession("shortform-direct-written-session");

    expect(session).toMatchObject({
      id: "shortform-direct-written-session",
      domain: "shortform",
      format: "written",
      progress: { current: 1, total: 3, processed: 0 },
    });
  });

  it("marks a changed-rights question as service-excluded without an answer", () => {
    const sessionId = "shortform-service-excluded-written-session";
    getShortformQuizSession(sessionId);

    const excluded = excludeShortformQuizQuestion(sessionId);

    expect(excluded.resolution).toMatchObject({
      outcome: "service-excluded",
      userAnswer: null,
      correctAnswer: null,
    });
    expect(excluded.progress.processed).toBe(1);
  });

  it("represents a session with zero valid questions as ended by service", () => {
    const ended = getShortformQuizSession("shortform-service-ended-written-session");

    expect(ended).toMatchObject({
      status: "ended-by-service",
      progress: { current: 0, total: 0, processed: 0 },
      question: null,
      resolution: null,
    });
  });

  it("keeps the resolution while marking an unavailable original article", () => {
    const sessionId = "shortform-original-unavailable-choice-session";
    getShortformQuizSession(sessionId);

    const resolved = submitShortformQuizAnswer(sessionId, "correct");

    expect(resolved.resolution).toMatchObject({
      outcome: "correct",
      evidence: { availability: { original: "unavailable" } },
    });
  });

  it("marks an in-progress session as abandoned without changing its snapshot", () => {
    getShortformQuizPreview({ scenario: "normal" });
    const session = createShortformQuizSession("choice");
    const snapshot = getShortformSessionSnapshot(session.id);

    const abandoned = abandonShortformQuizSession(session.id);

    expect(abandoned.status).toBe("abandoned");
    expect(getShortformSessionSnapshot(session.id)).toEqual(snapshot);
  });

  it("computes shortform quiz result with planned, processed, and outcome breakdown", () => {
    const sessionId = "shortform-demo-session";
    getShortformQuizSession(sessionId);
    submitShortformQuizAnswer(sessionId, "correct");

    const result = getShortformQuizResult(sessionId);

    expect(result).toMatchObject({
      sessionId,
      domain: "shortform",
      status: "completed",
      summary: {
        planned: 3,
        processed: 3,
        correct: 2,
      },
      remainingCandidateCount: 0,
    });
    expect(result.explanations).toHaveLength(3);
    expect(result.explanations[0].evidence.title).toBeTruthy();
  });

  it("indicates remaining candidates when session is from a twelve candidate split", () => {
    const result = getShortformQuizResult("shortform-twelve-session");

    expect(result.remainingCandidateCount).toBe(2);
  });

  it("returns service-ended result when session was ended by service", () => {
    const result = getShortformQuizResult("shortform-service-ended-written-session");

    expect(result).toMatchObject({
      status: "ended-by-service",
      summary: { planned: 0, processed: 0, correct: 0 },
      remainingCandidateCount: 0,
    });
  });
});
