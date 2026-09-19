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
export type AccountRole = "member" | "admin";
export type TopicCode = "ECONOMY" | "SOCIETY" | "AI_IT" | "SCIENCE" | "WORLD" | "POLITICS";
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
 * account.status는 "guest" | "member"이며 /auth/me의 "authenticated" | "guest"와는 다른 값이다.
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

export type DeletionRequestKind = "records" | "account";
export type DeletionRequestOutcome = "completed" | "failed";

export type DeletionRequestApiModel = {
  kind: DeletionRequestKind;
  outcome: DeletionRequestOutcome;
  requestedAt: ApiTimestamp;
} | null;

export type SettingsApiModel = {
  viewer: ViewerApiModel;
  topics: Array<{ id: TopicCode; label: string; selected: boolean }>;
  account: {
    emailMasked: string;
    canRequestDeletion: boolean;
    persistenceDescription: string;
    /** 가장 최근 삭제·탈퇴 요청의 처리 결과. 요청이 없거나 처리 중이면 null. */
    lastDeletionRequest: DeletionRequestApiModel;
  } | null;
};

export type RequestAccountDeletionRequest = {
  kind: DeletionRequestKind;
};

export type AddToTodayListRequest = {
  articleId: string;
};

export type SignInWithGoogleRequest = {
  /** Google Identity Services(One Tap/버튼)에서 발급받은 ID Token(JWT) */
  credential: string;
  /**
   * 비회원 상태에서 브라우저에 저장돼 있던 관심 주제. 계정에 설정된 적이 없을 때만 반영된다.
   * 백엔드는 "browserTopicIds" 필드도 동일한 용도로 받지만 존재하기만 하면(빈 배열이어도)
   * topicIds를 병합 없이 완전히 무시하므로, 프론트는 이 필드 하나만 사용한다.
   */
  topicIds?: TopicCode[];
};

export type AuthenticationApiModel = {
  email: string;
  displayName: string;
  /** 이번 로그인으로 신규 가입됐는지 여부 */
  isNewUser: boolean;
  /** 프론트가 보낸 topicIds 순서가 아니라 항상 알파벳순으로 내려온다. */
  interests: TopicCode[];
  interestsSetAt: ApiTimestamp | null;
  role: AccountRole;
};

export type CreateQuizSessionRequest = {
  format: QuizFormat;
};

export type SubmitQuizAnswerRequest = {
  answer: string;
};

export type UpdateInterestTopicsRequest = {
  topicIds: TopicCode[];
};
