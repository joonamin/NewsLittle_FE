import type {
  ArticleApiModel,
  QuizFormat,
  QuizPreviewApiModel,
  QuizPreviewCandidateApiModel,
  QuizResolutionApiModel,
  QuizSessionApiModel,
} from "@/features/contracts/api-models";

export type ShortformPreviewScenario =
  | "normal"
  | "empty"
  | "partial"
  | "twelve"
  | "written-unavailable"
  | "next-round";

type PreviewOptions = {
  scenario?: ShortformPreviewScenario;
  previousFormat?: QuizFormat;
};

type SessionSnapshot = {
  candidateIds: string[];
  candidateTitles: string[];
  format: QuizFormat;
};

type SessionState = {
  snapshot: SessionSnapshot;
  index: number;
  attempts: number[];
  history: Array<QuizResolutionApiModel | null>;
  status: QuizSessionApiModel["status"];
};

type QuestionContent = {
  answer: string;
  choicePrompt: string;
  choiceLabels: readonly [string, string];
  writtenPrompt: string;
  choiceContext: string;
  writtenContext: string;
  firstHint: string;
  secondHint: string;
  explanation: string;
};

const designCandidateTitles = [
  "도심의 열을 낮추는 나무, 그늘 이상의 역할",
  "기준금리가 내려가면 우리 생활은 어떻게 달라질까",
  "공공도서관에서 만나는 일상 속 인공지능",
  "지역 전통시장에 모바일 결제가 확대됩니다",
  "공공 와이파이 보안 점검이 강화됩니다",
  "시립미술관 야간 관람일이 늘어납니다",
  "청소년 과학 교실 참가 신청이 시작됐습니다",
  "재활용 분리배출 기준이 새롭게 바뀝니다",
  "지역 버스 노선이 출퇴근 시간에 증편됩니다",
  "초등 돌봄교실 운영 시간이 확대됩니다",
  "도심 하천 수질 조사 결과가 공개됐습니다",
  "공공 체육시설 예약 방식이 달라집니다",
] as const;

const questionContents: QuestionContent[] = [
  {
    answer: "증산",
    choicePrompt: "나무는 그늘을 만드는 것 외에도 수분을 내보내 주변 온도를 낮춘다.",
    choiceLabels: ["O", "X"],
    writtenPrompt: "식물이 잎에서 물을 수증기로 내보내는 현상을 무엇이라고 할까요?",
    choiceContext: "기사 기준 2026.09.14 · 맞으면 O, 틀리면 X를 골라주세요.",
    writtenContext: "기사 기준 2026.09.14 · 핵심 개념을 짧게 입력해 주세요.",
    firstHint: "양분을 만드는 과정이 아니라, 잎에서 물이 빠져나가는 과정을 떠올려보세요.",
    secondHint: "핵심 개념은 '증산'으로 시작해요. 다시 답하거나 포기할 수 있어요.",
    explanation: "식물이 잎을 통해 물을 수증기로 내보내는 현상을 증산이라고 해요.",
  },
  {
    answer: "대출 이자",
    choicePrompt: "기준금리가 내려가면 대출 이자 부담도 달라질 수 있다.",
    choiceLabels: ["O", "X"],
    writtenPrompt: "기준금리 변화가 가계의 어떤 비용에 영향을 줄 수 있나요?",
    choiceContext: "기사 기준 2026.09.14 · 맞으면 O, 틀리면 X를 골라주세요.",
    writtenContext: "기사 기준 2026.09.14 · 기사에서 설명한 생활 변화를 답해 주세요.",
    firstHint: "가계가 금융기관에 돈을 빌릴 때 부담하는 비용을 떠올려보세요.",
    secondHint: "핵심 표현은 '대출'로 시작해요. 다시 답하거나 포기할 수 있어요.",
    explanation: "기준금리 변화는 예금 금리와 함께 대출 이자 부담에도 영향을 줄 수 있어요.",
  },
  {
    answer: "인공지능",
    choicePrompt: "공공도서관의 새 프로그램은 일상 속 인공지능 활용을 다룬다.",
    choiceLabels: ["O", "X"],
    writtenPrompt: "공공도서관 새 프로그램이 다루는 핵심 기술은 무엇인가요?",
    choiceContext: "기사 기준 2026.09.14 · 맞으면 O, 틀리면 X를 골라주세요.",
    writtenContext: "기사 기준 2026.09.14 · 핵심 주제를 짧게 입력해 주세요.",
    firstHint: "사람의 학습과 판단을 컴퓨터로 구현하는 기술을 떠올려보세요.",
    secondHint: "핵심 표현은 '인공'으로 시작해요. 다시 답하거나 포기할 수 있어요.",
    explanation: "새 프로그램은 시민이 일상에서 인공지능을 이해하고 활용하도록 돕는 내용이에요.",
  },
];

