/**
 * [안내]
 * 도메인 API 인터페이스 및 화면 요구사항 정의는 초기 설계 단계이며 아직 완전하게 고도화되지 않았습니다.
 * 상위 API 모델의 변경 및 요구사항 고도화에 맞춰 뷰 모델 및 매핑 함수가 추후 변경될 가능성이 존재합니다.
 */

import type {
  ArchiveApiModel,
  ArticleApiModel,
  HomeApiModel,
  QuizPreviewApiModel,
  QuizResultApiModel,
  QuizSessionApiModel,
  SettingsApiModel,
} from "./api-models";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function mapArticleCard(article: ArticleApiModel) {
  return {
    id: article.id,
    title: article.title,
    sourceName: article.source.name,
    publishedLabel: formatDate(article.source.publishedAt),
    originalUrl: article.source.originalUrl,
    summaryText: article.summary.status === "available" ? article.summary.text : null,
    showsAiSummary: article.summary.status === "available" && article.summary.aiGenerated,
    image:
      article.image?.status === "available" && article.image.url
        ? {
            url: article.image.url,
            alt: article.image.alt ?? article.title,
            label: article.image.origin === "ai" ? "AI 생성 이미지" : article.image.attribution,
          }
        : null,
    originalIsAvailable: article.availability.original === "available",
  };
}

export type HomeViewModel = {
  viewer: { isMember: boolean; displayName: string | null };
  feed: {
    cards: ReturnType<typeof mapArticleCard>[];
    currentPositionLabel: string;
    canLoadPreviousDates: boolean;
  };
  todayList: {
    count: number;
    items: Array<{
      articleId: string;
      title: string;
      quizStatusLabel: string;
      isFromPreviousFeedDate: boolean;
    }>;
  } | null;
  needsPreviousListDecision: boolean;
};

export function toHomeViewModel(api: HomeApiModel): HomeViewModel {
  const quizStatusLabel = {
    ready: "출제 가능",
    preparing: "문항 준비 중",
    expired: "만료",
    suspended: "이용 중단",
  } as const;

  return {
    viewer: {
      isMember: api.viewer.role === "member",
      displayName: api.viewer.displayName,
    },
    feed: {
      cards: api.feed.items.map(mapArticleCard),
      currentPositionLabel: `${api.feed.currentIndex + 1}/${api.feed.items.length}`,
      canLoadPreviousDates: api.feed.canLoadPreviousDates,
    },
    todayList: api.todayList
      ? {
          count: api.todayList.items.length,
          items: api.todayList.items.map((item) => ({
            articleId: item.article.id,
            title: item.article.title,
            quizStatusLabel: quizStatusLabel[item.quizStatus],
            isFromPreviousFeedDate: item.isFromPreviousFeedDate,
          })),
        }
      : null,
    needsPreviousListDecision: api.pendingPreviousList !== null,
  };
}

export type QuizStartViewModel = {
  domainLabel: string;
  defaultFormat: "선택형" | "주관식형";
  formats: Array<{ id: "choice" | "written"; label: string; enabled: boolean; reason: string | null }>;
  plannedQuestionCount: number;
  remainingCandidateCount: number;
  candidates: Array<{ title: string; included: boolean; exclusionReason: string | null }>;
};

export function toQuizStartViewModel(api: QuizPreviewApiModel): QuizStartViewModel {
  const formatLabel = { choice: "선택형", written: "주관식형" } as const;
  const exclusionLabel = {
    preparing: "문항 준비 중",
    expired: "만료",
    suspended: "이용 중단",
  } as const;

  return {
    domainLabel: api.domain === "shortform" ? "숏폼 퀴즈" : "랜덤 퀴즈",
    defaultFormat: formatLabel[api.defaultFormat],
    formats: (["choice", "written"] as const).map((format) => ({
      id: format,
      label: formatLabel[format],
      enabled: api.formatAvailability[format].enabled,
      reason: api.formatAvailability[format].reason,
    })),
    plannedQuestionCount: api.plannedQuestionCount,
    remainingCandidateCount: api.remainingCandidateCount,
    candidates: api.candidates.map((candidate) => ({
      title: candidate.title,
      included: candidate.status === "included",
      exclusionReason: candidate.exclusionReason
        ? exclusionLabel[candidate.exclusionReason]
        : null,
    })),
  };
}

