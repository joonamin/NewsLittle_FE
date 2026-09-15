import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { ErrorState } from "../state-view";

const meta = {
  title: "UI/ErrorState",
  component: ErrorState,
  args: {
    title: "화면을 불러오지 못했어요",
    description: "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.",
    onRetry: fn(),
    onGoHome: fn(),
  },
} satisfies Meta<typeof ErrorState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "다시 시도" }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "홈으로" }));
    await expect(args.onGoHome).toHaveBeenCalledOnce();
  },
};
