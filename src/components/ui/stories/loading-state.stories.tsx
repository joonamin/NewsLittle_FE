import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { LoadingState } from "../state-view";

const meta = {
  title: "UI/LoadingState",
  component: LoadingState,
  args: {
    title: "불러오는 중이에요",
    description: "잠시만 기다려 주세요.",
  },
} satisfies Meta<typeof LoadingState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toBeVisible();
    await expect(canvas.getByText("불러오는 중이에요")).toBeVisible();
  },
};
