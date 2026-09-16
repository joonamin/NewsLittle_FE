import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  homeQueryOptions,
  navigationQueryOptions,
  queryKeys,
} from "@/features/contracts/query-keys";
import { screenApi } from "@/features/contracts/screen-api";
import {
  defaultGuestNavigation,
  type GlobalNavigationViewModel,
  type HomeViewModel,
} from "@/features/contracts/view-models";

type PendingAction = { type: "select-article"; articleId: string } | null;

export type HomeFlowState = {
  loginOpen: boolean;
  pendingAction: PendingAction;
};

type HomeFlowAction =
  | { type: "set-pending-selection"; articleId: string }
  | { type: "clear-pending-action" }
  | { type: "open-login" }
  | { type: "close-login" };

export const initialHomeFlowState: HomeFlowState = {
  loginOpen: false,
  pendingAction: null,
};

export function isHomeRoute(url: string) {
  return url.split(/[?#]/, 1)[0] === "/";
}

export function homeFlowReducer(state: HomeFlowState, action: HomeFlowAction): HomeFlowState {
  switch (action.type) {
    case "set-pending-selection":
      return { ...state, pendingAction: { type: "select-article", articleId: action.articleId } };
    case "clear-pending-action":
      return { ...state, pendingAction: null };
    case "open-login":
      return { ...state, loginOpen: true };
    case "close-login":
      return { ...state, loginOpen: false };
  }
}

export type ArticleSelectionResult =
  | "added"
  | "already-selected"
  | "login-required"
  | "previous-list-required"
  | "unavailable";

export type PreviousListDecision = "archive" | "discard";

type HomeFlowContextValue = HomeFlowState & {
  home: HomeViewModel | null;
  navigation: GlobalNavigationViewModel;
  cancelPendingAction: () => void;
  closeLogin: () => void;
  completeLogin: () => Promise<ArticleSelectionResult>;
  logout: () => Promise<void>;
  previousListDecision: PreviousListDecision | null;
  previousListError: boolean;
  removeArticle: (articleId: string) => Promise<void>;
  requestLogin: () => void;
  requestArticleSelection: (articleId: string) => Promise<ArticleSelectionResult>;
  resolvePreviousLists: (decision: PreviousListDecision) => Promise<ArticleSelectionResult>;
};

const HomeFlowContext = createContext<HomeFlowContextValue | null>(null);

function isAlreadySelected(home: HomeViewModel, articleId: string) {
  return home.todayList?.items.some((item) => item.articleId === articleId) ?? false;
}

export function HomeFlowProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(homeFlowReducer, initialHomeFlowState);
  const homeQuery = useQuery(homeQueryOptions);
  const navigationQuery = useQuery(navigationQueryOptions);
  const home = homeQuery.data ?? null;
  const navigation = navigationQuery.data ?? defaultGuestNavigation;

  const invalidateHomeQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.home }),
      queryClient.invalidateQueries({ queryKey: queryKeys.navigation }),
    ]);
  }, [queryClient]);

  useEffect(() => {
    const refreshWhenHomeReturns = (url: string) => {
      if (isHomeRoute(url)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.home });
      }
    };

    router.events.on("routeChangeComplete", refreshWhenHomeReturns);
    return () => {
      router.events.off("routeChangeComplete", refreshWhenHomeReturns);
    };
  }, [queryClient, router.events]);

  const addToTodayList = useMutation({
    mutationFn: (articleId: string) => screenApi.addToTodayList({ articleId }),
    onSuccess: invalidateHomeQueries,
  });
  const removeFromTodayList = useMutation({
    mutationFn: screenApi.removeFromTodayList,
    onSuccess: invalidateHomeQueries,
  });
  const signIn = useMutation({
    mutationFn: screenApi.signInWithGoogle,
    onSuccess: invalidateHomeQueries,
  });
  const signOut = useMutation({
    mutationFn: screenApi.signOut,
    onSuccess: invalidateHomeQueries,
  });
  const resolvePreviousListsMutation = useMutation({
    mutationFn: (decision: PreviousListDecision) =>
      decision === "archive"
        ? screenApi.archivePreviousLists()
        : screenApi.discardPreviousLists(),
    onSuccess: invalidateHomeQueries,
  });

  const addArticle = useCallback(
    async (articleId: string, currentHome: HomeViewModel): Promise<ArticleSelectionResult> => {
      if (isAlreadySelected(currentHome, articleId)) return "already-selected";
      await addToTodayList.mutateAsync(articleId);
      dispatch({ type: "clear-pending-action" });
      return "added";
    },
    [addToTodayList],
  );

  const requestArticleSelection = useCallback(
    async (articleId: string): Promise<ArticleSelectionResult> => {
      if (!home) return "unavailable";
      if (!home.viewer.isMember) {
        dispatch({ type: "set-pending-selection", articleId });
        dispatch({ type: "open-login" });
        return "login-required";
      }
      if (home.needsPreviousListDecision) {
        dispatch({ type: "set-pending-selection", articleId });
        return "previous-list-required";
      }
      return addArticle(articleId, home);
    },
    [addArticle, home],
  );

  const completeLogin = useCallback(async (): Promise<ArticleSelectionResult> => {
    await signIn.mutateAsync();
    dispatch({ type: "close-login" });
    const nextHome = await queryClient.ensureQueryData(homeQueryOptions);
    if (nextHome.needsPreviousListDecision) return "previous-list-required";
    const pendingArticleId = state.pendingAction?.articleId;
    return pendingArticleId ? addArticle(pendingArticleId, nextHome) : "added";
  }, [addArticle, queryClient, signIn, state.pendingAction]);

  const resolvePreviousLists = useCallback(
    async (decision: PreviousListDecision): Promise<ArticleSelectionResult> => {
      try {
        const nextHome = await resolvePreviousListsMutation.mutateAsync(decision);
        const pendingArticleId = state.pendingAction?.articleId;
        if (!pendingArticleId) return "added";
        if (nextHome.needsPreviousListDecision || !nextHome.viewer.isMember) {
          return "previous-list-required";
        }
        return addArticle(pendingArticleId, nextHome);
      } catch {
        return "unavailable";
      }
    },
    [addArticle, resolvePreviousListsMutation, state.pendingAction],
  );

  const removeArticle = useCallback(
    async (articleId: string) => {
      await removeFromTodayList.mutateAsync(articleId);
    },
    [removeFromTodayList],
  );

  const logout = useCallback(async () => {
    dispatch({ type: "clear-pending-action" });
    await signOut.mutateAsync();
  }, [signOut]);

  const value = useMemo<HomeFlowContextValue>(
    () => ({
      ...state,
      home,
      navigation,
      cancelPendingAction: () => dispatch({ type: "clear-pending-action" }),
      closeLogin: () => {
        dispatch({ type: "clear-pending-action" });
        dispatch({ type: "close-login" });
      },
      completeLogin,
      logout,
      previousListDecision: resolvePreviousListsMutation.isPending
        ? (resolvePreviousListsMutation.variables ?? null)
        : null,
      previousListError: resolvePreviousListsMutation.isError,
      removeArticle,
      requestLogin: () => dispatch({ type: "open-login" }),
      requestArticleSelection,
      resolvePreviousLists,
    }),
    [
      completeLogin,
      home,
      logout,
      navigation,
      removeArticle,
      requestArticleSelection,
      resolvePreviousLists,
      resolvePreviousListsMutation.isError,
      resolvePreviousListsMutation.isPending,
      resolvePreviousListsMutation.variables,
      state,
    ],
  );

  return <HomeFlowContext value={value}>{children}</HomeFlowContext>;
}

export function useHomeFlow() {
  const value = useContext(HomeFlowContext);
  if (!value) throw new Error("useHomeFlow must be used inside HomeFlowProvider");
  return value;
}
