import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { QuestionNavigation } from "../question-navigation";

const meta = {
  title: "UI/QuestionNavigation",
  component: QuestionNavigation,
  args: {
    current: 2,
    total: 5,
    canGoNext: true,
    onPrevious: fn(),
    onNext: fn(),
  },
} satisfies Meta<typeof QuestionNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BetweenQuestions: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /이전 문제/ }));
    await userEvent.click(canvas.getByRole("button", { name: /다음 문제/ }));
    await expect(args.onPrevious).toHaveBeenCalledOnce();
    await expect(args.onNext).toHaveBeenCalledOnce();
  },
};

export const FirstQuestionUnresolved: Story = {
  args: { current: 1, canGoNext: false },
};

export const LastQuestionResolved: Story = {
  args: { current: 5, canGoNext: true },
};
