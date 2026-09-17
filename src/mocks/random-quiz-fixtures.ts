import type { ArticleApiModel, QuizFormat, QuizSessionApiModel } from "@/features/contracts/api-models";

export const randomQuizTopics = [
  ["science", "청소년 과학 교실 참가 신청이 시작됐습니다", "청소년", "청소년 대상 과학 교실의 참가 신청 일정을 안내합니다."],
  ["environment", "도심 나무가 주변 온도를 낮추는 원리", "증산", "나무의 증산 작용과 그늘이 도심 열을 낮추는 원리를 설명합니다."],
  ["economy", "지역 전통시장에 모바일 결제가 확대됩니다", "모바일 결제", "전통시장 이용 편의를 위해 모바일 결제 지원을 확대합니다."],
  ["technology", "공공 와이파이 보안 점검이 강화됩니다", "보안 점검", "공공 와이파이의 안전한 이용을 위한 보안 점검 계획입니다."],
  ["culture", "시립미술관 야간 관람일이 늘어납니다", "금요일", "시립미술관이 금요일 야간 관람 운영을 확대합니다."],
] as const;

const articles: ArticleApiModel[] = randomQuizTopics.map(([topic, title, , summary], index) => ({
  id: `random-article-${index + 1}`,
  title,
  source: { id: "source-demo", name: "데모 뉴스", originalUrl: `https://example.com/random/${index + 1}`, publishedAt: `2026-09-${13 - index}T09:00:00+09:00` },
  topicIds: [topic],
  summary: { status: "available", text: summary, aiGenerated: true, reviewedAt: `2026-09-${13 - index}T10:00:00+09:00` },
  image: null,
  availability: { feed: "published", original: "available" },
}));

const choicePrompts = [
  ["과학 교실의 참가 대상은 누구인가요?", ["청소년", "성인"]],
  ["나무가 수분을 내보내 주변 열을 낮추는 작용은 무엇인가요?", ["증산", "응결"]],
  ["전통시장에 확대되는 결제 방식은 무엇인가요?", ["모바일 결제", "수표 결제"]],
  ["공공 와이파이에서 강화되는 것은 무엇인가요?", ["보안 점검", "광고 노출"]],
  ["시립미술관 야간 관람을 확대하는 요일은 언제인가요?", ["금요일", "월요일"]],
] as const;

type ResolutionInput = { outcome: "correct" | "incorrect" | "given-up"; userAnswer: string | null } | null;

export function randomQuizSession(format: QuizFormat, index = 0, resolutionInput: ResolutionInput = null, hintLevel: 0 | 1 | 2 = 0): QuizSessionApiModel {
  const article = articles[index];
  const answer = randomQuizTopics[index][2];
  const prompt = format === "choice" ? choicePrompts[index][0] : `${article.title} 기사에서 핵심적으로 안내한 내용은 무엇인가요?`;
  return {
    id: format === "choice" ? "random-demo-session" : "random-written-demo-session",
    domain: "random",
    format,
    status: "in-progress",
    progress: { current: index + 1, total: 5, processed: index + (resolutionInput ? 1 : 0) },
    question: {
      id: `random-question-${format}-${index + 1}`,
      articleId: article.id,
      articleTitle: article.title,
      kind: format === "written" ? "semantic" : "fact",
      prompt,
      context: format === "written" ? "핵심 내용을 자신의 말로 답해 보세요." : "기사의 핵심 정보를 확인하는 선택형 문항입니다.",
      choices: format === "choice" ? choicePrompts[index][1].map((label, choiceIndex) => ({ id: choiceIndex === 0 ? "correct" : "wrong", label })) : null,
      hint: hintLevel === 0 ? { level: 0, text: null } : hintLevel === 1
        ? { level: 1, text: "기사 제목과 핵심 대상·개념을 다시 확인해 보세요." }
        : { level: 2, text: `핵심 표현은 ‘${answer.slice(0, Math.max(1, Math.ceil(answer.length / 2)))}’로 시작해요.` },
      judgementFeedback: hintLevel === 0 ? null : {
        similarityScore: hintLevel === 1 ? 35 : 65,
        missingDirection: "기사에서 사용한 핵심 표현을 답에 포함해 보세요.",
      },
    },
    resolution: resolutionInput ? {
      outcome: resolutionInput.outcome,
      userAnswer: resolutionInput.userAnswer,
      correctAnswer: answer,
      explanation: `${article.summary.text} 정답은 ‘${answer}’입니다.`,
      semanticFeedback: null,
      evidence: article,
    } : null,
  };
}
