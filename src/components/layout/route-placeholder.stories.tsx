import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { RoutePlaceholder } from "./route-placeholder";

const meta = {
  title: "Layout/RoutePlaceholder",
  component: RoutePlaceholder,
  args: {
    eyebrow: "SCR-01",
    title: "뉴스 탐색",
    description: "오늘의 뉴스 피드와 회원의 오늘 목록을 보여줄 홈 화면입니다.",
    notes: ["상태와 데이터 계약은 화면 설계 후 연결합니다."],
  },
} satisfies Meta<typeof RoutePlaceholder>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "뉴스 탐색" }),
    ).toBeVisible();
  },
};
