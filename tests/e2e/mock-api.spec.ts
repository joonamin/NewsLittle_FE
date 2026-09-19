import { expect, test } from "@playwright/test";

import { firstArticle, nextPageArticle, secondArticle } from "../../src/mocks/fixtures";

test("member home uses the PEN feed card and today-list sidebar interaction", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: firstArticle.title })).toBeVisible();
  await expect(page.getByRole("img", { name: "나무가 우거진 공원 산책로" })).toBeVisible();
  await expect(page.getByRole("button", { name: "오늘 목록에 담김" })).toBeVisible();

  await page.getByRole("button", { name: "오늘 목록에 담김" }).click();
  await expect(page.getByRole("button", { name: "오늘 목록에 담기" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "오늘 목록" })).not.toContainText(firstArticle.title);

  await page.getByRole("button", { name: "오늘 목록에 담기" }).click();
  await expect(page.getByRole("button", { name: "오늘 목록에 담김" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "오늘 목록" })).toContainText(firstArticle.title);

  await page.getByRole("button", { name: "다음 기사" }).click();
  await expect(page.getByRole("heading", { name: secondArticle.title })).toBeVisible();
  await expect(page.getByRole("img", { name: "나무가 우거진 공원 산책로" })).toHaveCount(0);

  await page.getByRole("button", { name: "오늘 목록에 담기" }).click();
  await expect(page.getByRole("button", { name: "오늘 목록에 담김" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "오늘 목록" })).toContainText(secondArticle.title);

  await page.getByRole("button", { name: `${secondArticle.title} 삭제` }).click();
  await expect(page.getByRole("button", { name: "오늘 목록에 담기" })).toBeVisible();
});

test("archiving the today list with a title flushes it and shows up in the archive page", async ({ page }) => {
  await page.goto("/");

  const sidebar = page.getByRole("complementary", { name: "오늘 목록" });
  await expect(sidebar).toContainText(firstArticle.title);

  const titleInput = page.getByRole("textbox", { name: "오늘 목록 제목" });
  const archiveButton = page.getByRole("button", { name: "아카이빙" });
  await expect(titleInput).toHaveValue(/^\d{8}_\d+$/);
  await expect(archiveButton).toBeEnabled();

  await titleInput.fill("이번 주 읽을거리");
  await expect(archiveButton).toBeEnabled();
  await archiveButton.click();

  await expect(page.getByText("아직 담은 기사가 없어요")).toBeVisible();
  await expect(titleInput).toHaveValue(/^\d{8}_\d+$/);

  // 목 서버 상태가 브라우저 페이지 컨텍스트에 살아 있으므로, 상태를 초기화시키는
  // 풀 네비게이션(page.goto) 대신 클라이언트 라우팅으로 이동해야 방금 만든 아카이브가 보인다.
  await page.getByRole("link", { name: "아카이브" }).click();
  await expect(page.getByText("이번 주 읽을거리", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: firstArticle.title })).toBeVisible();
});

test("archiving with a duplicate title shows an inline error and keeps the list", async ({ page }) => {
  await page.goto("/");

  const titleInput = page.getByRole("textbox", { name: "오늘 목록 제목" });
  await titleInput.fill("이번 주 읽을거리");
  await page.getByRole("button", { name: "아카이빙" }).click();
  await expect(page.getByText("아직 담은 기사가 없어요")).toBeVisible();

  await page.getByRole("button", { name: "오늘 목록에 담기" }).click();
  await expect(page.getByRole("complementary", { name: "오늘 목록" })).toContainText(firstArticle.title);

  await titleInput.fill("이번 주 읽을거리");
  await page.getByRole("button", { name: "아카이빙" }).click();

  await expect(page.getByText("이미 사용 중인 이름입니다.")).toBeVisible();
  await expect(page.getByRole("complementary", { name: "오늘 목록" })).toContainText(firstArticle.title);
});

