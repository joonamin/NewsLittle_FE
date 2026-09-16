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

import { screenApi } from "@/features/contracts/screen-api";
import {
  defaultGuestNavigation,
  type GlobalNavigationViewModel,
  type HomeViewModel,
} from "@/features/contracts/view-models";

type LoadState = "loading" | "ready" | "error";
type PendingAction = { type: "select-article"; articleId: string } | null;

export type HomeFlowState = {
  home: HomeViewModel | null;
  loginOpen: boolean;
  navigation: GlobalNavigationViewModel;
  pendingAction: PendingAction;
  status: LoadState;
};

type HomeFlowAction =
  | { type: "load-start" }
  | { type: "load-success"; home: HomeViewModel; navigation: GlobalNavigationViewModel }
  | { type: "navigation-success"; navigation: GlobalNavigationViewModel }
  | { type: "load-failure" }
  | { type: "set-pending-selection"; articleId: string }
  | { type: "clear-pending-action" }
  | { type: "open-login" }
  | { type: "close-login" };

export const initialHomeFlowState: HomeFlowState = {
  home: null,
  loginOpen: false,
  navigation: defaultGuestNavigation,
  pendingAction: null,
  status: "loading",
};

export function isHomeRoute(url: string) {
  return url.split(/[?#]/, 1)[0] === "/";
}

export function homeFlowReducer(state: HomeFlowState, action: HomeFlowAction): HomeFlowState {
  switch (action.type) {
    case "load-start":
      return { ...state, status: "loading" };
    case "load-success":
      return { ...state, home: action.home, navigation: action.navigation, status: "ready" };
    case "navigation-success":
      return { ...state, navigation: action.navigation };
    case "load-failure":
      return { ...state, status: "error" };
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
  cancelPendingAction: () => void;
  closeLogin: () => void;
  completeLogin: () => Promise<ArticleSelectionResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<HomeViewModel | null>;
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
  const [state, dispatch] = useReducer(homeFlowReducer, initialHomeFlowState);

  const refresh = useCallback(async () => {
    dispatch({ type: "load-start" });
    try {
      const [homeResult, navigationResult] = await Promise.allSettled([
        screenApi.home(),
        screenApi.navigation(),
      ]);
      const navigation =
        navigationResult.status === "fulfilled" ? navigationResult.value : defaultGuestNavigation;
      if (navigationResult.status === "fulfilled") {
        dispatch({ type: "navigation-success", navigation });
      }
      if (homeResult.status === "fulfilled") {
        dispatch({ type: "load-success", home: homeResult.value, navigation });
        return homeResult.value;
      }
      dispatch({ type: "load-failure" });
      return null;
    } catch {
      dispatch({ type: "load-failure" });
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const refreshWhenHomeReturns = (url: string) => {
      if (isHomeRoute(url)) void refresh();
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    router.events.on("routeChangeComplete", refreshWhenHomeReturns);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      router.events.off("routeChangeComplete", refreshWhenHomeReturns);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh, router.events]);

  const addArticle = useCallback(
    async (articleId: string, home: HomeViewModel): Promise<ArticleSelectionResult> => {
      if (isAlreadySelected(home, articleId)) return "already-selected";
      await screenApi.addToTodayList({ articleId });
      await refresh();
      dispatch({ type: "clear-pending-action" });
      return "added";
    },
    [refresh],
  );

  const requestArticleSelection = useCallback(
    async (articleId: string): Promise<ArticleSelectionResult> => {
      const home = state.home;
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
    [addArticle, state.home],
  );

  const completeLogin = useCallback(async (): Promise<ArticleSelectionResult> => {
    await screenApi.signInWithGoogle();
    const home = await refresh();
    dispatch({ type: "close-login" });
    if (!home) return "unavailable";
    if (home.needsPreviousListDecision) return "previous-list-required";
    const pendingArticleId = state.pendingAction?.articleId;
    return pendingArticleId ? addArticle(pendingArticleId, home) : "added";
  }, [addArticle, refresh, state.pendingAction]);

  const resolvePreviousLists = useCallback(
    async (decision: PreviousListDecision): Promise<ArticleSelectionResult> => {
      const home =
        decision === "archive"
          ? await screenApi.archivePreviousLists()
          : await screenApi.discardPreviousLists();
      await refresh();

      const pendingArticleId = state.pendingAction?.articleId;
      if (!pendingArticleId) return "added";
      if (home.needsPreviousListDecision || !home.viewer.isMember) return "previous-list-required";
      return addArticle(pendingArticleId, home);
    },
    [addArticle, refresh, state.pendingAction],
  );

  const removeArticle = useCallback(
    async (articleId: string) => {
      await screenApi.removeFromTodayList(articleId);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    await screenApi.signOut();
    dispatch({ type: "clear-pending-action" });
    await refresh();
  }, [refresh]);

  const value = useMemo<HomeFlowContextValue>(
    () => ({
      ...state,
      cancelPendingAction: () => dispatch({ type: "clear-pending-action" }),
      closeLogin: () => {
        dispatch({ type: "clear-pending-action" });
        dispatch({ type: "close-login" });
      },
      completeLogin,
      logout,
      refresh,
      removeArticle,
      requestLogin: () => dispatch({ type: "open-login" }),
      requestArticleSelection,
      resolvePreviousLists,
    }),
    [completeLogin, logout, refresh, removeArticle, requestArticleSelection, resolvePreviousLists, state],
  );

  return <HomeFlowContext value={value}>{children}</HomeFlowContext>;
}

export function useHomeFlow() {
  const value = useContext(HomeFlowContext);
  if (!value) throw new Error("useHomeFlow must be used inside HomeFlowProvider");
  return value;
}
