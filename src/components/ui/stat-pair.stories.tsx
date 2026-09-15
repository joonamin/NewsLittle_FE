import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { StatPair } from "./stat";

const meta = {
  title: "UI/StatPair",
  component: StatPair,
  args: {
    value: 8,
    label: "정답 문항",
  },
} satisfies Meta<typeof StatPair>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("8")).toBeVisible();
    await expect(canvas.getByText("정답 문항")).toBeVisible();
  },
};
