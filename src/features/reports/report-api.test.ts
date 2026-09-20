import { afterEach, describe, expect, it, vi } from "vitest";

import { reportApi } from "./report-api";

describe("report API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("posts the backend camelCase contract and returns the receipt", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      data: {
        id: "41",
        reportType: "JUDGMENT_ERROR",
        surface: "QUIZ",
        status: "RECEIVED",
        contactProvided: false,
        judgmentAttachment: { answerRef: "shortform:8", submittedAnswer: "O", quizVersion: 2, judgeVersion: "v3" },
        createdAt: "2026-09-20T12:00:00+09:00",
      },
      meta: { requestId: "report-test" },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await reportApi.submit({
      reportType: "JUDGMENT_ERROR",
      surface: "QUIZ",
      articleId: "12",
      quizId: "7",
      answerRef: "shortform:8",
      details: "정답인데 오답으로 처리됐습니다.",
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/reports", expect.objectContaining({
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ reportType: "JUDGMENT_ERROR", surface: "QUIZ", articleId: "12", quizId: "7", answerRef: "shortform:8", details: "정답인데 오답으로 처리됐습니다." }),
    }));
    expect(result.judgmentAttachment?.submittedAnswer).toBe("O");
  });
});
