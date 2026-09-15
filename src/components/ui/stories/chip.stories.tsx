import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Chip } from "../chip";

const meta = {
  title: "UI/Chip",
  component: Chip,
  args: {
    label: "카테고리",
    onClick: fn(),
  },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unselected: Story = {
  args: { selected: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole("button", { name: "카테고리" });
    await expect(chip).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(chip);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Selected: Story = {
  args: { selected: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  },
};

export const Toggle: Story = {
  render: () => {
    function ToggleChip() {
      const [selected, setSelected] = useState(false);
      return <Chip label="정치" selected={selected} onClick={() => setSelected((v) => !v)} />;
    }
    return <ToggleChip />;
  },
};
