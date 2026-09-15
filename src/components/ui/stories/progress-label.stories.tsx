import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { ProgressLabel } from "../progress";

const meta = {
  title: "UI/ProgressLabel",
  component: ProgressLabel,
  args: {
    category: "오늘 목록 · OX·객관식",
    progress: "01 / 03",
  },
} satisfies Meta<typeof ProgressLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("01 / 03")).toBeVisible();
  },
};