test("fetches next cursor items and appends them to feed when reaching the end", async ({ page }) => {
  await page.goto("/");

  // 1번째 카드
  await expect(page.getByRole("heading", { name: firstArticle.title })).toBeVisible();
  await page.getByRole("button", { name: "다음 기사" }).click();

  // 2번째 카드
  await expect(page.getByRole("heading", { name: secondArticle.title })).toBeVisible();
  await page.getByRole("button", { name: "다음 기사" }).click();

  // 3번째 카드 (초기 목록의 마지막)
  await page.getByRole("button", { name: "다음 기사" }).click();

  // 다음 커서로 불러온 4번째 카드
  await expect(page.getByRole("heading", { name: nextPageArticle.title })).toBeVisible();

  // 마지막 페이지이므로 다음 기사 버튼이 비활성화됨
  await expect(page.getByRole("button", { name: "다음 기사" })).toBeDisabled();

  // 이전 기사로 되돌아가기 가능
  await page.getByRole("button", { name: "이전 기사" }).click();
  await expect(page.getByRole("button", { name: "다음 기사" })).toBeEnabled();
});

test("MSW returns the home API contract before a backend exists", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  const response = await page.evaluate(async () => {
    const apiResponse = await fetch("/api/v1/home");
    return {
      ok: apiResponse.ok,
      body: await apiResponse.json(),
    };
  });

  expect(response.ok).toBe(true);
  expect(response.body.meta.requestId).toBe("mock-request-id");
  expect(response.body.data.viewer.role).toBe("member");
  expect(response.body.data.feed.items).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        article: expect.objectContaining({
          id: "article-library-program",
          summary: expect.objectContaining({ aiGenerated: true }),
        }),
        isFromPreviousFeedDate: false,
      }),
    ]),
  );
});

test("MSW returns the server-authorized navigation contract", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  const response = await page.evaluate(async () => {
    const apiResponse = await fetch("/api/v1/navigation");
    return { ok: apiResponse.ok, body: await apiResponse.json() };
  });

  expect(response.ok).toBe(true);
  expect(response.body.meta.requestId).toBe("mock-request-id");
  expect(response.body.data.account.status).toBe("member");
  expect(response.body.data.primaryItems).not.toContainEqual(expect.objectContaining({ id: "operations" }));
});

test("MSW persists today-list mutations and switches the authenticated home state", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  const response = await page.evaluate(async () => {
    const before = await fetch("/api/v1/home").then((result) => result.json());
    await fetch("/api/v1/today-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: "article-science-class" }),
    });
    const afterAdd = await fetch("/api/v1/home").then((result) => result.json());
    await fetch("/api/v1/today-list/article-library-program", { method: "DELETE" });
    const afterRemove = await fetch("/api/v1/home").then((result) => result.json());
    await fetch("/api/v1/auth/logout", { method: "POST" });
    const guest = await fetch("/api/v1/home").then((result) => result.json());
    await fetch("/api/v1/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: "mock-google-credential" }),
    });
    const member = await fetch("/api/v1/home").then((result) => result.json());

    return { before, afterAdd, afterRemove, guest, member };
  });

  expect(response.before.data.todayList.items).toHaveLength(1);
  expect(response.afterAdd.data.todayList.items.map((item: { article: { id: string } }) => item.article.id)).toEqual([
    "article-library-program",
    "article-science-class",
  ]);
  expect(response.afterRemove.data.todayList.items.map((item: { article: { id: string } }) => item.article.id)).toEqual([
    "article-science-class",
  ]);
  expect(response.guest.data.viewer.role).toBe("guest");
  expect(response.guest.data.todayList).toBeNull();
  expect(response.member.data.viewer.role).toBe("member");
  expect(response.member.data.todayList.items).toHaveLength(1);
});

test("random quiz preview selects a format and creates a session", async ({ page }) => {
  await page.goto("/random");

  await expect(page.getByRole("heading", { name: "퀴즈로 새로운 뉴스를 만나보세요" })).toBeVisible();
  await expect(page.getByRole("radio", { name: /OX·객관식/ })).toHaveAttribute("aria-checked", "true");

  await page.getByRole("radio", { name: /주관식형/ }).click();
  await expect(page.getByRole("radio", { name: /주관식형/ })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "5문제 시작하기" }).click();

  await expect(page).toHaveURL("/random/random-written-demo-session");
  await expect(page.getByLabel("내 답변")).toBeVisible();
});

test("random choice quiz submits an answer and reveals the evidence article", async ({ page }) => {
  await page.goto("/random/random-demo-session");
  await page.getByRole("radio", { name: "청소년" }).click();
  await page.getByRole("button", { name: "제출하기" }).click();
  await expect(page.getByText("정답이에요")).toBeVisible();
  await expect(page.getByRole("heading", { name: /청소년 과학 교실/ })).toBeVisible();
});

