import type {
  QuizFormat,
  QuizPreviewApiModel,
  QuizPreviewCandidateApiModel,
  QuizSessionApiModel,
} from "@/features/contracts/api-models";

import { createShortformSessionFixture } from "./fixtures";

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

const sessions = new Map<string, { session: QuizSessionApiModel; snapshot: SessionSnapshot }>();
let latestPreview = buildPreview({ scenario: "normal" });

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
  const session = createShortformSessionFixture(format);
  session.progress = {
    current: selectedCandidates.length > 0 ? 1 : 0,
    total: selectedCandidates.length,
    processed: 0,
  };
  if (session.question && selectedCandidates[0]) {
    session.question.articleId = selectedCandidates[0].articleId;
    session.question.articleTitle = selectedCandidates[0].title;
  }

  sessions.set(session.id, {
    session: structuredClone(session),
    snapshot: {
      candidateIds: selectedCandidates.map((candidate) => candidate.articleId),
      candidateTitles: selectedCandidates.map((candidate) => candidate.title),
      format,
    },
  });
  return structuredClone(session);
}

export function getShortformQuizSession(sessionId: string) {
  return structuredClone(sessions.get(sessionId)?.session ?? createShortformSessionFixture("choice"));
}

export function getShortformSessionSnapshot(sessionId: string) {
  const snapshot = sessions.get(sessionId)?.snapshot;
  return snapshot ? structuredClone(snapshot) : null;
}

export function isShortformPreviewScenario(value: string | null): value is ShortformPreviewScenario {
  return ["normal", "empty", "partial", "twelve", "written-unavailable", "next-round"].includes(
    value ?? "",
  );
}
