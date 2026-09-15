import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { ProgressBar } from "../progress";

const meta = {
  title: "UI/ProgressBar",
  component: ProgressBar,
  args: {
    current: 1,
    total: 3,
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("progressbar");
    await expect(bar).toHaveAttribute("aria-valuenow", "1");
  },
};

export const AllComplete: Story = {
  args: { current: 3, total: 3 },
};
