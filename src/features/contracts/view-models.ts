/**
 * [안내]
 * 도메인 API 인터페이스 및 화면 요구사항 정의는 초기 설계 단계이며 아직 완전하게 고도화되지 않았습니다.
 * 상위 API 모델의 변경 및 요구사항 고도화에 맞춰 뷰 모델 및 매핑 함수가 추후 변경될 가능성이 존재합니다.
 */

import { isSameText } from "@/lib/sentences";

import type {
  AccountMenuItemApiModel,
  ArchiveApiModel,
  ArchiveEntryDisplayStatus,
  ArticleApiModel,
  AuthMeApiModel,
  DeletionRequestKind,
  DeletionRequestState,
  FeedApiModel,
  HomeApiModel,
  NavigationApiModel,
  NavigationItemId,
  QuizDomain,
  QuizFormat,
  QuizPreviewApiModel,
  QuizResolutionApiModel,
  QuizResultApiModel,
  QuizSessionApiModel,
  TopicCode,
} from "./api-models";

import { PERSISTENCE_DESCRIPTION, TOPIC_CATALOG } from "./topics";

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

const topicLabels: Record<TopicCode, string> = Object.fromEntries(
  TOPIC_CATALOG.map((topic) => [topic.id, topic.label]),
) as Record<TopicCode, string>;

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
    category: topicLabels[article.topicIds[0] as TopicCode] ?? "뉴스",
    title: article.title,
    bodyText: pickBodyText(article),
    sourceName: article.source.name,
    publishedLabel: formatDate(article.source.publishedAt),
    originalUrl: article.source.originalUrl,
    summaryText: pickSummaryText(article),
    showsAiSummary:
      article.summary.status === "available" &&
      article.summary.aiGenerated &&
      pickSummaryText(article) !== null,
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
    isRestricted: article.summary.status !== "available" && article.body?.status !== "available",
  };
}

/**
 * 카드 본문. 단문(body)이 있으면 그것, 없으면(v3 legacy·만료) 요약을 본문 자리에 대신 쓴다.
 * 이때 요약 박스는 `pickSummaryText`가 비워 같은 글을 두 번 보여주지 않는다.
 */
function pickBodyText(article: ArticleApiModel): string | null {
  if (article.body?.status === "available" && article.body.text) return article.body.text;
  if (article.summary.status === "available") return article.summary.text;
  return null;
}

function pickSummaryText(article: ArticleApiModel): string | null {
  if (article.summary.status !== "available" || !article.summary.text) return null;
  const body = article.body?.status === "available" ? article.body.text : null;
  // 단문이 없어 요약이 본문 자리로 갔거나, 단문과 요약이 사실상 같은 글이면 박스를 숨긴다.
  if (!body || isSameText(body, article.summary.text)) return null;
  return article.summary.text;
}

export type FeedViewModel = {
  cards: ReturnType<typeof mapArticleCard>[];
  currentPositionLabel: string;
  canLoadPreviousDates: boolean;
  nextCursor: string | null;
};

export function toFeedViewModel(api: FeedApiModel): FeedViewModel {
  return {
    cards: api.items.map((item) => mapArticleCard(item.article, item.isFromPreviousFeedDate)),
    currentPositionLabel: `${api.currentIndex + 1}/${api.items.length}`,
    canLoadPreviousDates: api.canLoadPreviousDates,
    nextCursor: api.nextCursor,
  };
}

export type HomeViewModel = {
  viewer: { isMember: boolean; displayName: string | null };
  feed: FeedViewModel;
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
      // BE는 admin도 로그인 상태(member 이상)로 취급한다(shell/service.py 참고) — 게스트만 제외한다.
      isMember: api.viewer.role !== "guest",
      displayName: api.viewer.displayName,
    },
    feed: toFeedViewModel(api.feed),
    todayList: api.todayList
      ? {
          count: api.todayList.items.length,
          dateLabel: formatDate(api.todayList.selectedForDate),
          items: (api.todayList.items ?? []).map((item) => ({
            articleId: item.article.id,
            title: item.article.title,
            originalUrl: item.article.source?.originalUrl ?? "",
            publishedLabel: formatDate(item.article.source?.publishedAt),
            quizStatusLabel: quizStatusLabel[item.quizStatus],
            isFromPreviousFeedDate: item.isFromPreviousFeedDate,
          })),
        }
      : null,
    pendingPreviousLists: (api.pendingPreviousLists ?? []).map((list) => ({
      dateLabel: formatDate(list.date),
      items: (list.items ?? []).map((item) => ({
        articleId: item.article.id,
        title: item.article.title,
        originalUrl: item.article.source?.originalUrl ?? "",
      })),
    })),
    needsPreviousListDecision: (api.pendingPreviousLists ?? []).length > 0,
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
    defaultFormatId: api.defaultFormat ?? "choice",
    defaultFormat: formatLabel[api.defaultFormat] ?? "선택형",
    formats: (["choice", "written"] as const).map((format) => ({
      id: format,
      label: formatLabel[format],
      enabled: Boolean(api.formatAvailability?.[format]?.enabled),
      reason: api.formatAvailability?.[format]?.reason ?? null,
    })),
    plannedQuestionCount: api.plannedQuestionCount ?? 0,
    remainingCandidateCount: api.remainingCandidateCount ?? 0,
    candidates: (api.candidates ?? []).map((candidate) => ({
      title: candidate.title,
      included: candidate.status === "included",
      exclusionReason: candidate.exclusionReason
        ? (exclusionLabel[candidate.exclusionReason] ?? null)
        : null,
    })),
  };
}

