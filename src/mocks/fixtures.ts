import type {
  ArchiveApiModel,
  ArticleApiModel,
  HomeApiModel,
  NavigationApiModel,
  QuizPreviewApiModel,
  QuizResultApiModel,
  QuizSessionApiModel,
  SettingsApiModel,
  ViewerApiModel,
} from "@/features/contracts/api-models";

const baseNavigationItems = [
  { id: "home", label: "홈", href: "/" },
  { id: "random", label: "랜덤 퀴즈", href: "/random" },
  { id: "archive", label: "아카이브", href: "/archive" },
  { id: "settings", label: "설정", href: "/settings" },
] as const;

export const guestNavigationFixture: NavigationApiModel = {
  primaryItems: [...baseNavigationItems],
  account: { status: "guest", loginLabel: "로그인" },
  todayListCount: null,
};

export const memberNavigationFixture: NavigationApiModel = {
  primaryItems: [...baseNavigationItems],
  account: {
    status: "member",
    displayName: "뉴스리틀 사용자",
    menuItems: [
      { id: "settings", label: "설정", type: "link", href: "/settings" },
      { id: "logout", label: "로그아웃", type: "action", action: "logout" },
    ],
  },
  todayListCount: 1,
};

export const adminNavigationFixture: NavigationApiModel = {
  ...memberNavigationFixture,
  primaryItems: [
    ...baseNavigationItems,
    { id: "operations", label: "운영", href: "/admin" },
  ],
};

export const mockViewer: ViewerApiModel = {
  id: "member-demo",
  role: "member",
  displayName: "뉴스리틀 사용자",
  storageScope: "account",
};

const firstArticle: ArticleApiModel = {
  id: "article-library-program",
  title: "모의 기사: 지역 공공도서관이 주말 프로그램을 확대합니다",
  source: {
    id: "source-demo-news",
    name: "데모 뉴스",
    originalUrl: "https://example.com/articles/library-program",
    publishedAt: "2026-09-13T09:00:00+09:00",
  },
  topicIds: ["society"],
  summary: {
    status: "available",
    text: "지역 공공도서관이 주말 독서·체험 프로그램을 늘리는 모의 콘텐츠입니다.",
    aiGenerated: true,
    reviewedAt: "2026-09-13T09:30:00+09:00",
  },
  image: null,
  availability: { feed: "published", original: "available" },
};

const secondArticle: ArticleApiModel = {
  id: "article-science-class",
  title: "모의 기사: 청소년 과학 교실의 참가 신청이 시작됐습니다",
  source: {
    id: "source-demo-news",
    name: "데모 뉴스",
    originalUrl: "https://example.com/articles/science-class",
    publishedAt: "2026-09-13T08:00:00+09:00",
  },
  topicIds: ["science"],
  summary: {
    status: "available",
    text: "청소년 대상 과학 교실의 참가 신청 일정을 소개하는 모의 콘텐츠입니다.",
    aiGenerated: true,
    reviewedAt: "2026-09-13T08:20:00+09:00",
  },
  image: null,
  availability: { feed: "published", original: "available" },
};

export const homeFixture: HomeApiModel = {
  viewer: mockViewer,
  feed: {
    items: [firstArticle, secondArticle],
    currentIndex: 0,
    nextCursor: "demo-next-cursor",
    canLoadPreviousDates: true,
  },
  todayList: {
    selectedForDate: "2026-09-13",
    items: [
      {
        article: firstArticle,
        selectedAt: "2026-09-13T10:00:00+09:00",
        selectionOrder: 1,
        quizStatus: "ready",
        isFromPreviousFeedDate: false,
      },
    ],
  },
  pendingPreviousList: null,
};

export const shortformPreviewFixture: QuizPreviewApiModel = {
  domain: "shortform",
  defaultFormat: "choice",
  formatAvailability: {
    choice: { enabled: true, reason: null },
    written: { enabled: true, reason: null },
  },
  plannedQuestionCount: 1,
  remainingCandidateCount: 0,
  candidates: [
    {
      articleId: firstArticle.id,
      title: firstArticle.title,
      status: "included",
      exclusionReason: null,
    },
  ],
};

export const randomPreviewFixture: QuizPreviewApiModel = {
  ...shortformPreviewFixture,
  domain: "random",
  plannedQuestionCount: 5,
  remainingCandidateCount: 12,
};

export const shortformSessionFixture: QuizSessionApiModel = {
  id: "shortform-demo-session",
  domain: "shortform",
  format: "choice",
  status: "in-progress",
  progress: { current: 1, total: 1, processed: 0 },
  question: {
    id: "question-library-program",
    articleId: firstArticle.id,
    articleTitle: firstArticle.title,
    kind: "fact",
    prompt: "모의 기사에서 확대하는 프로그램의 운영 시점은 언제인가요?",
    context: "기사의 핵심 정보를 확인하는 선택형 문항입니다.",
    choices: [
      { id: "weekday", label: "평일" },
      { id: "weekend", label: "주말" },
    ],
    hint: { level: 0, text: null },
  },
  resolution: null,
};

export const randomSessionFixture: QuizSessionApiModel = {
  ...shortformSessionFixture,
  id: "random-demo-session",
  domain: "random",
  progress: { current: 1, total: 5, processed: 0 },
  question: {
    ...shortformSessionFixture.question!,
    id: "question-random-science",
    articleId: secondArticle.id,
    articleTitle: secondArticle.title,
    prompt: "모의 기사에서 참가 신청을 받는 대상은 누구인가요?",
  },
};

const resolution = {
  outcome: "correct" as const,
  correctAnswer: "주말",
  explanation: "모의 기사에서 주말 프로그램 확대를 안내했습니다.",
  semanticFeedback: null,
  evidence: firstArticle,
};

export const shortformResultFixture: QuizResultApiModel = {
  sessionId: shortformSessionFixture.id,
  domain: "shortform",
  status: "completed",
  format: "choice",
  summary: {
    planned: 1,
    processed: 1,
    correct: 1,
    choiceIncorrect: 0,
    givenUp: 0,
    excludedByService: 0,
    writtenCorrect: { firstAttempt: 0, retryWithoutHint: 0, retryWithHint: 0 },
  },
  explanations: [resolution],
  remainingCandidateCount: 0,
};

export const randomResultFixture: QuizResultApiModel = {
  ...shortformResultFixture,
  sessionId: randomSessionFixture.id,
  domain: "random",
  remainingCandidateCount: 12,
};

export const archiveFixture: ArchiveApiModel = {
  groups: [
    {
      date: "2026-09-12",
      entries: [
        {
          id: "archive-library-program",
          selectedAt: "2026-09-12T18:00:00+09:00",
          article: firstArticle,
          displayStatus: "available",
        },
      ],
    },
  ],
};

export const settingsFixture: SettingsApiModel = {
  viewer: mockViewer,
  topics: [
    { id: "economy", label: "경제", selected: false },
    { id: "society", label: "사회", selected: true },
    { id: "ai-it", label: "AI·IT", selected: true },
    { id: "science", label: "과학", selected: false },
  ],
  account: {
    canRequestDeletion: true,
    persistenceDescription: "관심 주제와 오늘 목록, 아카이브는 계정에 저장됩니다.",
  },
};
