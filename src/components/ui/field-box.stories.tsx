import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { ReadonlyField } from "./field-box";

const meta = {
  title: "UI/ReadonlyField",
  component: ReadonlyField,
  args: {
    value: "김뉴스 (user-1024)",
  },
} satisfies Meta<typeof ReadonlyField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("김뉴스 (user-1024)")).toBeVisible();
  },
};

export const WithHint: Story = {
  args: {
    hint: "2026.09.14 기준",
  },
};
