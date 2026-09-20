import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { AnswerComparison } from "../answer-comparison";

const meta = {
  title: "UI/AnswerComparison",
  component: AnswerComparison,
  args: {
    userAnswer: "밝은 부분과 어두운 부분 경계의 그림자가 지형을 돋보이게 한다.",
    correctAnswer: "상현달은 초저녁에 높이 떠 관측하기에 편리하고 경계선 부근 그림자 효과로 달 지형이 입체적으로 잘 드러나기 때문이다.",
    isCorrect: false,
    outcome: "incorrect",
  },
} satisfies Meta<typeof AnswerComparison>;

export default meta;

type Story = StoryObj<typeof meta>;

export const IncorrectSubjective: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("내 답변 (오답)")).toBeVisible();
    await expect(canvas.getByText("정답")).toBeVisible();
  },
};

export const CorrectSubjective: Story = {
  args: {
    userAnswer: "상현달은 초저녁에 높이 떠서 관측하기 좋기 때문",
    correctAnswer: "상현달은 초저녁에 높이 떠 관측하기에 편리하고 달 지형이 입체적으로 잘 드러나기 때문이다.",
    isCorrect: true,
    outcome: "correct",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("내 답변 (정답)")).toBeVisible();
  },
};

export const GivenUp: Story = {
  args: {
    userAnswer: null,
    correctAnswer: "O",
    isCorrect: false,
    outcome: "given-up",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("내 답변 (포기)")).toBeVisible();
  },
};
