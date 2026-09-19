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

export const WithPriorityHierarchy: Story = {
  args: {
    p1: "20260920_1",
    p2: "2026. 9. 20. 선택",
    p3: "7개",
    expanded: true,
    showsStateText: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const p1 = canvas.getByText("20260920_1");
    const p2 = canvas.getByText("2026. 9. 20. 선택");
    const p3 = canvas.getByText("7개");
    await expect(p1).toBeVisible();
    await expect(p2).toBeVisible();
    await expect(p3).toBeVisible();
    await expect(canvas.getByText("펼침")).toBeVisible();
    const button = canvas.getByRole("button");
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const WithoutSecondary: Story = {
  args: {
    p1: "2026. 9. 20. 선택",
    p3: "3개",
    expanded: false,
    showsStateText: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("2026. 9. 20. 선택")).toBeVisible();
    await expect(canvas.getByText("3개")).toBeVisible();
    await expect(canvas.getByText("접힘")).toBeVisible();
  },
};