export type QuizPlayViewModel = {
  isFinished: boolean;
  status: QuizSessionApiModel["status"];
  isServiceEnded: boolean;
  format: "choice" | "written";
  progress: { current: number; total: number };
  progressLabel: string;
  question: {
    /** BE 신고 계약(surface=QUIZ)의 quizId. 문항 정의 자체의 id이며 세션 id와 다르다. */
    id: string;
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
    articleId: string | null;
    outcomeLabel: string;
    outcome: "correct" | "incorrect" | "given-up" | "pending" | "service-excluded";
    userAnswer: string | null;
    answer: string | null;
    explanation: string | null;
    evidence: ReturnType<typeof mapArticleCard> | null;
    /** GLB-03 판정 오류 신고용. 판정된 답변이 없으면 null. */
    answerRef: string | null;
    quizId: string | null;
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
    status: api.status,
    isServiceEnded: api.status === "ended-by-service",
    format: api.format,
    progress: { current: api.progress.current, total: api.progress.total },
    progressLabel: `${api.progress.current}/${api.progress.total}`,
    question: api.question
      ? {
          id: api.question.id,
          title: api.question.articleTitle,
          prompt: api.question.prompt,
          context: api.question.context,
          choices:
            api.question.choices && api.question.choices.length > 0
              ? api.question.choices
              : api.format === "choice"
                ? [
                    { id: "O", label: "O" },
                    { id: "X", label: "X" },
                  ]
                : null,
          hint: api.question.hint.text,
          hintLevel: api.question.hint.level,
          semanticFeedback: api.question.judgementFeedback ?? null,
          showsSemanticFeedback: api.question.kind === "semantic",
        }
      : null,
    resolution: api.resolution
      ? {
          articleId: api.resolution.evidence?.id ?? null,
          outcomeLabel: outcomeLabel[api.resolution.outcome],
          outcome: api.resolution.outcome,
          userAnswer: api.resolution.userAnswer,
          answer: api.resolution.correctAnswer,
          explanation: api.resolution.explanation,
          evidence: mapArticleCard(api.resolution.evidence),
          answerRef: api.resolution.answerRef ?? null,
          quizId: api.resolution.quizId ?? api.question?.id ?? null,
        }
      : null,
  };
}

export type QuizRecapItemViewModel = {
  index: number;
  articleId: string | null;
  prompt: string;
  outcome: QuizResolutionApiModel["outcome"];
  outcomeLabel: string;
  userAnswer: string | null;
  correctAnswer: string | null;
  explanation: string | null;
  evidence: ReturnType<typeof mapArticleCard> | null;
  /** GLB-03 판정 오류 신고용. 결과 화면은 question 객체가 없어 이 필드가 유일한 quizId 출처다. */
  answerRef: string | null;
  quizId: string | null;
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
    canStartNextRound: (api.remainingCandidateCount ?? 0) > 0,
    recapItems: (api.explanations ?? []).map((resolution, idx) => ({
      index: idx + 1,
      articleId: resolution.evidence?.id ?? null,
      prompt: resolution.prompt ?? resolution.evidence?.title ?? `문항 ${idx + 1}`,
      outcome: resolution.outcome,
      outcomeLabel: outcomeLabel[resolution.outcome] ?? resolution.outcome,
      userAnswer: resolution.userAnswer,
      correctAnswer: resolution.correctAnswer,
      explanation: resolution.explanation,
      evidence: resolution.evidence ? mapArticleCard(resolution.evidence) : null,
      answerRef: resolution.answerRef ?? null,
      quizId: resolution.quizId ?? null,
    })),
    explanations: (api.explanations ?? []).map((resolution) => ({
      outcome: resolution.outcome,
      answer: resolution.correctAnswer,
      evidenceTitle: resolution.evidence?.title ?? "",
    })),
  };
}

