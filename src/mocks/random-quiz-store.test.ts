import { describe, expect, it } from "vitest";

import {
  abandonRandomQuizSession,
  createRandomQuizSession,
  nextRandomQuizQuestion,
  previousRandomQuizQuestion,
  submitRandomQuizAnswer,
} from "./random-quiz-store";

describe("random quiz mock store", () => {
  it("moves between reached questions and restores their resolution", () => {
    const session = createRandomQuizSession("choice");
    submitRandomQuizAnswer(session.id, "correct");

    const second = nextRandomQuizQuestion(session.id);
    expect(second.progress.current).toBe(2);
    expect(second.resolution).toBeNull();

    const previous = previousRandomQuizQuestion(session.id);
    expect(previous.progress.current).toBe(1);
    expect(previous.resolution).toMatchObject({
      outcome: "correct",
      userAnswer: "청소년",
    });

    expect(nextRandomQuizQuestion(session.id).progress.current).toBe(2);
  });

  it("does not skip an unresolved question", () => {
    const session = createRandomQuizSession("written");

    expect(nextRandomQuizQuestion(session.id).progress.current).toBe(1);
  });

  it("marks an in-progress session as abandoned", () => {
    const session = createRandomQuizSession("choice");

    expect(abandonRandomQuizSession(session.id).status).toBe("abandoned");
  });
});
