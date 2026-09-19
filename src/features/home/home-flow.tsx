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

import { ApiError } from "@/lib/api-client";
import { clearGuestTopics, getGuestTopics } from "@/lib/guest-topics";
import { disableGoogleAutoSignIn } from "@/lib/google-identity";
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

/** AC-01 오류 코드 표(구글 로그인)를 화면 문구로 변환한다. */
function describeSignInError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "INVALID_CREDENTIALS":
        return "인증에 실패했습니다. 다시 시도해 주세요.";
      case "RATE_LIMITED":
        return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
      case "DEPENDENCY_UNAVAILABLE":
        return "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
      case "PERMISSION_DENIED":
        return "로그인 요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.";
      default:
        break;
    }
  }
  return "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}

type PendingAction = { type: "select-article"; articleId: string } | null;

export type HomeFlowState = {
  loginOpen: boolean;
  loginPending: boolean;
  loginError: string | null;
  pendingAction: PendingAction;
  /** 로그인 직후 설정 화면이 한 번 안내할 관심 주제 반영 경로(AC-33). */
  interestsSource: InterestsSource | null;
};

type HomeFlowAction =
  | { type: "set-pending-selection"; articleId: string }
  | { type: "clear-pending-action" }
  | { type: "open-login" }
  | { type: "close-login" }
  | { type: "login-pending" }
  | { type: "login-idle" }
  | { type: "login-error"; message: string }
  | { type: "login-succeeded"; interestsSource: InterestsSource | null }
  | { type: "clear-interests-source" };

export const initialHomeFlowState: HomeFlowState = {
  loginOpen: false,
  loginPending: false,
  loginError: null,
  pendingAction: null,
  interestsSource: null,
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
      return { ...state, loginOpen: true, loginPending: false, loginError: null };
    case "close-login":
      return { ...state, loginOpen: false, loginPending: false, loginError: null };
    case "login-pending":
      return { ...state, loginPending: true, loginError: null };
    case "login-idle":
      return { ...state, loginPending: false };
    case "login-error":
      return { ...state, loginPending: false, loginError: action.message };
    case "login-succeeded":
      return { ...state, interestsSource: action.interestsSource };
    case "clear-interests-source":
      return state.interestsSource === null ? state : { ...state, interestsSource: null };
  }
}

export type ArticleSelectionResult =
  | "added"
  | "already-selected"
  | "login-required"
  | "previous-list-required"
  | "unavailable";

export type PreviousListDecision = "archive" | "discard";

/**
 * AC-33: 로그인 직후 관심 주제가 어디서 왔는지를 설정 화면이 한 번 안내한다.
 * 서버가 로그인 응답으로 알려주는 값이라 화면에서 추측하지 않는다.
 */
export type InterestsSource = "browser" | "account";

type HomeFlowContextValue = HomeFlowState & {
  home: HomeViewModel | null;
  navigation: GlobalNavigationViewModel;
  cancelPendingAction: () => void;
  closeLogin: () => void;
  completeLogin: (credential: string) => Promise<ArticleSelectionResult>;
  logout: () => Promise<void>;
  previousListDecision: PreviousListDecision | null;
  previousListError: boolean;
  removeArticle: (articleId: string) => Promise<void>;
  archiveTodayList: (title: string) => Promise<void>;
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
      queryClient.invalidateQueries({ queryKey: queryKeys.settings }),
    ]);
  }, [queryClient]);

  useEffect(() => {
    const refreshWhenHomeReturns = (url: string) => {
      if (isHomeRoute(url)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.home });
      }
      // AC-33 안내는 로그인 직후 설정 화면에서 한 번만 쓰인다. 화면을 떠나면 비운다.
      if (url.split(/[?#]/, 1)[0] !== "/settings") {
        dispatch({ type: "clear-interests-source" });
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
    onMutate: async (articleId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.home });
      const previousHome = queryClient.getQueryData<HomeViewModel>(queryKeys.home);
      queryClient.setQueryData<HomeViewModel>(queryKeys.home, (current) => {
        if (!current?.todayList) return current;
        return {
          ...current,
          todayList: {
            ...current.todayList,
            items: current.todayList.items.filter((item) => item.articleId !== articleId),
          },
        };
      });
      return { previousHome };
    },
    // 404는 이미 삭제된 상태이므로 방금 지운 항목을 다시 되돌리지 않는다.
    onError: (error, _articleId, context) => {
      if (error instanceof ApiError && error.status === 404) return;
      if (context?.previousHome) {
        queryClient.setQueryData(queryKeys.home, context.previousHome);
      }
    },
    onSettled: invalidateHomeQueries,
  });
  const archiveTodayListMutation = useMutation({
    mutationFn: screenApi.archiveTodayList,
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
      const currentHome = home ?? (await queryClient.ensureQueryData(homeQueryOptions));
      if (!currentHome.viewer.isMember) {
        dispatch({ type: "set-pending-selection", articleId });
        dispatch({ type: "open-login" });
        return "login-required";
      }
      if (currentHome.needsPreviousListDecision) {
        dispatch({ type: "set-pending-selection", articleId });
        return "previous-list-required";
      }
      return addArticle(articleId, currentHome);
    },
    [addArticle, home, queryClient],
  );

  const completeLogin = useCallback(async (credential: string): Promise<ArticleSelectionResult> => {
    dispatch({ type: "login-pending" });

    const browserTopicIds = getGuestTopics();
    try {
      const authenticated = await signIn.mutateAsync({
        credential,
        ...(browserTopicIds.length > 0 ? { topicIds: browserTopicIds } : {}),
      });
      dispatch({ type: "login-succeeded", interestsSource: authenticated.interestsSource ?? null });
    } catch (error) {
      dispatch({ type: "login-error", message: describeSignInError(error) });
      return "login-required";
    }
    // 로그인 성공 후에는 브라우저 저장값의 역할이 끝난다. 남겨두면 이후 다른 계정으로
    // 로그인할 때 이번 계정과 무관한 값이 재사용될 수 있어 매 로그인 시도마다 비운다.
    clearGuestTopics();

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
      try {
        await removeFromTodayList.mutateAsync(articleId);
      } catch (error) {
        // 낙관적 업데이트로 이미 화면에서는 제거됐다 — 404는 조용히 무시하고,
        // 그 외 에러만 콘솔에 남긴다.
        if (!(error instanceof ApiError && error.status === 404)) {
          console.error("오늘 목록에서 기사를 삭제하지 못했습니다.", error);
        }
      }
    },
    [removeFromTodayList],
  );

  const archiveTodayList = useCallback(
    async (title: string) => {
      await archiveTodayListMutation.mutateAsync(title);
    },
    [archiveTodayListMutation],
  );

  const logout = useCallback(async () => {
    disableGoogleAutoSignIn();
    dispatch({ type: "clear-pending-action" });
    dispatch({ type: "clear-interests-source" });
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
      archiveTodayList,
      requestLogin: () => dispatch({ type: "open-login" }),
      requestArticleSelection,
      resolvePreviousLists,
    }),
    [
      archiveTodayList,
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
