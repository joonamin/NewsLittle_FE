import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { ArticleSourceMeta } from "./article-source-meta";
import { TodayListEntry } from "./today-list-entry";

const meta = {
  title: "Attribution/TodayListEntry",
  component: TodayListEntry,
  args: {
    title: "모의 기사: 지역 공공도서관이 주말 프로그램을 확대합니다",
    isFromPreviousFeedDate: false,
  },
} satisfies Meta<typeof TodayListEntry>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("모의 기사: 지역 공공도서관이 주말 프로그램을 확대합니다"),
    ).toBeVisible();
    await expect(canvas.queryByText(/게시일/)).not.toBeInTheDocument();
  },
};

export const FromPreviousFeedDate: Story = {
  args: { isFromPreviousFeedDate: true, publishedLabel: "2026. 9. 12." },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("게시일 2026. 9. 12.")).toBeVisible();
  },
};

export const ExpandableDetails: Story = {
  args: {
    expandedDetails: (
      <ArticleSourceMeta
        sourceName="데모 뉴스"
        publishedLabel="2026. 9. 13."
        originalUrl="https://example.com/articles/library-program"
        showsAiSummary
      />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("데모 뉴스 · 원문 게시 2026. 9. 13.")).toBeInTheDocument();
  },
};