const includedCandidates: QuizPreviewCandidateApiModel[] = designCandidateTitles.map(
  (title, index) => ({
    articleId: `shortform-article-${index + 1}`,
    title,
    status: "included",
    exclusionReason: null,
  }),
);

const preparingCandidate: QuizPreviewCandidateApiModel = {
  articleId: "shortform-article-preparing",
  title: "바다 관측 위성, 해수면 변화를 살피다",
  status: "excluded",
  exclusionReason: "preparing",
};

const expiredCandidate: QuizPreviewCandidateApiModel = {
  articleId: "shortform-article-expired",
  title: "지난달 지역 물가 동향",
  status: "excluded",
  exclusionReason: "expired",
};

const sessions = new Map<string, SessionState>();
let latestPreview = buildPreview({ scenario: "normal" });

function contentAt(index: number): QuestionContent {
  return questionContents[index % questionContents.length];
}

function articleFor(state: SessionState): ArticleApiModel {
  const articleId = state.snapshot.candidateIds[state.index];
  const title = state.snapshot.candidateTitles[state.index];
  return {
    id: articleId,
    title,
    source: {
      id: "source-demo-news",
      name: "데모 뉴스",
      originalUrl: `https://example.com/shortform/${articleId}`,
      publishedAt: "2026-09-14T09:00:00+09:00",
    },
    topicIds: ["shortform"],
    summary: {
      status: "available",
      text: null,
      aiGenerated: true,
      reviewedAt: "2026-09-14T10:00:00+09:00",
    },
    image: null,
    availability: { feed: "published", original: "available" },
  };
}

function sessionFromState(sessionId: string, state: SessionState): QuizSessionApiModel {
  const total = state.snapshot.candidateIds.length;
  const content = contentAt(state.index);
  const article = total > 0 ? articleFor(state) : null;
  const hintLevel = Math.min(state.attempts[state.index] ?? 0, 2) as 0 | 1 | 2;
  const semanticQuestion = state.index % 2 === 1;
  const resolution = state.history[state.index] ?? null;

  return {
    id: sessionId,
    domain: "shortform",
    format: state.snapshot.format,
    status: state.status,
    progress: {
      current: total > 0 ? state.index + 1 : 0,
      total,
      processed: state.history.filter(Boolean).length,
    },
    question: article
      ? {
          id: `shortform-question-${state.snapshot.format}-${state.index + 1}`,
          articleId: article.id,
          articleTitle: article.title,
          kind: semanticQuestion ? "semantic" : "fact",
          prompt:
            state.snapshot.format === "choice" ? content.choicePrompt : content.writtenPrompt,
          context:
            state.snapshot.format === "choice"
              ? content.choiceContext
              : content.writtenContext,
          choices:
            state.snapshot.format === "choice"
              ? content.choiceLabels.map((label, index) => ({
                  id: index === 0 ? "correct" : "wrong",
                  label,
                }))
              : null,
          hint:
            hintLevel === 0
              ? { level: 0, text: null }
              : hintLevel === 1
                ? {
                    level: 1,
                    text: content.firstHint,
                  }
                : {
                    level: 2,
                    text: content.secondHint,
                  },
          judgementFeedback:
            semanticQuestion && hintLevel > 0
              ? {
                  similarityScore: hintLevel === 1 ? 35 : 65,
                  missingDirection: "기사에서 사용한 핵심 표현을 답에 포함해 보세요.",
                }
              : null,
        }
      : null,
    resolution,
  };
}

function stateFor(sessionId: string) {
  const existing = sessions.get(sessionId);
  if (existing) return existing;

  const format: QuizFormat = sessionId.includes("written") ? "written" : "choice";
  const candidates = includedCandidates.slice(0, 3);
  const created: SessionState = {
    snapshot: {
      candidateIds: candidates.map((candidate) => candidate.articleId),
      candidateTitles: candidates.map((candidate) => candidate.title),
      format,
    },
    index: 0,
    attempts: candidates.map(() => 0),
    history: candidates.map(() => null),
    status: "in-progress",
  };
  sessions.set(sessionId, created);
  return created;
}

function resolutionFor(
  state: SessionState,
  outcome: QuizResolutionApiModel["outcome"],
  userAnswer: string | null,
): QuizResolutionApiModel {
  const content = contentAt(state.index);
  return {
    outcome,
    userAnswer,
    correctAnswer:
      state.snapshot.format === "choice" ? content.choiceLabels[0] : content.answer,
    explanation: content.explanation,
    semanticFeedback: null,
    evidence: articleFor(state),
  };
}