test("random written quiz keeps empty answers out of judgement", async ({ page }) => {
  await page.goto("/random/random-written-demo-session");
  await expect(page.getByRole("button", { name: "제출하기" })).toBeDisabled();
  await page.getByLabel("내 답변").fill("청소년");
  await expect(page.getByRole("button", { name: "제출하기" })).toBeEnabled();
});

test("random written quiz shows a hint after an incorrect answer", async ({ page }) => {
  await page.goto("/random/random-written-demo-session");
  await page.getByLabel("내 답변").fill("성인");
  await page.getByRole("button", { name: "제출하기" }).click();
  await expect(page.getByText(/아직 정답이 아니에요/)).toBeVisible();
  await expect(page.getByRole("button", { name: "다시 제출" })).toBeVisible();
});

test("random quiz keeps the current index after giving up and answering the next question", async ({ page }) => {
  await page.goto("/random/random-written-demo-session");
  await page.getByRole("button", { name: "포기" }).click();
  await page.getByRole("button", { name: "다음 문제 →" }).click();
  await expect(page.getByText("02 / 05")).toBeVisible();
  await page.getByLabel("내 답변").fill("틀린 답");
  await page.getByRole("button", { name: "제출하기" }).click();
  await expect(page.getByText("02 / 05")).toBeVisible();
});

test("random choice quiz renders an incorrect resolution and can save its article", async ({ page }) => {
  await page.goto("/random/random-demo-session");
  await page.getByRole("radio", { name: "성인" }).click();
  await page.getByRole("button", { name: "제출하기" }).click();
  await expect(page.getByText("오답", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "오늘 목록에 담기" }).click();
  await expect(page.getByRole("button", { name: "오늘 목록에 담김" })).toBeDisabled();
});

test("random quiz result page renders summary, toggles recap items, and saves articles", async ({ page }) => {
  await page.goto("/random/random-demo-session/result");

  await expect(page.getByRole("heading", { name: "다섯 문제로 만난 오늘의 뉴스" })).toBeVisible();
  const summarySection = page.getByLabel("결과 요약");
  await expect(summarySection.getByText(/최초 계획 5문제/)).toBeVisible();
  await expect(summarySection.getByText("정답")).toBeVisible();
  await expect(summarySection.getByText("선택형 오답")).toBeVisible();
  await expect(summarySection.getByText("서비스 제외", { exact: true })).toBeVisible();

  const recapSection = page.getByLabel("문항별 복기");
  await expect(recapSection.getByRole("heading", { name: "문항별 복기" })).toBeVisible();
  await expect(recapSection.getByText(/01/)).toBeVisible();
  await expect(recapSection.getByRole("button", { name: "오늘 목록에 담기" })).toBeVisible();

  await recapSection.getByRole("button", { name: "오늘 목록에 담기" }).click();
  await expect(recapSection.getByRole("button", { name: "오늘 목록에 담김" })).toBeDisabled();

  await page.getByRole("button", { name: "새 회차 시작" }).click();
  await expect(page).toHaveURL("/random?format=choice");
});

