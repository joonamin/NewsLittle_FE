import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { toHomeViewModel } from "@/features/contracts/view-models";
import { homeFixture } from "@/mocks/fixtures";

import { ArticleGesture, type ArticleGestureProps } from "../article-gesture";

const home = toHomeViewModel(homeFixture);
const photoCard = home.feed.cards[0];
const textCard = home.feed.cards[1];
const longCard = home.feed.cards[2];

function ArticleGesturePlayground(props: ArticleGestureProps) {
  const [saved, setSaved] = useState(props.saved);

  return (
    <ArticleGesture
      {...props}
      saved={saved}
      onToggleSave={() => {
        setSaved((current) => !current);
        props.onToggleSave();
      }}
    />
  );
}

const meta = {
  title: "UI/ArticleGesture",
  component: ArticleGesture,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex h-[800px] bg-nl-subtle p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    card: photoCard,
    saved: false,
    canGoPrevious: false,
    canGoNext: true,
    onPrevious: fn(),
    onNext: fn(),
    onToggleSave: fn(),
    onReport: fn(),
  },
  render: (args) => (
    <ArticleGesturePlayground key={`${args.card.id}-${String(args.saved)}`} {...args} />
  ),
} satisfies Meta<typeof ArticleGesture>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PhotoUnsaved: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: photoCard.title })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "더보기" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "오늘 목록에 담기" }));
    await expect(args.onToggleSave).toHaveBeenCalledOnce();
    await expect(canvas.getByRole("button", { name: "오늘 목록에 담김" })).toBeVisible();
  },
};

export const PhotoSaved: Story = {
  args: { saved: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("✓ 담긴 기사")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "오늘 목록에 담김" }));
    await expect(args.onToggleSave).toHaveBeenCalledOnce();
    await expect(canvas.getByRole("button", { name: "오늘 목록에 담기" })).toBeVisible();
  },
};

export const TextOnly: Story = {
  args: { card: textCard },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: textCard.title })).toBeVisible();
    await expect(canvas.queryByRole("img", { name: "나무가 우거진 공원 산책로" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "더보기" })).not.toBeInTheDocument();
  },
};

export const ReportOnSingleClick: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "신고" }));
    await expect(args.onReport).toHaveBeenCalledOnce();
  },
};

export const LongBody: Story = {
  args: { card: longCard },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const more = await canvas.findByRole("button", { name: "더보기" });
    await expect(canvas.queryByRole("button", { name: "접기" })).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "오늘 목록에 담기" })).toBeVisible();
    await userEvent.click(more);
    await expect(canvas.getByRole("button", { name: "접기" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "오늘 목록에 담기" })).toBeVisible();
  },
};

export const Navigation: Story = {
  args: {
    canGoPrevious: true,
    canGoNext: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "다음 기사" }));
    await expect(args.onNext).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "이전 기사" }));
    await expect(args.onPrevious).toHaveBeenCalledOnce();
  },
};
