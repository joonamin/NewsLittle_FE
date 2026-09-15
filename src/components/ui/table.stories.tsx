import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { Table, TableDataRow, TableHeaderRow } from "./table";

const meta = {
  title: "UI/Table",
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Table>
      <thead>
        <TableHeaderRow columns={["문항 ID", "기사", "상태", "등록일"]} />
      </thead>
      <tbody>
        <TableDataRow cells={["Q-1024", "도심의 열을 낮추는 나무", "검수 대기", "2026.09.14"]} />
        <TableDataRow cells={["Q-1025", "가로수의 미세먼지 저감 효과", "게시", "2026.09.13"]} />
      </tbody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("columnheader", { name: "문항 ID" })).toBeVisible();
    await expect(canvas.getByRole("cell", { name: "Q-1024" })).toBeVisible();
  },
};