export type QuizPlayViewModel = {
  isFinished: boolean;
  progressLabel: string;
  question: {
    title: string;
    prompt: string;
    context: string | null;
    choices: Array<{ id: string; label: string }> | null;
    hint: string | null;
    showsSemanticFeedback: boolean;
  } | null;
  resolution: {
    outcomeLabel: string;
    answer: string | null;
    explanation: string | null;
    evidence: ReturnType<typeof mapArticleCard> | null;
  } | null;
};

export function toQuizPlayViewModel(api: QuizSessionApiModel): QuizPlayViewModel {
  const outcomeLabel = {
    correct: "정답",
    incorrect: "오답",
    "given-up": "포기",
    pending: "판정 중",
  } as const;

  return {
    isFinished: api.status !== "in-progress",
    progressLabel: `${api.progress.current}/${api.progress.total}`,
    question: api.question
      ? {
          title: api.question.articleTitle,
          prompt: api.question.prompt,
          context: api.question.context,
          choices: api.question.choices,
          hint: api.question.hint.text,
          showsSemanticFeedback: api.question.kind === "semantic",
        }
      : null,
    resolution: api.resolution
      ? {
          outcomeLabel: outcomeLabel[api.resolution.outcome],
          answer: api.resolution.correctAnswer,
          explanation: api.resolution.explanation,
          evidence: mapArticleCard(api.resolution.evidence),
        }
      : null,
  };
}

export type QuizResultViewModel = {
  isServiceEnded: boolean;
  summary: QuizResultApiModel["summary"];
  canStartNextRound: boolean;
  explanations: Array<{
    outcome: string;
    answer: string | null;
    evidenceTitle: string;
  }>;
};

export function toQuizResultViewModel(api: QuizResultApiModel): QuizResultViewModel {
  return {
    isServiceEnded: api.status === "ended-by-service",
    summary: api.summary,
    canStartNextRound: api.remainingCandidateCount > 0,
    explanations: api.explanations.map((resolution) => ({
      outcome: resolution.outcome,
      answer: resolution.correctAnswer,
      evidenceTitle: resolution.evidence.title,
    })),
  };
}

export type ArchiveViewModel = {
  groups: Array<{
    dateLabel: string;
    items: Array<{ id: string; title: string | null; originalUrl: string | null; isRestricted: boolean }>;
  }>;
};

export function toArchiveViewModel(api: ArchiveApiModel): ArchiveViewModel {
  return {
    groups: api.groups.map((group) => ({
      dateLabel: formatDate(group.date),
      items: group.entries.map((entry) => ({
        id: entry.id,
        title: entry.article?.title ?? null,
        originalUrl: entry.article?.source.originalUrl ?? null,
        isRestricted: entry.displayStatus === "restricted",
      })),
    })),
  };
}

export type SettingsViewModel = {
  viewer: { isMember: boolean; displayName: string | null };
  topics: Array<{ id: string; label: string; selected: boolean }>;
  persistenceDescription: string;
  canRequestDeletion: boolean;
};

export function toSettingsViewModel(api: SettingsApiModel): SettingsViewModel {
  return {
    viewer: {
      isMember: api.viewer.role === "member",
      displayName: api.viewer.displayName,
    },
    topics: api.topics,
    persistenceDescription:
      api.account?.persistenceDescription ?? "관심 주제는 이 브라우저에 저장됩니다.",
    canRequestDeletion: api.account?.canRequestDeletion ?? false,
  };
}
