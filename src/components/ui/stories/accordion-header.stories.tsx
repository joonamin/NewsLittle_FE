import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { DateGroupHeader } from "../accordion-header";

const meta = {
  title: "UI/DateGroupHeader",
  component: DateGroupHeader,
  args: {
    label: "2026.09.13 선택 · 3개",
    onClick: fn(),
  },
} satisfies Meta<typeof DateGroupHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  args: { expanded: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole("button");
    await expect(header).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(header);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Collapsed: Story = {
  args: { expanded: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  },
};
