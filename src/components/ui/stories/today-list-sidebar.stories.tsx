import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { toHomeViewModel } from "@/features/contracts/view-models";
import { homeFixture } from "@/mocks/fixtures";

import { TodayListSidebar } from "../today-list-sidebar";

const home = toHomeViewModel(homeFixture);
const dateLabel = home.todayList?.dateLabel ?? "2026. 9. 13.";

function listFromCards(
  count: number,
  preparingIndex = -1,
): NonNullable<typeof home.todayList> {
  return {
    count,
    dateLabel,
    items: Array.from({ length: count }, (_, index) => {
      const card = home.feed.cards[index % home.feed.cards.length];
      return {
        articleId: `${card.id}-${index}`,
        title: `${index + 1}. ${card.title}`,
        originalUrl: card.originalUrl,
        publishedLabel: card.publishedLabel,
        quizStatusLabel: index === preparingIndex ? "문항 준비 중" : "출제 가능",
        isFromPreviousFeedDate: false,
      };
    }),
  };
}

const filledList = {
  count: 2,
  dateLabel,
  items: [
    home.todayList!.items[0],
    {
      articleId: home.feed.cards[1].id,
      title: home.feed.cards[1].title,
      originalUrl: home.feed.cards[1].originalUrl,
      publishedLabel: home.feed.cards[1].publishedLabel,
      quizStatusLabel: "문항 준비 중",
      isFromPreviousFeedDate: false,
    },
  ],
};

const meta = {
  title: "UI/TodayListSidebar",
  component: TodayListSidebar,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex h-[720px] justify-end bg-nl-subtle">
        <Story />
      </div>
    ),
  ],
  args: {
    isLoggedIn: true,
    list: filledList,
    onLogin: fn(),
    onOpenArticle: fn(),
    onRemoveArticle: fn(),
    onStartQuiz: fn(),
  },
} satisfies Meta<typeof TodayListSidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Guest: Story = {
  args: { isLoggedIn: false, list: null },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("complementary", { name: "오늘 목록" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "로그인하고 기사 담기" }));
    await expect(args.onLogin).toHaveBeenCalledOnce();
  },
};

export const Empty: Story = {
  args: { list: { count: 0, dateLabel, items: [] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("아직 담은 기사가 없어요")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "숏폼 퀴즈 시작" })).toBeDisabled();
  },
};

export const Filled: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const savedTitle = filledList.items[0].title;
    await expect(canvas.getByRole("link", { name: savedTitle })).toBeVisible();
    await expect(canvas.getByText("문항 준비 중")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: `${savedTitle} 삭제` }));
    await expect(args.onRemoveArticle).toHaveBeenCalledWith(filledList.items[0].articleId);
    await userEvent.click(canvas.getByRole("button", { name: "숏폼 퀴즈 시작" }));
    await expect(args.onStartQuiz).toHaveBeenCalledOnce();
  },
};

export const Overflow: Story = {
  args: { list: listFromCards(10, 2) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lastItem = canvas.getByRole("link", { name: `10. ${home.feed.cards[0].title}` });
    lastItem.scrollIntoView();
    await expect(lastItem).toBeVisible();
    await expect(canvas.getByRole("button", { name: "숏폼 퀴즈 시작" })).toBeVisible();
  },
};
