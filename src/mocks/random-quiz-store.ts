import type { QuizFormat, QuizSessionApiModel } from "@/features/contracts/api-models";

import { randomQuizSession, randomQuizTopics } from "./random-quiz-fixtures";

type SessionState = { format: QuizFormat; index: number; attempts: number[]; resolved: boolean };
const sessions = new Map<string, SessionState>();

function formatFromId(sessionId: string): QuizFormat {
  return sessionId.includes("written") ? "written" : "choice";
}

function stateFor(sessionId: string) {
  const existing = sessions.get(sessionId);
  if (existing) return existing;
  const created = { format: formatFromId(sessionId), index: 0, attempts: [0, 0, 0, 0, 0], resolved: false };
  sessions.set(sessionId, created);
  return created;
}

export function createRandomQuizSession(format: QuizFormat) {
  const session = randomQuizSession(format);
  sessions.set(session.id, { format, index: 0, attempts: [0, 0, 0, 0, 0], resolved: false });
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
    return randomQuizSession("choice", state.index, { outcome: isCorrect ? "correct" : "incorrect", userAnswer: label });
  }

  if (rawAnswer.trim().replaceAll(" ", "").includes(expected.replaceAll(" ", ""))) {
    state.resolved = true;
    return randomQuizSession("written", state.index, { outcome: "correct", userAnswer: rawAnswer.trim() });
  }

  const hintLevel = Math.min(state.attempts[state.index], 2) as 1 | 2;
  return randomQuizSession("written", state.index, null, hintLevel);
}

export function giveUpRandomQuizQuestion(sessionId: string) {
  const state = stateFor(sessionId);
  state.resolved = true;
  return randomQuizSession(state.format, state.index, { outcome: "given-up", userAnswer: null });
}

export function nextRandomQuizQuestion(sessionId: string) {
  const state = stateFor(sessionId);
  if (state.resolved && state.index < 4) state.index += 1;
  state.resolved = false;
  return randomQuizSession(state.format, state.index);
}
