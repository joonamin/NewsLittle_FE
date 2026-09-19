import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { MobileNotice } from "./mobile-notice";

const meta = {
  title: "Layout/MobileNotice",
  component: MobileNotice,
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
} satisfies Meta<typeof MobileNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", {
        name: "아직 모바일 버전의 화면은 준비되지 않았어요!",
      }),
    ).toBeVisible();

    await expect(
      canvas.getByText(/PC\(데스크톱\) 웹 환경에 최적화되어 있어요/),
    ).toBeVisible();
  },
};