test("archive shows grouped entries with status badges and supports collapse and delete", async ({ page }) => {
  await page.goto("/archive");

  await expect(page.getByRole("heading", { name: "아카이브" })).toBeVisible();
  await expect(
    page.getByText("제목과 원문 링크만 보관해요. 기사 본문·요약은 저장하지 않으며, 다시 푸는 퀴즈는 제공하지 않아요."),
  ).toBeVisible();

  const latestGroupHeader = page.getByRole("button", { name: /2026\. 9\. 12\. 선택 · 5개/ });
  await expect(latestGroupHeader).toHaveAttribute("aria-expanded", "true");
  await expect(latestGroupHeader.getByText("펼침")).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(5);
  await expect(page.getByText("원문 접근 실패 · 보관 기록 유지")).toBeVisible();
  await expect(page.getByText("요약·퀴즈 연결 없음")).toBeVisible();
  await expect(page.getByText("이용 중단으로 표시가 제한된 기사")).toHaveCount(2);
  await expect(
    page.getByText("메타데이터 이용 조건이 종료되어 제목과 원문 링크를 표시할 수 없습니다."),
  ).toBeVisible();
  await expect(
    page.getByText("제공처 요청으로 이용이 중단되어 제목과 원문 링크를 표시할 수 없습니다."),
  ).toBeVisible();

  const previousGroupHeader = page.getByRole("button", { name: /2026\. 8\. 10\. 선택 · 1개/ });
  await expect(previousGroupHeader).toHaveAttribute("aria-expanded", "false");
  await expect(previousGroupHeader.getByText("접힘")).toBeVisible();
  await previousGroupHeader.click();
  await expect(previousGroupHeader).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("listitem")).toHaveCount(6);

  await expect(page.getByRole("listitem").first()).toContainText(
    "모의 기사: 지역 공공도서관이 주말 프로그램을 확대합니다",
  );
  await page.getByRole("listitem").first().getByRole("button", { name: "삭제" }).click();
  await expect(page.getByText("모의 기사: 지역 공공도서관이 주말 프로그램을 확대합니다")).not.toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(5);
});

test("archive auto-opens a login prompt when the session becomes unauthenticated, cancel returns to the previous screen, and logging back in restores the archive", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  const nav = page.getByRole("navigation", { name: "주 내비게이션" });
  await nav.getByRole("link", { name: "아카이브" }).click();
  await expect(page.getByRole("heading", { name: "아카이브" })).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(5);

  // 세션이 끊겨 게스트가 되면 아카이브에서 로그인 모달이 자동으로 뜬다(FR-11).
  await page.getByRole("button", { name: "뉴스리틀 사용자" }).click();
  await page.getByRole("menuitem", { name: "로그아웃" }).click();
  const loginDialog = page.getByRole("dialog", { name: "로그인이 필요해요" });
  await expect(loginDialog).toBeVisible();

  // 로그인 없이 닫으면 이전 화면으로 돌아간다(FR-16).
  await loginDialog.getByRole("button", { name: "닫기" }).click();
  await expect(page).toHaveURL("/");

  // 다시 로그인한 뒤 아카이브로 이동한다.
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.getByRole("button", { name: "Google로 계속하기" }).click();
  await nav.getByRole("link", { name: "아카이브" }).click();
  await expect(page.getByRole("heading", { name: "아카이브" })).toBeVisible();

  // 아카이브에 머무는 동안 다시 게스트가 되어도, 로그인에 성공하면 본인 아카이브가 그대로 표시된다(FR-11).
  await page.getByRole("button", { name: "뉴스리틀 사용자" }).click();
  await page.getByRole("menuitem", { name: "로그아웃" }).click();
  await expect(page.getByRole("dialog", { name: "로그인이 필요해요" })).toBeVisible();
  await page.getByRole("button", { name: "Google로 계속하기" }).click();
  await expect(page.getByRole("heading", { name: "아카이브" })).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(5);
});

test("settings screen lets a member update interest topics and request record deletion, then account withdrawal", async ({
  page,
}) => {
  await page.goto("/settings");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  await expect(page.getByRole("heading", { name: "설정" })).toBeVisible();
  await expect(page.getByText("저장 위치 · 계정")).toBeVisible();
  await expect(page.getByText("Google 계정 · member-demo@newslittle.example")).toBeVisible();

  const politicsChip = page.getByRole("button", { name: "정치" });
  await expect(politicsChip).toHaveAttribute("aria-pressed", "false");
  await politicsChip.click();
  await expect(politicsChip).toHaveAttribute("aria-pressed", "true");

  // FR-12: PUT /settings/interests로 저장한 관심 주제는 계정에 남는다
  // (서버 상태를 /auth/me로 직접 조회해 확인).
  const meAfterSave = await page.evaluate(async () => {
    const response = await fetch("/api/v1/auth/me");
    return response.json();
  });
  expect(meAfterSave.data.interests).toContain("POLITICS");

  await page.getByRole("button", { name: "기록 삭제 요청" }).click();
  const recordsDialog = page.getByRole("dialog", { name: "기록 삭제를 요청할까요?" });
  await expect(recordsDialog).toBeVisible();
  await recordsDialog.getByRole("button", { name: "삭제 요청" }).click();
  await expect(page.getByText("기록 삭제를 완료했어요")).toBeVisible();

  // AC-26: 기록 삭제와 탈퇴는 별개 요청이라 각각의 결과를 따로 표시한다.
  await page.getByRole("button", { name: "탈퇴 요청" }).click();
  const withdrawDialog = page.getByRole("dialog", { name: "계정 탈퇴를 요청할까요?" });
  await expect(withdrawDialog).toBeVisible();
  await withdrawDialog.getByRole("button", { name: "탈퇴 요청" }).click();

  // 탈퇴가 완료되면 서버가 세션까지 지우므로 완료를 알린 뒤 홈으로 옮겨 간다.
  await expect(page.getByText("탈퇴 처리를 완료했어요")).toBeVisible();
  await page.waitForURL("/");
  await expect(page.getByRole("button", { name: "뉴스리틀 사용자" })).toHaveCount(0);
});

