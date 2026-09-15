import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { QuizOptionChoice } from "../quiz-option";

const meta = {
  title: "UI/QuizOptionChoice",
  component: QuizOptionChoice,
  args: {
    index: 2,
    text: "잎에서 물을 증발시켜서",
    onClick: fn(),
  },
} satisfies Meta<typeof QuizOptionChoice>;

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
  args: { selected: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radio")).toHaveAttribute("aria-checked", "true");
  },
};
