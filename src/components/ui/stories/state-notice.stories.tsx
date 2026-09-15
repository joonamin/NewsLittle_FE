import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { Button } from "../button";
import { StateNotice } from "../state-notice";

const meta = {
  title: "UI/StateNotice",
  component: StateNotice,
  args: {
    title: "판정 미완료 · 10초 초과",
    description: "판정을 완료하지 못했습니다. 오답으로 기록하지 않습니다.",
  },
} satisfies Meta<typeof StateNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Plain: Story = {
  args: { tone: "plain" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("판정 미완료 · 10초 초과")).toBeVisible();
  },
};

export const AccentWithActions: Story = {
  args: {
    tone: "accent",
    actions: <Button variant="primary">확인</Button>,
  },
};
