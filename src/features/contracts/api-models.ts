/**
 * [안내]
 * 현재 도메인 API 인터페이스 및 요구사항 정의는 초기 설계 단계이며 아직 완전하게 고도화되지 않았습니다.
 * 백엔드 구현 및 서비스 요구사항 변경/고도화에 따라 필드 규격, 엔드포인트 및 타입 정의가 추후 변경될 가능성이 존재합니다.
 */

export type ApiTimestamp = string;

export type ApiMeta = {
  requestId: string;
  pagination?: {
    nextCursor: string | null;
    hasMore: boolean;
  } | null;
};

export type ApiResponse<T> = {
  data: T;
  meta: ApiMeta;
};

export type ViewerRole = "guest" | "member";
export type QuizDomain = "shortform" | "random";
export type QuizFormat = "choice" | "written";
export type QuestionKind = "fact" | "semantic";

export type NavigationItemId = "home" | "random" | "archive" | "settings" | "operations";

export type NavigationMenuItemApiModel = {
  id: NavigationItemId;
  label: string;
  href: string;
};

export type AccountMenuItemApiModel =
  | { id: string; label: string; type: "link"; href: string }
  | { id: string; label: string; type: "action"; action: "logout" };

/**
 * The server returns only the items the current session is allowed to see.
 * In particular, a client must never infer administrator access from a role flag.
 */
export type NavigationApiModel = {
  primaryItems: NavigationMenuItemApiModel[];
  account:
    | { status: "guest"; loginLabel: string }
    | { status: "member"; displayName: string; menuItems: AccountMenuItemApiModel[] };
  todayListCount: number | null;
};

export type ViewerApiModel = {
  id: string | null;
  role: ViewerRole;
  displayName: string | null;
  storageScope: "browser" | "account";
};

export type SourceApiModel = {
  id: string;
  name: string;
  originalUrl: string;
  publishedAt: ApiTimestamp;
};

export type ArticleImageApiModel = {
  status: "available" | "unavailable";
  origin: "ai" | "article";
  url: string | null;
  alt: string | null;
  attribution: string | null;
};

export type ArticleApiModel = {
  id: string;
  title: string;
  source: SourceApiModel;
  topicIds: string[];
  summary: {
    status: "available" | "unavailable";
    text: string | null;
    aiGenerated: boolean;
    reviewedAt: ApiTimestamp | null;
  };
  image: ArticleImageApiModel | null;
  availability: {
    feed: "published" | "removed";
    original: "available" | "unavailable";
  };
};

export type FeedItemApiModel = {
  article: ArticleApiModel;
  isFromPreviousFeedDate: boolean;
};

export type TodayListItemApiModel = {
  article: Pick<ArticleApiModel, "id" | "title" | "source">;
  selectedAt: ApiTimestamp;
  selectionOrder: number;
  quizStatus: "ready" | "preparing" | "expired" | "suspended";
  isFromPreviousFeedDate: boolean;
};

export type TodayListApiModel = {
  selectedForDate: string;
  items: TodayListItemApiModel[];
};

export type PreviousListApiModel = {
  date: string;
  items: TodayListItemApiModel[];
};

export type HomeApiModel = {
  viewer: ViewerApiModel;
  feed: {
    items: FeedItemApiModel[];
    currentIndex: number;
    nextCursor: string | null;
    canLoadPreviousDates: boolean;
  };
  todayList: TodayListApiModel | null;
  pendingPreviousLists: PreviousListApiModel[];
};

export type QuizPreviewCandidateApiModel = {
  articleId: string;
  title: string;
  status: "included" | "excluded";
  exclusionReason: "preparing" | "expired" | "suspended" | null;
};

export type QuizPreviewApiModel = {
  domain: QuizDomain;
  defaultFormat: QuizFormat;
  formatAvailability: Record<QuizFormat, { enabled: boolean; reason: string | null }>;
  plannedQuestionCount: number;
  remainingCandidateCount: number;
  candidates: QuizPreviewCandidateApiModel[];
};

export type QuizQuestionApiModel = {
  id: string;
  articleId: string;
  articleTitle: string;
  kind: QuestionKind;
  prompt: string;
  context: string | null;
  choices: Array<{ id: string; label: string }> | null;
  hint: { level: 0 | 1 | 2; text: string | null };
  judgementFeedback?: { similarityScore: number; missingDirection: string } | null;
};

export type QuizResolutionApiModel = {
  prompt?: string;
  outcome: "correct" | "incorrect" | "given-up" | "pending" | "service-excluded";
  userAnswer: string | null;
  correctAnswer: string | null;
  explanation: string | null;
  semanticFeedback: { score: number; missingDirection: string } | null;
  evidence: ArticleApiModel;
};

export type QuizSessionApiModel = {
  id: string;
  domain: QuizDomain;
  format: QuizFormat;
  status: "in-progress" | "completed" | "ended-by-service" | "abandoned";
  progress: { current: number; total: number; processed: number };
  question: QuizQuestionApiModel | null;
  resolution: QuizResolutionApiModel | null;
};

export type QuizResultApiModel = {
  sessionId: string;
  domain: QuizDomain;
  status: "completed" | "ended-by-service";
  format: QuizFormat;
  summary: {
    planned: number;
    processed: number;
    correct: number;
    choiceIncorrect: number;
    givenUp: number;
    excludedByService: number;
    writtenCorrect: {
      firstAttempt: number;
      retryWithoutHint: number;
      retryWithHint: number;
    };
  };
  explanations: QuizResolutionApiModel[];
  remainingCandidateCount: number;
};

/**
 * SCR-07 상태 분기: 원문 접근 실패·파생물 만료는 제목/원문 링크를 유지하되 표시를
 * 구분하고, 이용 중단(메타데이터 이용 조건 종료 포함)은 article을 null로 내려
 * 제목·매체·게시일 자체를 노출하지 않는다.
 */
export type ArchiveEntryDisplayStatus =
  | "available"
  | "access-failed"
  | "derivative-expired"
  | "discontinued";

export type ArchiveEntryApiModel = {
  id: string;
  selectedAt: ApiTimestamp;
  article: Pick<ArticleApiModel, "id" | "title" | "source"> | null;
  displayStatus: ArchiveEntryDisplayStatus;
  /**
   * displayStatus가 "discontinued"일 때의 구체적 사유(예: 메타데이터 이용 조건 종료,
   * 제공사 요청 등). 생략하면 화면에서 일반 안내 문구로 대체한다.
   */
  discontinuedReason?: string | null;
};

export type ArchiveApiModel = {
  groups: Array<{ date: string; entries: ArchiveEntryApiModel[] }>;
};

export type SettingsApiModel = {
  viewer: ViewerApiModel;
  topics: Array<{ id: string; label: string; selected: boolean }>;
  account: {
    canRequestDeletion: boolean;
    persistenceDescription: string;
  } | null;
};

export type AddToTodayListRequest = {
  articleId: string;
};

export type AuthenticationApiModel = {
  viewer: ViewerApiModel;
};

export type CreateQuizSessionRequest = {
  format: QuizFormat;
};

export type SubmitQuizAnswerRequest = {
  answer: string;
};

export type UpdateInterestTopicsRequest = {
  topicIds: string[];
};
