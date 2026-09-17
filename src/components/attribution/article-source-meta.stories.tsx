import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { ArticleSourceMeta } from "./article-source-meta";

const meta = {
  title: "Attribution/ArticleSourceMeta",
  component: ArticleSourceMeta,
  args: {
    sourceName: "데모 뉴스",
    publishedLabel: "2026. 9. 13.",
    originalUrl: "https://example.com/articles/library-program",
    showsAiSummary: true,
  },
} satisfies Meta<typeof ArticleSourceMeta>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("데모 뉴스 · 원문 게시 2026. 9. 13.")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "원문 읽기 ↗" })).toBeVisible();
    await expect(canvas.getByText("AI 요약")).toBeVisible();
  },
};

export const OriginalUnavailable: Story = {
  args: { originalUrl: null, showsAiSummary: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("원문 접근 불가")).toBeVisible();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
    await expect(canvas.queryByText("AI 요약")).not.toBeInTheDocument();
  },
};
