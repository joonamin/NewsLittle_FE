import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import type { QuizDomain } from "./api-models";
import { screenApi } from "./screen-api";
import { defaultGuestNavigation, type FeedViewModel } from "./view-models";

import { adminApi } from "./admin-api";

export const queryKeys = {
  home: ["home"] as const,
  feed: ["feed"] as const,
  navigation: ["navigation"] as const,
  archive: ["archive"] as const,
  settings: ["settings"] as const,
  quiz: {
    preview: (domain: QuizDomain) => ["quiz", domain, "preview"] as const,
    session: (domain: QuizDomain, sessionId: string) =>
      ["quiz", domain, "session", sessionId] as const,
    result: (domain: QuizDomain, sessionId: string) =>
      ["quiz", domain, "result", sessionId] as const,
  },
  admin: {
    dashboard: ["admin", "dashboard"] as const,
    queue: ["admin", "review", "queue"] as const,
    articleReview: (articleId: number) => ["admin", "review", "article", articleId] as const,
    usageBases: ["admin", "usage-bases"] as const,
    usageBasis: (id: string) => ["admin", "usage-bases", id] as const,
    assets: ["admin", "assets"] as const,
    asset: (id: number) => ["admin", "assets", id] as const,
    deletions: ["admin", "deletions"] as const,
    deletion: (id: string) => ["admin", "deletions", id] as const,
    reports: ["admin", "reports"] as const,
    report: (id: string) => ["admin", "reports", id] as const,
  },
};

export const homeQueryOptions = queryOptions({
  queryKey: queryKeys.home,
  queryFn: () => screenApi.home(),
});

export function feedInfiniteQueryOptions(initialFeed?: FeedViewModel) {
  return infiniteQueryOptions({
    queryKey: queryKeys.feed,
    queryFn: ({ pageParam }: { pageParam: string | null }) =>
      screenApi.feed({ cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: initialFeed
      ? {
          pages: [initialFeed],
          pageParams: [null],
        }
      : undefined,
  });
}

export const navigationQueryOptions = queryOptions({
  queryKey: queryKeys.navigation,
  queryFn: screenApi.navigation,
  placeholderData: defaultGuestNavigation,
});

export const archiveQueryOptions = queryOptions({
  queryKey: queryKeys.archive,
  queryFn: () => screenApi.archive(),
});

export const settingsQueryOptions = queryOptions({
  queryKey: queryKeys.settings,
  queryFn: () => screenApi.settings(),
});

export function quizPreviewQueryOptions(domain: QuizDomain) {
  return queryOptions({
    queryKey: queryKeys.quiz.preview(domain),
    queryFn: () => (domain === "random" ? screenApi.randomPreview() : screenApi.shortformPreview()),
  });
}

export function quizSessionQueryOptions(domain: QuizDomain, sessionId: string) {
  return queryOptions({
    queryKey: queryKeys.quiz.session(domain, sessionId),
    queryFn: () => screenApi.session(domain, sessionId),
  });
}

export function quizResultQueryOptions(domain: QuizDomain, sessionId: string) {
  return queryOptions({
    queryKey: queryKeys.quiz.result(domain, sessionId),
    queryFn: () => screenApi.result(domain, sessionId),
  });
}

export const adminDashboardSummaryQueryOptions = queryOptions({
  queryKey: queryKeys.admin.dashboard,
  queryFn: () => adminApi.dashboardSummary(),
});

export const adminReviewQueueQueryOptions = queryOptions({
  queryKey: queryKeys.admin.queue,
  queryFn: () => adminApi.reviewQueue(),
});

export function adminArticleReviewQueryOptions(articleId: number) {
  return queryOptions({
    queryKey: queryKeys.admin.articleReview(articleId),
    queryFn: () => adminApi.articleReview(articleId),
  });
}
