import { describe, expect, it } from "vitest";

import { validateReportInput } from "./report-models";
import { toQuizResultViewModel } from "@/features/contracts/view-models";

const homeTarget = { surface: "HOME_CARD" as const, articleId: "12", articleTitle: "기사" };

describe("report input validation", () => {
  it("accepts a home content-error report", () => {
    expect(validateReportInput({ reportType: "CONTENT_ERROR", details: "요약이 원문과 달라요.", contact: "", target: homeTarget })).toBeNull();
  });

  it("requires an explicitly entered contact for rights reports", () => {
    expect(validateReportInput({ reportType: "RIGHTS", details: "권리 확인이 필요합니다.", contact: "", target: homeTarget })).toMatch(/연락/);
  });

  it("requires server-issued quizId and answerRef for judgment reports", () => {
    expect(validateReportInput({ reportType: "JUDGMENT_ERROR", details: "판정이 이상합니다.", contact: "", target: { surface: "QUIZ", articleId: "12", articleTitle: "기사", quizId: "3", answerRef: "random:9" } })).toBeNull();
    expect(validateReportInput({ reportType: "JUDGMENT_ERROR", details: "판정이 이상합니다.", contact: "", target: { surface: "QUIZ", articleId: "12", articleTitle: "기사", answerRef: "random:9" } })).toMatch(/판정 정보/);
  });

  it("preserves server-issued report identifiers in quiz result view models", () => {
    const result = toQuizResultViewModel({
      sessionId: "session-1",
      domain: "random",
      status: "completed",
      format: "choice",
      summary: { planned: 1, processed: 1, correct: 1, choiceIncorrect: 0, givenUp: 0, excludedByService: 0, writtenCorrect: { firstAttempt: 0, retryWithoutHint: 0, retryWithHint: 0 } },
      explanations: [{
        quizId: "7",
        answerRef: "random:9",
        outcome: "correct",
        userAnswer: "O",
        correctAnswer: "O",
        explanation: "해설",
        semanticFeedback: null,
        evidence: {
          id: "12",
          title: "기사",
          source: { id: "source-1", name: "뉴스", originalUrl: "https://example.com/12", publishedAt: "2026-09-20T00:00:00Z" },
          topicIds: ["SOCIETY"],
          summary: { status: "available", text: "요약", aiGenerated: true, reviewedAt: null },
          body: { status: "available", text: "본문" },
          image: null,
          availability: { feed: "published", original: "available" },
        },
      }],
      remainingCandidateCount: 0,
    });

    expect(result.recapItems[0]).toMatchObject({ articleId: "12", quizId: "7", answerRef: "random:9" });
  });
});
