import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Modal } from "./modal";

function ModalDemo(props: Omit<Parameters<typeof Modal>[0], "open" | "onClose">) {
  const [open, setOpen] = useState(true);
  return <Modal {...props} open={open} onClose={() => setOpen(false)} />;
}

const meta = {
  title: "UI/Modal",
  component: Modal,
  args: {
    open: true,
    onClose: fn(),
    title: "로그인이 필요해요",
    children: <p className="text-nl-body text-nl-muted">기사를 오늘 목록에 담으려면 로그인해 주세요.</p>,
  },
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  render: (args) => <ModalDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole("dialog")).toBeVisible();
  },
};

export const Compact: Story = {
  render: (args) => <ModalDemo {...args} />,
  args: {
    size: "compact",
    title: "정말 삭제할까요?",
    onConfirm: fn(),
  },
};

export const CloseInteraction: Story = {
  render: (args) => <ModalDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole("dialog")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "닫기" }));
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};
