/**
 * [안내]
 * 현재 도메인 API 인터페이스 및 요구사항 정의는 초기 설계 단계이며 아직 완전하게 고도화되지 않았습니다.
 * 백엔드 구현 및 서비스 요구사항 변경/고도화에 따라 필드 규격, 엔드포인트 및 타입 정의가 추후 변경될 가능성이 존재합니다.
 */

export type ApiTimestamp = string;

export type ViewerRole = "guest" | "member";
export type QuizDomain = "shortform" | "random";
export type QuizFormat = "choice" | "written";
export type QuestionKind = "fact" | "semantic";

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
    items: ArticleApiModel[];
    currentIndex: number;
    nextCursor: string | null;
    canLoadPreviousDates: boolean;
  };
  todayList: TodayListApiModel | null;
  pendingPreviousList: PreviousListApiModel | null;
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
};

export type QuizResolutionApiModel = {
  outcome: "correct" | "incorrect" | "given-up" | "pending";
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

export type ArchiveEntryApiModel = {
  id: string;
  selectedAt: ApiTimestamp;
  article: Pick<ArticleApiModel, "id" | "title" | "source"> | null;
  displayStatus: "available" | "restricted";
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

export type CreateQuizSessionRequest = {
  format: QuizFormat;
};

export type SubmitQuizAnswerRequest = {
  answer: string;
};

export type UpdateInterestTopicsRequest = {
  topicIds: string[];
};
