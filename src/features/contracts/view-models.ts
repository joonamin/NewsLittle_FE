/**
 * [안내]
 * 도메인 API 인터페이스 및 화면 요구사항 정의는 초기 설계 단계이며 아직 완전하게 고도화되지 않았습니다.
 * 상위 API 모델의 변경 및 요구사항 고도화에 맞춰 뷰 모델 및 매핑 함수가 추후 변경될 가능성이 존재합니다.
 */

import type {
  AccountMenuItemApiModel,
  ArchiveApiModel,
  ArchiveEntryDisplayStatus,
  ArticleApiModel,
  HomeApiModel,
  NavigationApiModel,
  NavigationItemId,
  QuizDomain,
  QuizFormat,
  QuizPreviewApiModel,
  QuizResolutionApiModel,
  QuizResultApiModel,
  QuizSessionApiModel,
  SettingsApiModel,
} from "./api-models";

export type GlobalNavigationMenuItem = {
  id: NavigationItemId;
  label: string;
  href: string;
};

export type GlobalNavigationAccount =
  | { status: "guest"; loginLabel: string }
  | { status: "member"; displayName: string; menuItems: AccountMenuItemApiModel[] };

export type GlobalNavigationViewModel = {
  primaryItems: GlobalNavigationMenuItem[];
  account: GlobalNavigationAccount;
  todayListCount: number | null;
};

export const defaultGuestNavigation: GlobalNavigationViewModel = {
  primaryItems: [
    { id: "home", label: "홈", href: "/" },
    { id: "random", label: "랜덤 퀴즈", href: "/random" },
    { id: "archive", label: "아카이브", href: "/archive" },
    { id: "settings", label: "설정", href: "/settings" },
  ],
  account: { status: "guest", loginLabel: "로그인" },
  todayListCount: null,
};

export function toGlobalNavigationViewModel(api: NavigationApiModel): GlobalNavigationViewModel {
  return {
    primaryItems: api.primaryItems,
    account: api.account,
    todayListCount: api.account.status === "member" ? api.todayListCount : null,
  };
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

const topicLabels: Record<string, string> = {
  economy: "경제",
  society: "사회",
  "ai-it": "AI·IT",
  science: "과학",
};

export type HomeArticleCardViewModel = {
  id: string;
  category: string;
  title: string;
  bodyText: string | null;
  sourceName: string;
  publishedLabel: string;
  originalUrl: string;
  summaryText: string | null;
  showsAiSummary: boolean;
  image: { url: string; alt: string; label: string | null } | null;
  originalIsAvailable: boolean;
  isFromPreviousFeedDate: boolean;
  isRestricted: boolean;
};

function mapArticleCard(
  article: ArticleApiModel,
  isFromPreviousFeedDate = false,
): HomeArticleCardViewModel {
  return {
    id: article.id,
    category: topicLabels[article.topicIds[0] ?? ""] ?? "뉴스",
    title: article.title,
    bodyText: article.summary.status === "available" ? article.summary.text : null,
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
    isFromPreviousFeedDate,
    isRestricted: article.summary.status !== "available",
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
    dateLabel: string;
    items: Array<{
      articleId: string;
      title: string;
      originalUrl: string;
      publishedLabel: string;
      quizStatusLabel: string;
      isFromPreviousFeedDate: boolean;
    }>;
  } | null;
  pendingPreviousLists: Array<{
    dateLabel: string;
    items: Array<{ articleId: string; title: string; originalUrl: string }>;
  }>;
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
      cards: api.feed.items.map((item) =>
        mapArticleCard(item.article, item.isFromPreviousFeedDate),
      ),
      currentPositionLabel: `${api.feed.currentIndex + 1}/${api.feed.items.length}`,
      canLoadPreviousDates: api.feed.canLoadPreviousDates,
    },
    todayList: api.todayList
      ? {
          count: api.todayList.items.length,
          dateLabel: formatDate(api.todayList.selectedForDate),
          items: api.todayList.items.map((item) => ({
            articleId: item.article.id,
            title: item.article.title,
            originalUrl: item.article.source.originalUrl,
            publishedLabel: formatDate(item.article.source.publishedAt),
            quizStatusLabel: quizStatusLabel[item.quizStatus],
            isFromPreviousFeedDate: item.isFromPreviousFeedDate,
          })),
        }
      : null,
    pendingPreviousLists: api.pendingPreviousLists.map((list) => ({
      dateLabel: formatDate(list.date),
      items: list.items.map((item) => ({
        articleId: item.article.id,
        title: item.article.title,
        originalUrl: item.article.source.originalUrl,
      })),
    })),
    needsPreviousListDecision: api.pendingPreviousLists.length > 0,
  };
}

