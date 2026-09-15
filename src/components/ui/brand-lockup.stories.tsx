import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { BrandLockup } from "./brand-lockup";

const meta = {
  title: "UI/BrandLockup",
  component: BrandLockup,
} satisfies Meta<typeof BrandLockup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("뉴스")).toBeVisible();
    await expect(canvas.getByText("리틀")).toBeVisible();
    await expect(canvas.getByText("짧게 읽는 하루 뉴스")).toBeVisible();
  },
};
