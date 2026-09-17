import type { QuizFormat, QuizResolutionApiModel, QuizResultApiModel, QuizSessionApiModel } from "@/features/contracts/api-models";

import { articles, choicePrompts, randomQuizSession, randomQuizTopics } from "./random-quiz-fixtures";

type ResolutionRecord = { outcome: "correct" | "incorrect" | "given-up" | "service-excluded"; userAnswer: string | null };
type SessionState = { format: QuizFormat; index: number; attempts: number[]; resolved: boolean; history: Array<ResolutionRecord | null> };
const sessions = new Map<string, SessionState>();

function formatFromId(sessionId: string): QuizFormat {
  return sessionId.includes("written") ? "written" : "choice";
}

function stateFor(sessionId: string) {
  const existing = sessions.get(sessionId);
  if (existing) return existing;
  const created: SessionState = { format: formatFromId(sessionId), index: 0, attempts: [0, 0, 0, 0, 0], resolved: false, history: [null, null, null, null, null] };
  sessions.set(sessionId, created);
  return created;
}

export function createRandomQuizSession(format: QuizFormat) {
  const session = randomQuizSession(format);
  sessions.set(session.id, { format, index: 0, attempts: [0, 0, 0, 0, 0], resolved: false, history: [null, null, null, null, null] });
  return session;
}

export function getRandomQuizSession(sessionId: string) {
  const state = stateFor(sessionId);
  return randomQuizSession(state.format, state.index);
}

export function submitRandomQuizAnswer(sessionId: string, rawAnswer: string): QuizSessionApiModel {
  const state = stateFor(sessionId);
  const expected = randomQuizTopics[state.index][2];
  state.attempts[state.index] += 1;

  if (state.format === "choice") {
    state.resolved = true;
    const isCorrect = rawAnswer === "correct";
    const label = isCorrect ? expected : "선택한 오답";
    const outcome = isCorrect ? "correct" : "incorrect";
    state.history[state.index] = { outcome, userAnswer: label };
    return randomQuizSession("choice", state.index, { outcome, userAnswer: label });
  }

  if (rawAnswer.trim().replaceAll(" ", "").includes(expected.replaceAll(" ", ""))) {
    state.resolved = true;
    state.history[state.index] = { outcome: "correct", userAnswer: rawAnswer.trim() };
    return randomQuizSession("written", state.index, { outcome: "correct", userAnswer: rawAnswer.trim() });
  }

  const hintLevel = Math.min(state.attempts[state.index], 2) as 1 | 2;
  return randomQuizSession("written", state.index, null, hintLevel);
}

export function giveUpRandomQuizQuestion(sessionId: string) {
  const state = stateFor(sessionId);
  state.resolved = true;
  state.history[state.index] = { outcome: "given-up", userAnswer: null };
  return randomQuizSession(state.format, state.index, { outcome: "given-up", userAnswer: null });
}

export function nextRandomQuizQuestion(sessionId: string) {
  const state = stateFor(sessionId);
  if (state.resolved && state.index < 4) state.index += 1;
  state.resolved = false;
  return randomQuizSession(state.format, state.index);
}

export function getRandomQuizResult(sessionId: string): QuizResultApiModel {
  const state = stateFor(sessionId);
  const explanations: QuizResolutionApiModel[] = randomQuizTopics.map(([, title, answer, summary], i) => {
    const recorded = state.history[i];
    const outcome = recorded ? recorded.outcome : (i === 3 ? "service-excluded" : (i % 2 === 0 ? "correct" : "incorrect"));
    const userAnswer = outcome === "given-up" || outcome === "service-excluded"
      ? null
      : (recorded?.userAnswer ?? (outcome === "correct" ? answer : "선택한 오답"));
    const prompt = state.format === "choice"
      ? choicePrompts[i][0]
      : `${title} 기사에서 핵심적으로 안내한 내용은 무엇인가요?`;

    return {
      prompt,
      outcome,
      userAnswer,
      correctAnswer: outcome === "service-excluded" ? null : answer,
      explanation: outcome === "service-excluded"
        ? "기사 발행사의 권리 요청으로 문항 서비스가 제외되었습니다."
        : `${summary} 정답은 ‘${answer}’입니다.`,
      semanticFeedback: null,
      evidence: articles[i],
    };
  });

  const correct = explanations.filter((e) => e.outcome === "correct").length;
  const choiceIncorrect = explanations.filter((e) => e.outcome === "incorrect").length;
  const givenUp = explanations.filter((e) => e.outcome === "given-up").length;
  const excludedByService = explanations.filter((e) => e.outcome === "service-excluded").length;

  return {
    sessionId,
    domain: "random",
    status: "completed",
    format: state.format,
    summary: {
      planned: 5,
      processed: 5 - excludedByService,
      correct,
      choiceIncorrect,
      givenUp,
      excludedByService,
      writtenCorrect: {
        firstAttempt: state.format === "written" ? correct : 0,
        retryWithoutHint: 0,
        retryWithHint: 0,
      },
    },
    explanations,
    remainingCandidateCount: 12,
  };
}
