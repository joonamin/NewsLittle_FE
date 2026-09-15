import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { FilterSelect } from "./select";

const meta = {
  title: "UI/FilterSelect",
  component: FilterSelect,
  args: {
    label: "상태",
    options: ["전체", "대기", "완료"],
    defaultValue: "전체",
  },
} satisfies Meta<typeof FilterSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("상태:")).toBeVisible();
    await expect(canvas.getByRole("combobox")).toHaveValue("전체");
  },
};