function buildPreview({
  scenario = "normal",
  previousFormat = "choice",
}: PreviewOptions): QuizPreviewApiModel {
  const candidates = (() => {
    switch (scenario) {
      case "empty":
        return [preparingCandidate, expiredCandidate];
      case "twelve":
        return includedCandidates;
      case "next-round":
        return includedCandidates.slice(10);
      case "partial":
      case "written-unavailable":
      case "normal":
        return [...includedCandidates.slice(0, 3), preparingCandidate];
    }
  })();
  const eligibleCount = candidates.filter((candidate) => candidate.status === "included").length;
  const hasEligibleCandidates = eligibleCount > 0;
  const writtenAvailable = hasEligibleCandidates && scenario !== "written-unavailable";

  return {
    domain: "shortform",
    defaultFormat: scenario === "next-round" ? previousFormat : "choice",
    formatAvailability: {
      choice: {
        enabled: hasEligibleCandidates,
        reason: hasEligibleCandidates ? null : "출제 가능한 기사가 없어요.",
      },
      written: {
        enabled: writtenAvailable,
        reason: writtenAvailable
          ? null
          : scenario === "written-unavailable"
            ? "주관식 판정 서비스를 사용할 수 없어요."
            : "출제 가능한 기사가 없어요.",
      },
    },
    plannedQuestionCount: Math.min(eligibleCount, 10),
    remainingCandidateCount: Math.max(eligibleCount - 10, 0),
    candidates,
  };
}

export function getShortformQuizPreview(options: PreviewOptions = {}) {
  latestPreview = buildPreview(options);
  return structuredClone(latestPreview);
}

export function createShortformQuizSession(format: QuizFormat) {
  const selectedCandidates = latestPreview.candidates
    .filter((candidate) => candidate.status === "included")
    .slice(0, 10);
  const sessionId = `shortform-demo-${format}-session`;
  const state: SessionState = {
    snapshot: {
      candidateIds: selectedCandidates.map((candidate) => candidate.articleId),
      candidateTitles: selectedCandidates.map((candidate) => candidate.title),
      format,
    },
    index: 0,
    attempts: selectedCandidates.map(() => 0),
    history: selectedCandidates.map(() => null),
    status: "in-progress",
  };
  sessions.set(sessionId, state);
  return structuredClone(sessionFromState(sessionId, state));
}

export function getShortformQuizSession(sessionId: string) {
  return structuredClone(sessionFromState(sessionId, stateFor(sessionId)));
}

export function getShortformSessionSnapshot(sessionId: string) {
  const snapshot = sessions.get(sessionId)?.snapshot;
  return snapshot ? structuredClone(snapshot) : null;
}

export function submitShortformQuizAnswer(sessionId: string, rawAnswer: string) {
  const state = stateFor(sessionId);
  const answer = rawAnswer.trim();
  if (!answer) throw new Error("EMPTY_ANSWER");

  const content = contentAt(state.index);
  if (state.snapshot.format === "choice") {
    state.history[state.index] = resolutionFor(
      state,
      answer === "correct" ? "correct" : "incorrect",
      answer === "correct" ? content.choiceLabels[0] : content.choiceLabels[1],
    );
    return structuredClone(sessionFromState(sessionId, state));
  }

  const normalizedAnswer = answer.replaceAll(" ", "");
  if (normalizedAnswer.includes(content.answer.replaceAll(" ", ""))) {
    state.history[state.index] = resolutionFor(state, "correct", answer);
  } else {
    state.attempts[state.index] = Math.min((state.attempts[state.index] ?? 0) + 1, 2);
  }
  return structuredClone(sessionFromState(sessionId, state));
}

export function giveUpShortformQuizQuestion(sessionId: string) {
  const state = stateFor(sessionId);
  state.history[state.index] = resolutionFor(state, "given-up", null);
  return structuredClone(sessionFromState(sessionId, state));
}

export function nextShortformQuizQuestion(sessionId: string) {
  const state = stateFor(sessionId);
  const isLastQuestion = state.index >= state.snapshot.candidateIds.length - 1;
  if (state.history[state.index] && !isLastQuestion) {
    state.index += 1;
  }
  return structuredClone(sessionFromState(sessionId, state));
}

export function previousShortformQuizQuestion(sessionId: string) {
  const state = stateFor(sessionId);
  if (state.index > 0) state.index -= 1;
  return structuredClone(sessionFromState(sessionId, state));
}

export function isShortformPreviewScenario(value: string | null): value is ShortformPreviewScenario {
  return ["normal", "empty", "partial", "twelve", "written-unavailable", "next-round"].includes(
    value ?? "",
  );
}
