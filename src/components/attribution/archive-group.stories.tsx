import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { ArchiveGroup } from "./archive-group";

const meta = {
  title: "Attribution/ArchiveGroup",
  component: ArchiveGroup,
  args: {
    dateLabel: "2026. 9. 12.",
    onToggleExpanded: fn(),
    items: [
      {
        id: "archive-library-program",
        title: "모의 기사: 지역 공공도서관이 주말 프로그램을 확대합니다",
        originalUrl: "https://example.com/articles/library-program",
        sourceName: "데모 뉴스",
        publishedLabel: "2026. 9. 12.",
        status: "available" as const,
      },
      {
        id: "archive-access-failed",
        title: "모의 기사: 청소년 과학 교실의 참가 신청이 시작됐습니다",
        originalUrl: null,
        status: "access-failed" as const,
      },
      {
        id: "archive-discontinued",
        title: null,
        originalUrl: null,
        status: "discontinued" as const,
      },
    ],
  },
} satisfies Meta<typeof ArchiveGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: "2026. 9. 12." })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    await expect(canvas.getByText("원문 접근 실패 · 보관 기록 유지")).toBeVisible();
    await expect(canvas.getByText("이용 중단")).toBeVisible();
    await expect(canvas.getByText("이용 중단으로 표시가 제한된 기사")).toBeVisible();
    await expect(canvas.queryByRole("link")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "2026. 9. 12." }));
    await expect(args.onToggleExpanded).toHaveBeenCalledOnce();
  },
};

export const Collapsed: Story = {
  args: { expanded: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button")).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryAllByRole("listitem")).toHaveLength(0);
  },
};

export const DiscontinuedIgnoresSuppliedTitle: Story = {
  args: {
    items: [
      {
        id: "archive-discontinued-with-title",
        title: "호출부가 실수로 넘긴 실제 제목",
        originalUrl: "https://example.com/should-not-render",
        sourceName: "데모 뉴스",
        publishedLabel: "2026. 9. 12.",
        status: "discontinued" as const,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("이용 중단으로 표시가 제한된 기사")).toBeVisible();
    await expect(canvas.queryByText("호출부가 실수로 넘긴 실제 제목")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
    await expect(canvas.queryByText("데모 뉴스 · 원문 게시 2026. 9. 12.")).not.toBeInTheDocument();
  },
};
