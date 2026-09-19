import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { ArchiveGroup } from "./archive-group";

const meta = {
  title: "Attribution/ArchiveGroup",
  component: ArchiveGroup,
  args: {
    dateLabel: "2026. 9. 12. 선택 · 4개",
    onToggleExpanded: fn(),
    onDeleteItem: fn(),
    items: [
      {
        id: "archive-library-program",
        articleId: "article-library-program",
        title: "모의 기사: 지역 공공도서관이 주말 프로그램을 확대합니다",
        originalUrl: "https://example.com/articles/library-program",
        sourceName: "데모 뉴스",
        publishedLabel: "2026. 9. 12.",
        status: "available" as const,
      },
      {
        id: "archive-access-failed",
        articleId: "article-science-class",
        title: "모의 기사: 청소년 과학 교실의 참가 신청이 시작됐습니다",
        originalUrl: null,
        status: "access-failed" as const,
      },
      {
        id: "archive-derivative-expired",
        articleId: "article-urban-trees",
        title: "모의 기사: 도심의 열을 낮추는 나무, 그늘 이상의 역할",
        originalUrl: "https://example.com/articles/urban-trees",
        status: "derivative-expired" as const,
      },
      {
        id: "archive-discontinued",
        // 이용 중단은 article이 null로 내려와 실제 기사를 특정할 수 없다 — 신고 버튼도 없다.
        articleId: null,
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

    const header = canvas.getByRole("button", { name: /2026\. 9\. 12\. 선택 · 4개/ });
    await expect(header).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText("펼침")).toBeVisible();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(4);
    await expect(canvas.getByText("원문 접근 실패 · 보관 기록 유지")).toBeVisible();
    await expect(canvas.getByText("요약·퀴즈 연결 없음")).toBeVisible();
    await expect(canvas.getByText("이용 중단")).toBeVisible();
    await expect(canvas.getByText("이용 중단으로 표시가 제한된 기사")).toBeVisible();
    // 이용 중단 항목은 article이 없어 신고 대상을 특정할 수 없다 — 4개 중 3개만 신고 버튼을 보인다.
    await expect(canvas.getAllByRole("button", { name: "신고" })).toHaveLength(3);

    const deleteButtons = canvas.getAllByRole("button", { name: "삭제" });
    await expect(deleteButtons).toHaveLength(4);
    await userEvent.click(deleteButtons[0]);
    await expect(args.onDeleteItem).toHaveBeenCalledWith("archive-library-program");

    await userEvent.click(header);
    await expect(args.onToggleExpanded).toHaveBeenCalledOnce();
  },
};

export const Collapsed: Story = {
  args: { expanded: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: /2026\. 9\. 12\./ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(canvas.getByText("접힘")).toBeVisible();
    await expect(canvas.queryAllByRole("listitem")).toHaveLength(0);
  },
};

export const DiscontinuedIgnoresSuppliedTitle: Story = {
  args: {
    items: [
      {
        id: "archive-discontinued-with-title",
        articleId: null,
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

export const DiscontinuedWithCustomReason: Story = {
  args: {
    items: [
      {
        id: "archive-metadata-terms-ended",
        articleId: null,
        title: null,
        originalUrl: null,
        status: "discontinued" as const,
        discontinuedReason: "메타데이터 이용 조건이 종료되어 제목과 원문 링크를 표시할 수 없습니다.",
      },
      {
        id: "archive-provider-requested",
        articleId: null,
        title: null,
        originalUrl: null,
        status: "discontinued" as const,
        discontinuedReason: "제공처 요청으로 이용이 중단되어 제목과 원문 링크를 표시할 수 없습니다.",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("메타데이터 이용 조건이 종료되어 제목과 원문 링크를 표시할 수 없습니다."),
    ).toBeVisible();
    await expect(
      canvas.getByText("제공처 요청으로 이용이 중단되어 제목과 원문 링크를 표시할 수 없습니다."),
    ).toBeVisible();
  },
};

export const WithoutDeleteCallback: Story = {
  args: { onDeleteItem: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();
    await expect(canvas.getAllByRole("button", { name: "신고" })).toHaveLength(3);
  },
};
