import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  args: {
    children: "상태 라벨",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { tone: "default" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("상태 라벨")).toBeVisible();
  },
};

export const ToneMatrix: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge tone="positive">출제 가능</Badge>
      <Badge tone="negative">오류</Badge>
      <Badge tone="default">준비 중</Badge>
      <Badge tone="accent">강조</Badge>
    </div>
  ),
};