test("settings screen stores a guest's interest topics in the browser and shows the account-preserved notice after login", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  const nav = page.getByRole("navigation", { name: "주 내비게이션" });
  await page.getByRole("button", { name: "뉴스리틀 사용자" }).click();
  await page.getByRole("menuitem", { name: "로그아웃" }).click();

  await nav.getByRole("link", { name: "설정" }).click();
  await expect(page.getByRole("heading", { name: "설정" })).toBeVisible();
  await expect(page.getByText("저장 위치 · 브라우저")).toBeVisible();

  const worldChip = page.getByRole("button", { name: "국제" });
  await worldChip.click();
  await expect(worldChip).toHaveAttribute("aria-pressed", "true");

  // FR-12: 비회원 관심 주제는 계정이 아니라 브라우저(localStorage)에 저장된다.
  const storedTopics = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem("newslittle:guest-topics") ?? "[]"),
  );
  expect(storedTopics).toContain("WORLD");

  await page.locator("main").getByRole("button", { name: "Google로 계속하기" }).click();
  const loginDialog = page.getByRole("dialog", { name: "로그인이 필요해요" });
  await loginDialog.getByRole("button", { name: "Google로 계속하기" }).click();

  // AC-33: 데모 계정은 이미 관심 주제가 설정돼 있어 브라우저 선택 대신 계정 설정이 유지된다.
  await expect(page.getByText("저장 위치 · 계정")).toBeVisible();
  await expect(page.getByText("로그인 후 계정에 저장된 관심 주제를 유지했어요.")).toBeVisible();
});

test("archive shows archival guidance once every entry is deleted", async ({ page }) => {
  await page.goto("/archive");

  await expect(page.getByRole("listitem")).toHaveCount(5);

  for (let remaining = 5; remaining > 0; remaining -= 1) {
    await page.getByRole("button", { name: "삭제" }).first().click();
    await expect(page.getByRole("listitem")).toHaveCount(remaining - 1);
  }

  await page.getByRole("button", { name: /2026\. 8\. 10\. 선택/ }).click();
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await page.getByRole("button", { name: "삭제" }).first().click();

  await expect(page.getByText("아직 보관한 기사가 없어요")).toBeVisible();
  await expect(page.getByText("다음 날 다시 찾아오면 어제 목록이 자동으로 보관돼요.")).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(0);
});

test("mobile viewport displays the mobile notice and hides desktop navigation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "아직 모바일 버전의 화면은 준비되지 않았어요!",
      exact: true,
    }),
  ).toBeVisible();

  await expect(page.getByRole("navigation", { name: "주 내비게이션" })).toBeHidden();
});

test("pressing Enter on home screen toggles article in today list", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  // 1번째 카드는 초기 목록에 이미 담김 상태 -> 2번째 카드로 이동 (초기 목록에 미포함 상태)
  await page.getByRole("button", { name: "다음 기사" }).click();
  await expect(page.getByRole("heading", { name: secondArticle.title })).toBeVisible();
  await expect(page.getByRole("button", { name: "오늘 목록에 담기" })).toBeVisible();

  // Enter 키 입력 시 담기 동작 수행
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "오늘 목록에 담김" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "오늘 목록" })).toContainText(secondArticle.title);

  // 다시 Enter 키 입력 시 빼기 동작 수행
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "오늘 목록에 담기" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "오늘 목록" })).not.toContainText(secondArticle.title);
});


