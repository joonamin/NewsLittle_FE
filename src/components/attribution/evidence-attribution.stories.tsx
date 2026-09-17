import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { EvidenceAttribution } from "./evidence-attribution";

const meta = {
  title: "Attribution/EvidenceAttribution",
  component: EvidenceAttribution,
  args: {
    articleTitle: "모의 기사: 지역 공공도서관이 주말 프로그램을 확대합니다",
    sourceName: "데모 뉴스",
    publishedLabel: "2026. 9. 13.",
    originalUrl: "https://example.com/articles/library-program",
  },
} satisfies Meta<typeof EvidenceAttribution>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("link", { name: "모의 기사: 지역 공공도서관이 주말 프로그램을 확대합니다" }),
    ).toBeVisible();
    await expect(canvas.getByText("데모 뉴스 · 원문 게시 2026. 9. 13.")).toBeVisible();
    await expect(canvas.queryByText(/기준 시점/)).not.toBeInTheDocument();
  },
};

export const WithAsOfReference: Story = {
  args: { asOfLabel: "2026. 9. 13. 09:00 기준" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText(/기준 시점/)).toBeVisible();
  },
};

export const SummaryUnavailable: Story = {
  args: { summaryUnavailable: true, asOfLabel: "2026. 9. 13. 09:00 기준" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("link", { name: "모의 기사: 지역 공공도서관이 주말 프로그램을 확대합니다" }),
    ).toBeVisible();
    await expect(canvas.queryByText("데모 뉴스 · 원문 게시 2026. 9. 13.")).not.toBeInTheDocument();
    await expect(canvas.queryByText(/기준 시점/)).not.toBeInTheDocument();
    await expect(canvas.queryByText("근거 기사")).not.toBeInTheDocument();
  },
};
