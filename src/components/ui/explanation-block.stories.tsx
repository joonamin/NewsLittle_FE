import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { ExplanationBlock } from "./explanation-block";

const meta = {
  title: "UI/ExplanationBlock",
  component: ExplanationBlock,
  args: {
    header: "정답은 O예요",
    body: "나무는 그늘을 만들 뿐 아니라 잎에서 수분을 내보내는 증산 작용으로 주변 온도를 낮춰요.",
  },
} satisfies Meta<typeof ExplanationBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("정답은 O예요")).toBeVisible();
  },
};

export const WithHint: Story = {
  args: {
    header: "아직 정답이 아니에요 · 1차 힌트",
    hint: "사실형은 정답 여부와 힌트만 표시해요. 의미 유사도 점수는 표시하지 않아요.",
  },
};
