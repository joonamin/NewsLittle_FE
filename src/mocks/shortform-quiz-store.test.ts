import { describe, expect, it } from "vitest";

import {
  createShortformQuizSession,
  getShortformQuizPreview,
} from "./shortform-quiz-store";

describe("shortform quiz mock store", () => {
  it("provides a quiz-owned preview fixture", () => {
    expect(getShortformQuizPreview()).toMatchObject({
      domain: "shortform",
      plannedQuestionCount: 1,
      candidates: [{ status: "included" }],
    });
  });

  it("creates a session for the selected format", () => {
    expect(createShortformQuizSession("written")).toMatchObject({
      id: "shortform-demo-written-session",
      domain: "shortform",
      format: "written",
    });
  });
});
