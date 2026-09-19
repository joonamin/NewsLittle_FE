import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "../button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "기본 액션",
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary", size: "l" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "기본 액션" });
    await expect(button).toBeVisible();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Disabled: Story = {
  args: { variant: "primary", disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button")).toBeDisabled();
  },
};

export const VariantMatrix: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button {...args} variant="primary">
          Primary
        </Button>
        <Button {...args} variant="secondary">
          Secondary
        </Button>
        <Button {...args} variant="default">
          Default
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <Button {...args} variant="primary" disabled>
          Primary
        </Button>
        <Button {...args} variant="secondary" disabled>
          Secondary
        </Button>
        <Button {...args} variant="default" disabled>
          Default
        </Button>
      </div>
    </div>
  ),
};

export const SizeMatrix: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args} size="l">
        Large
      </Button>
      <Button {...args} size="m">
        Medium
      </Button>
      <Button {...args} size="s">
        Small
      </Button>
      <Button {...args} size="xs">
        XSmall
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  args: { variant: "primary", loading: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "기본 액션" });
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button.querySelector("[role='status']")).toBeInTheDocument();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const LoadingMatrix: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button {...args} variant="primary" loading>
          Primary
        </Button>
        <Button {...args} variant="secondary" loading>
          Secondary
        </Button>
        <Button {...args} variant="default" loading>
          Default
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <Button {...args} size="l" loading>
          Large
        </Button>
        <Button {...args} size="m" loading>
          Medium
        </Button>
        <Button {...args} size="s" loading>
          Small
        </Button>
        <Button {...args} size="xs" loading>
          XSmall
        </Button>
      </div>
    </div>
  ),
};

