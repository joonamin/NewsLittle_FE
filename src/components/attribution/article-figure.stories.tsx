import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { ArticleFigure } from "./article-figure";

const meta = {
  title: "Attribution/ArticleFigure",
  component: ArticleFigure,
} satisfies Meta<typeof ArticleFigure>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AiImage: Story = {
  args: {
    aiImage: { url: "https://placehold.co/480x270?text=AI", alt: "모의 AI 생성 이미지" },
    articleImage: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("AI 생성 이미지")).toBeVisible();
    await expect(canvas.getByRole("img", { name: "모의 AI 생성 이미지" })).toBeVisible();
  },
};

export const RightsConfirmedArticleImage: Story = {
  args: {
    aiImage: null,
    articleImage: {
      url: "https://placehold.co/480x270?text=Article",
      alt: "모의 기사 이미지",
      attribution: "사진: 데모 뉴스 제공",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText("AI 생성 이미지")).not.toBeInTheDocument();
    await expect(canvas.getByText("사진: 데모 뉴스 제공")).toBeVisible();
  },
};

export const NoImageAvailable: Story = {
  args: { aiImage: null, articleImage: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
  },
};