export type QuizStartViewModel = {
  domainLabel: string;
  defaultFormatId: "choice" | "written";
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
    defaultFormatId: api.defaultFormat,
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
  format: "choice" | "written";
  progress: { current: number; total: number };
  progressLabel: string;
  question: {
    title: string;
    prompt: string;
    context: string | null;
    choices: Array<{ id: string; label: string }> | null;
    hint: string | null;
    hintLevel: 0 | 1 | 2;
    semanticFeedback: { similarityScore: number; missingDirection: string } | null;
    showsSemanticFeedback: boolean;
  } | null;
  resolution: {
    outcomeLabel: string;
    outcome: "correct" | "incorrect" | "given-up" | "pending" | "service-excluded";
    userAnswer: string | null;
    answer: string | null;
    explanation: string | null;
    evidence: ReturnType<typeof mapArticleCard> | null;
  } | null;
};

const outcomeLabel: Record<QuizResolutionApiModel["outcome"], string> = {
  correct: "정답",
  incorrect: "오답",
  "given-up": "포기",
  pending: "판정 미완료",
  "service-excluded": "서비스 제외",
};

export function toQuizPlayViewModel(api: QuizSessionApiModel): QuizPlayViewModel {
  return {
    isFinished: api.status !== "in-progress",
    format: api.format,
    progress: { current: api.progress.current, total: api.progress.total },
    progressLabel: `${api.progress.current}/${api.progress.total}`,
    question: api.question
      ? {
          title: api.question.articleTitle,
          prompt: api.question.prompt,
          context: api.question.context,
          choices: api.question.choices,
          hint: api.question.hint.text,
          hintLevel: api.question.hint.level,
          semanticFeedback: api.question.judgementFeedback ?? null,
          showsSemanticFeedback: api.question.kind === "semantic",
        }
      : null,
    resolution: api.resolution
      ? {
          outcomeLabel: outcomeLabel[api.resolution.outcome],
          outcome: api.resolution.outcome,
          userAnswer: api.resolution.userAnswer,
          answer: api.resolution.correctAnswer,
          explanation: api.resolution.explanation,
          evidence: mapArticleCard(api.resolution.evidence),
        }
      : null,
  };
}

export type QuizRecapItemViewModel = {
  index: number;
  prompt: string;
  outcome: QuizResolutionApiModel["outcome"];
  outcomeLabel: string;
  userAnswer: string | null;
  correctAnswer: string | null;
  explanation: string | null;
  evidence: ReturnType<typeof mapArticleCard> | null;
};

export type QuizResultViewModel = {
  sessionId: string;
  domain: QuizDomain;
  format: QuizFormat;
  status: "completed" | "ended-by-service";
  isServiceEnded: boolean;
  summary: QuizResultApiModel["summary"];
  canStartNextRound: boolean;
  recapItems: QuizRecapItemViewModel[];
  explanations: Array<{
    outcome: string;
    answer: string | null;
    evidenceTitle: string;
  }>;
};

export function toQuizResultViewModel(api: QuizResultApiModel): QuizResultViewModel {
  return {
    sessionId: api.sessionId,
    domain: api.domain,
    format: api.format,
    status: api.status,
    isServiceEnded: api.status === "ended-by-service",
    summary: api.summary,
    canStartNextRound: api.remainingCandidateCount > 0,
    recapItems: api.explanations.map((resolution, idx) => ({
      index: idx + 1,
      prompt: resolution.prompt ?? resolution.evidence?.title ?? `문항 ${idx + 1}`,
      outcome: resolution.outcome,
      outcomeLabel: outcomeLabel[resolution.outcome] ?? resolution.outcome,
      userAnswer: resolution.userAnswer,
      correctAnswer: resolution.correctAnswer,
      explanation: resolution.explanation,
      evidence: resolution.evidence ? mapArticleCard(resolution.evidence) : null,
    })),
    explanations: api.explanations.map((resolution) => ({
      outcome: resolution.outcome,
      answer: resolution.correctAnswer,
      evidenceTitle: resolution.evidence?.title ?? "",
    })),
  };
}

export type ArchiveViewModel = {
  groups: Array<{
    date: string;
    dateLabel: string;
    items: Array<{
      id: string;
      title: string | null;
      originalUrl: string | null;
      sourceName: string | null;
      publishedLabel: string | null;
      status: ArchiveEntryDisplayStatus;
      discontinuedReason: string | null;
    }>;
  }>;
};

export function toArchiveViewModel(api: ArchiveApiModel): ArchiveViewModel {
  return {
    groups: api.groups.map((group) => ({
      date: group.date,
      dateLabel: formatDate(group.date),
      items: group.entries.map((entry) => ({
        id: entry.id,
        title: entry.article?.title ?? null,
        originalUrl: entry.article?.source.originalUrl ?? null,
        discontinuedReason: entry.discontinuedReason ?? null,
        sourceName: entry.article?.source.name ?? null,
        publishedLabel: entry.article ? formatDate(entry.article.source.publishedAt) : null,
        status: entry.displayStatus,
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
