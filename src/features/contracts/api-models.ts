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

export type ViewerRole = "guest" | "member" | "admin";
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
  /**
   * 홈 카드 본문(bodyText): AI가 기사를 함축해 새로 쓴 단문 4~5문장(BE key_sentence).
   * summary(AI 한 줄 요약)와 다른 글이다 — 둘을 같은 값으로 채우지 않는다.
   */
  body: {
    status: "available" | "unavailable";
    text: string | null;
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

export type FeedApiModel = {
  items: FeedItemApiModel[];
  currentIndex: number;
  nextCursor: string | null;
  canLoadPreviousDates: boolean;
};

export type HomeApiModel = {
  viewer: ViewerApiModel;
  feed: FeedApiModel;
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

/** "records"는 기록 삭제 요청, "account"는 탈퇴 요청. 서버는 둘을 별도 경로로 받는다. */
export type DeletionRequestKind = "records" | "account";
export type DeletionRequestState = "REQUESTED" | "PROCESSING" | "DONE" | "FAILED";

export type DeletionRequestApiModel = {
  state: DeletionRequestState;
  requestedAt: ApiTimestamp;
  completedAt: ApiTimestamp | null;
};

/**
 * GET /api/v1/auth/me. 설정 화면(SCR-09)은 이 응답 하나로 구성된다 — 서버에는
 * 화면 전용 조회 엔드포인트가 없고, 주제 목록·라벨과 저장 위치 안내 문구는
 * 프론트 카탈로그(contracts/topics.ts)가 갖는다.
 *
 * 비회원도 200이며 status만 "guest"다. 탈퇴가 DONE이 되면 계정 자체가 사라져
 * accountDeletionRequest로는 다시 조회되지 않는다 — 완료 표시는 요청에 대한
 * 응답이 직접 전달한다.
 */
export type AuthMeApiModel = {
  status: "guest" | "authenticated";
  email: string | null;
  displayName: string | null;
  role: ViewerRole;
  /** 서버는 항상 알파벳순으로 내려준다. 프론트가 보낸 순서는 보존되지 않는다. */
  interests: TopicCode[];
  interestsSetAt: ApiTimestamp | null;
  accountDeletionRequest: DeletionRequestApiModel | null;
  canRequestAccountDeletion: boolean;
  recordsDeletionRequest: DeletionRequestApiModel | null;
  canRequestRecordsDeletion: boolean;
};

/** PUT /api/v1/settings/interests 응답. 화면 전체가 아니라 관심 주제만 돌아온다. */
export type InterestsApiModel = {
  interests: TopicCode[];
  interestsSetAt: ApiTimestamp | null;
};

/** 파괴적 동작 확인 단계(NFR-07)를 서버도 한 번 더 강제한다. true가 아니면 422다. */
export type DeletionConfirmationRequest = {
  confirm: true;
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
  /**
   * AC-33: 이번 로그인에서 관심 주제가 반영된 경로 — "browser"(브라우저 설정을
   * 계정에 반영), "account"(기존 계정 설정 유지), null(반영할 대상 없음).
   * 설정 화면이 로그인 직후 한 번 보여주는 안내 문구의 근거다.
   */
  interestsSource: "browser" | "account" | null;
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

/**
 * GLB-03 신고 모달의 접수 유형 4종·대상 화면 3종. BE `newslittle.modules.reports`
 * (schemas.py·models.py)와 1:1로 맞춘 값이며, 이 값이 아니면 `extra="forbid"`·
 * enum 검증에 의해 422로 거절된다. ADM-06 접수 유형과 동일한 코드를 쓴다.
 */
export type ReportType = "CONTENT_ERROR" | "JUDGMENT_ERROR" | "RIGHTS" | "SOURCE_UNREACHABLE";

export type ReportSurface = "HOME_CARD" | "QUIZ" | "ARCHIVE";

export type SubmitReportRequest = {
  reportType: ReportType;
  surface: ReportSurface;
  /** 신고 대상 기사의 실제 article id. surface와 무관하게 항상 필요하다. */
  articleId: string;
  /** surface가 "QUIZ"일 때만, 그리고 반드시 있어야 한다(BE model_validator). */
  quizId?: string | null;
  /**
   * 판정 오류 신고에서만, 그리고 반드시 있어야 한다. `"shortform:<answerId>"` |
   * `"random:<answerId>"` — answerId는 문항이 아니라 실제 제출된 답변 행의 PK다.
   * 현재 숏폼·랜덤 퀴즈 응답 계약(QuizSessionData/QuizResolutionApiModel) 어디에도
   * 이 PK가 내려오지 않아 FE가 구성할 방법이 없다 — BE가 필드를 추가하기 전까지는
   * 판정 오류 신고를 제출 단계에서 막아야 한다(report-modal.tsx 참고).
   */
  answerRef?: string | null;
  details: string;
  /** 권리 신고만 필수, 그 외는 선택. 계정 이메일을 자동으로 채우지 않는다(COM-04). */
  contact?: string | null;
};

export type ReportJudgmentAttachmentApiModel = {
  answerRef: string;
  submittedAnswer: string;
  quizVersion: number;
  judgeVersion: string | null;
};

export type SubmitReportApiModel = {
  id: string;
  reportType: ReportType;
  surface: ReportSurface;
  status: "RECEIVED";
  contactProvided: boolean;
  judgmentAttachment: ReportJudgmentAttachmentApiModel | null;
  createdAt: ApiTimestamp;
};
