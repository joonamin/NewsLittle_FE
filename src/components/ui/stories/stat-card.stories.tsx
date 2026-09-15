import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { StatCard } from "../stat";

const meta = {
  title: "UI/StatCard",
  component: StatCard,
  args: {
    label: "오늘 검수 대기",
    value: "12 →",
  },
} satisfies Meta<typeof StatCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AsButton: Story = {
  args: { onOpen: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.click(button);
    await expect(args.onOpen).toHaveBeenCalledOnce();
  },
};

export const AsLink: Story = {
  args: { href: "/admin/review-queue" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link")).toHaveAttribute("href", "/admin/review-queue");
  },
};
