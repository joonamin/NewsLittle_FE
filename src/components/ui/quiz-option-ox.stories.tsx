import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { QuizOptionOX } from "./quiz-option";

const meta = {
  title: "UI/QuizOptionOX",
  component: QuizOptionOX,
  args: {
    label: "○  X  아니에요",
    onClick: fn(),
  },
} satisfies Meta<typeof QuizOptionOX>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unselected: Story = {
  args: { selected: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const option = canvas.getByRole("radio");
    await expect(option).toHaveAttribute("aria-checked", "false");
    await userEvent.click(option);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Selected: Story = {
  args: { selected: true, label: "◉  O  맞아요" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radio")).toHaveAttribute("aria-checked", "true");
  },
};