export type ArchiveViewModel = {
  groups: Array<{
    id: string;
    date: string;
    dateLabel: string;
    title: string | null;
    items: Array<{
      id: string;
      /**
       * 보관 항목이 가리키는 실제 기사 id(BE 신고 계약의 articleId). 항목 자체의
       * id(entry.id)와는 다르다. "이용 중단"(article이 null)이면 신고 대상 기사를
       * 특정할 수 없어 null — 이 경우 신고 접점을 비활성화해야 한다.
       */
      articleId: string | null;
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
      id: group.id,
      date: group.date,
      dateLabel: formatDate(group.date),
      title: group.title ?? null,
      items: group.entries.map((entry) => ({
        id: entry.id,
        articleId: entry.article?.id ?? null,
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

export type SettingsDeletionRequestViewModel = {
  kind: DeletionRequestKind;
  state: DeletionRequestState;
  requestedAtLabel: string;
  completedAtLabel: string | null;
};

export type SettingsDeletionViewModel = {
  kind: DeletionRequestKind;
  /** 진행 중인 요청이 있으면 서버가 false로 내려 재요청을 막는다. */
  canRequest: boolean;
  /** 가장 최근 요청. 요청한 적이 없으면 null. */
  request: SettingsDeletionRequestViewModel | null;
};

export type SettingsViewModel = {
  viewer: { isMember: boolean; displayName: string | null };
  topics: Array<{ id: TopicCode; label: string; selected: boolean }>;
  storageScope: "account" | "browser";
  persistenceDescription: string;
  /** 회원의 구글 계정 이메일. 백엔드가 수집·저장하는 값은 sub·이메일·표시 이름뿐이다. */
  email: string | null;
  recordsDeletion: SettingsDeletionViewModel;
  accountDeletion: SettingsDeletionViewModel;
};

function toDeletionViewModel(
  kind: DeletionRequestKind,
  api: AuthMeApiModel,
): SettingsDeletionViewModel {
  const request = kind === "account" ? api.accountDeletionRequest : api.recordsDeletionRequest;
  const canRequest =
    kind === "account" ? api.canRequestAccountDeletion : api.canRequestRecordsDeletion;

  return {
    kind,
    canRequest: canRequest ?? true,
    request: request
      ? {
          kind,
          state: request.state,
          requestedAtLabel: formatDate(request.requestedAt),
          completedAtLabel: request.completedAt ? formatDate(request.completedAt) : null,
        }
      : null,
  };
}

/**
 * 설정 화면은 `/auth/me` 하나로 구성된다. 주제 라벨과 저장 위치 문구는 서버가
 * 주지 않으므로 프론트 카탈로그에서 채우고, 선택 여부만 `interests`로 맞춘다.
 */
export function toSettingsViewModel(api: AuthMeApiModel): SettingsViewModel {
  const isMember = api.status === "authenticated";
  const interests = api.interests ?? [];

  return {
    viewer: {
      isMember,
      displayName: api.displayName ?? null,
    },
    topics: TOPIC_CATALOG.map((topic) => ({
      ...topic,
      selected: isMember && interests.includes(topic.id),
    })),
    storageScope: isMember ? "account" : "browser",
    persistenceDescription: isMember
      ? PERSISTENCE_DESCRIPTION.account
      : PERSISTENCE_DESCRIPTION.browser,
    email: isMember ? (api.email ?? null) : null,
    recordsDeletion: toDeletionViewModel("records", api),
    accountDeletion: toDeletionViewModel("account", api),
  };
}

/** PUT /settings/interests 응답에는 주제 목록만 있어 화면 모델을 부분 갱신한다. */
export function withUpdatedInterests(
  settings: SettingsViewModel,
  interests: TopicCode[],
): SettingsViewModel {
  return {
    ...settings,
    topics: settings.topics.map((topic) => ({ ...topic, selected: interests.includes(topic.id) })),
  };
}

/** 삭제·탈퇴 요청 응답에도 그 요청의 상태만 있어 해당 영역만 갱신한다. */
export function withDeletionRequest(
  settings: SettingsViewModel,
  kind: DeletionRequestKind,
  request: { state: DeletionRequestState; requestedAt: string; completedAt: string | null },
): SettingsViewModel {
  const next: SettingsDeletionViewModel = {
    kind,
    // 서버와 같은 규칙: 접수·처리 중(REQUESTED·PROCESSING)일 때만 재요청을 막는다.
    canRequest: request.state !== "REQUESTED" && request.state !== "PROCESSING",
    request: {
      kind,
      state: request.state,
      requestedAtLabel: formatDate(request.requestedAt),
      completedAtLabel: request.completedAt ? formatDate(request.completedAt) : null,
    },
  };

  return kind === "account"
    ? { ...settings, accountDeletion: next }
    : { ...settings, recordsDeletion: next };
}
