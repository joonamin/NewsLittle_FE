import { queryOptions } from "@tanstack/react-query";

import type { QuizDomain } from "./api-models";
import { screenApi } from "./screen-api";
import { defaultGuestNavigation } from "./view-models";

export const queryKeys = {
  home: ["home"] as const,
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
};

export const homeQueryOptions = queryOptions({
  queryKey: queryKeys.home,
  queryFn: screenApi.home,
});

export const navigationQueryOptions = queryOptions({
  queryKey: queryKeys.navigation,
  queryFn: screenApi.navigation,
  placeholderData: defaultGuestNavigation,
});
