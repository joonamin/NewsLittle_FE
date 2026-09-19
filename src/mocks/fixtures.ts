import type {
  ArchiveApiModel,
  ArticleApiModel,
  AuthMeApiModel,
  FeedApiModel,
  HomeApiModel,
  NavigationApiModel,
  QuizFormat,
  QuizPreviewApiModel,
  QuizResultApiModel,
  QuizSessionApiModel,
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

export const guestViewer: ViewerApiModel = {
  id: "guest",
  role: "guest",
  displayName: null,
  storageScope: "browser",
};

export const mockViewer: ViewerApiModel = {
  id: "member-demo",
  role: "member",
  displayName: "뉴스리틀 사용자",
  storageScope: "account",
};

export const firstArticle: ArticleApiModel = {
  id: "article-library-program",
  title: "모의 기사: 지역 공공도서관이 주말 프로그램을 확대합니다",
  source: {
    id: "source-demo-news",
    name: "데모 뉴스",
    originalUrl: "https://example.com/articles/library-program",
    publishedAt: "2026-09-13T09:00:00+09:00",
  },
  topicIds: ["SOCIETY"],
  summary: {
    status: "available",
    text: "지역 공공도서관이 주말 독서·체험 프로그램을 늘리는 모의 콘텐츠입니다.",
    aiGenerated: true,
    reviewedAt: "2026-09-13T09:30:00+09:00",
  },
  body: {
    status: "available",
    text: "공공도서관 12곳이 주말 운영을 시작한다. 어린이 독서 모임이 새로 열린다. 신청은 누리집에서 받는다. 내년 확대를 검토한다.",
  },
  image: {
    status: "available",
    origin: "article",
    url: "https://images.unsplash.com/photo-1776583235002-016ed6dffa31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "나무가 우거진 공원 산책로",
    attribution: "Unsplash · Bernd Dittrich",
  },
  availability: { feed: "published", original: "available" },
};

export const secondArticle: ArticleApiModel = {
  id: "article-science-class",
  title: "모의 기사: 청소년 과학 교실의 참가 신청이 시작됐습니다",
  source: {
    id: "source-demo-news",
    name: "데모 뉴스",
    originalUrl: "https://example.com/articles/science-class",
    publishedAt: "2026-09-13T08:00:00+09:00",
  },
  topicIds: ["SCIENCE"],
  summary: {
    status: "available",
    text: "청소년 대상 과학 교실의 참가 신청 일정을 소개하는 모의 콘텐츠입니다.",
    aiGenerated: true,
    reviewedAt: "2026-09-13T08:20:00+09:00",
  },
  body: {
    status: "available",
    text: "교육청이 중학생 과학 교실을 연다. 실험과 강연으로 구성된다. 신청은 20일부터 선착순이다. 정원은 학교별 열 명이다.",
  },
  image: null,
  availability: { feed: "published", original: "available" },
};

export const longArticle: ArticleApiModel = {
  id: "article-long-body",
  title: "모의 기사: 청소년 과학 교실의 참가 신청이 시작됐습니다",
  source: {
    id: "source-demo-news",
    name: "데모 뉴스",
    originalUrl: "https://example.com/articles/science-class",
    publishedAt: "2026-09-13T08:00:00+09:00",
  },
  topicIds: ["SCIENCE"],
  summary: {
    status: "available",
    text: "본문 펼치기 동작을 확인하기 위한 긴 기사 모의 콘텐츠입니다.",
    aiGenerated: true,
    reviewedAt: "2026-09-13T08:20:00+09:00",
  },
  body: {
    status: "available",
    text: "이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 컨텐츠 입니다. 이건 엄청 긴 기사입니다. 이건 엄청 긴 기사입니다. 이건 엄청 긴 기사입니다.이건 엄청 긴 기사입니다.이건 엄청 긴 기사입니다. 이건 엄청 긴 기사입니다.이건 엄청 긴 기사입니다.이건 엄청 긴 기사입니다.이건 엄청 긴 기사입니다.이건 엄청 긴 기사입니다.",
  },
  image: null,
  availability: { feed: "published", original: "available" },
};

export const nextPageArticle: ArticleApiModel = {
  id: "article-next-page-demo",
  title: "모의 기사: 다음 커서로 불러온 새로운 기사입니다",
  source: {
    id: "source-demo-news",
    name: "데모 뉴스",
    originalUrl: "https://example.com/articles/next-page",
    publishedAt: "2026-09-12T10:00:00+09:00",
  },
  topicIds: ["ECONOMY"],
  summary: {
    status: "available",
    text: "무한 스크롤 및 다음 커서로 새롭게 페치된 모의 기사 요약입니다.",
    aiGenerated: true,
    reviewedAt: "2026-09-12T10:30:00+09:00",
  },
  body: {
    status: "available",
    text: "다음 커서로 불러온 기사의 단문 본문이다. 첫 페이지 기사와 다른 날짜에 게시됐다. 무한 스크롤이 이어 붙인 카드인지 확인하는 데 쓴다. 담기와 원문 링크 동작은 같다.",
  },
  image: null,
  availability: { feed: "published", original: "available" },
};

export const nextFeedPageFixture: FeedApiModel = {
  items: [
    { article: nextPageArticle, isFromPreviousFeedDate: true },
  ],
  currentIndex: 0,
  nextCursor: null,
  canLoadPreviousDates: false,
};

export const homeFixture: HomeApiModel = {
  viewer: mockViewer,
  feed: {
    items: [
      { article: firstArticle, isFromPreviousFeedDate: false },
      { article: secondArticle, isFromPreviousFeedDate: false },
      { article: longArticle, isFromPreviousFeedDate: false },
    ],
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
  pendingPreviousLists: [],
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
  candidates: [],
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

export function createShortformSessionFixture(format: QuizFormat): QuizSessionApiModel {
  return {
    ...shortformSessionFixture,
    id: `shortform-demo-${format}-session`,
    format,
  };
}

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
    context: "기사의 핵심 정보를 확인하는 선택형 문항입니다.",
    choices: [
      { id: "teenager", label: "청소년" },
      { id: "adult", label: "성인" },
    ],
  },
};

export const randomWrittenSessionFixture: QuizSessionApiModel = {
  ...randomSessionFixture,
  id: "random-written-demo-session",
  format: "written",
  question: {
    ...randomSessionFixture.question!,
    kind: "semantic",
    choices: null,
    prompt: "청소년 과학 교실은 누구를 대상으로 하나요?",
    context: "핵심 내용을 자신의 말로 답하는 주관식 문항입니다.",
    hint: { level: 0, text: null },
  },
};

export const randomWrittenHintSessionFixture: QuizSessionApiModel = {
  ...randomWrittenSessionFixture,
  question: {
    ...randomWrittenSessionFixture.question!,
    hint: { level: 1, text: "기사 제목에서 참가 대상을 찾아보세요." },
    judgementFeedback: { similarityScore: 42, missingDirection: "참가 대상의 연령대를 구체적으로 적어보세요." },
  },
};

export const randomWrittenSecondHintSessionFixture: QuizSessionApiModel = {
  ...randomWrittenSessionFixture,
  question: {
    ...randomWrittenSessionFixture.question!,
    hint: { level: 2, text: "핵심 표현은 ‘청소년’으로 시작해요." },
    judgementFeedback: { similarityScore: 68, missingDirection: "기사에서 사용한 정확한 대상 표현이 필요해요." },
  },
};

const resolution = {
  outcome: "correct" as const,
  userAnswer: "주말",
  correctAnswer: "주말",
  explanation: "모의 기사에서 주말 프로그램 확대를 안내했습니다.",
  semanticFeedback: null,
  evidence: firstArticle,
};

export const randomResolvedSessionFixture: QuizSessionApiModel = {
  ...randomSessionFixture,
  progress: { current: 1, total: 5, processed: 1 },
  resolution: {
    outcome: "correct",
    userAnswer: "청소년",
    correctAnswer: "청소년",
    explanation: "기사에서는 청소년을 대상으로 과학 교실 참가 신청을 받는다고 설명합니다.",
    semanticFeedback: null,
    evidence: secondArticle,
  },
};

export const randomWrittenResolvedSessionFixture: QuizSessionApiModel = {
  ...randomResolvedSessionFixture,
  id: randomWrittenSessionFixture.id,
  format: "written",
  question: randomWrittenSessionFixture.question,
};

export const randomGivenUpSessionFixture: QuizSessionApiModel = {
  ...randomResolvedSessionFixture,
  resolution: {
    ...randomResolvedSessionFixture.resolution!,
    outcome: "given-up",
    userAnswer: null,
  },
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
        {
          id: "archive-science-class",
          selectedAt: "2026-09-12T17:30:00+09:00",
          article: secondArticle,
          displayStatus: "access-failed",
        },
        {
          id: "archive-urban-trees",
          selectedAt: "2026-09-12T17:00:00+09:00",
          article: {
            id: "article-urban-trees",
            title: "모의 기사: 도심의 열을 낮추는 나무, 그늘 이상의 역할",
            source: {
              id: "source-demo-news",
              name: "데모 뉴스",
              originalUrl: "https://example.com/articles/urban-trees",
              publishedAt: "2026-08-13T09:00:00+09:00",
            },
          },
          displayStatus: "derivative-expired",
        },
        {
          id: "archive-metadata-terms-ended",
          selectedAt: "2026-09-12T16:30:00+09:00",
          article: null,
          displayStatus: "discontinued",
          discontinuedReason: "메타데이터 이용 조건이 종료되어 제목과 원문 링크를 표시할 수 없습니다.",
        },
        {
          id: "archive-provider-requested",
          selectedAt: "2026-09-12T16:00:00+09:00",
          article: null,
          displayStatus: "discontinued",
          discontinuedReason: "제공처 요청으로 이용이 중단되어 제목과 원문 링크를 표시할 수 없습니다.",
        },
      ],
    },
    {
      date: "2026-08-10",
      entries: [
        {
          id: "archive-previous-month",
          selectedAt: "2026-08-10T12:00:00+09:00",
          article: {
            id: "article-previous-month",
            title: "모의 기사: 기준금리가 내려가면 우리 생활은 어떻게 달라질까",
            source: {
              id: "source-demo-news",
              name: "데모 뉴스",
              originalUrl: "https://example.com/articles/interest-rate",
              publishedAt: "2026-08-10T09:00:00+09:00",
            },
          },
          displayStatus: "available",
        },
      ],
    },
  ],
};

/** GET /api/v1/auth/me 회원 응답. 설정 화면(SCR-09)이 이 하나로 구성된다. */
export const authMeFixture: AuthMeApiModel = {
  status: "authenticated",
  email: "member-demo@newslittle.example",
  displayName: mockViewer.displayName,
  role: "member",
  interests: ["AI_IT", "SOCIETY"],
  interestsSetAt: "2026-09-01T00:00:00+09:00",
  accountDeletionRequest: null,
  canRequestAccountDeletion: true,
  recordsDeletionRequest: null,
  canRequestRecordsDeletion: true,
};