import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { UserMenu, UserMenuDivider, UserMenuItem } from "./user-menu";

const meta = {
  title: "UI/UserMenu",
  component: UserMenu,
} satisfies Meta<typeof UserMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const onLogout = fn();
    return (
      <UserMenu>
        <UserMenuItem label="내 프로필" emphasis />
        <UserMenuItem label="관심사 설정" />
        <UserMenuItem label="설정" />
        <UserMenuDivider />
        <UserMenuItem label="로그아웃" tone="danger" emphasis onClick={onLogout} />
      </UserMenu>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const logout = canvas.getByRole("menuitem", { name: "로그아웃" });
    await userEvent.click(logout);
    await expect(canvas.getAllByRole("menuitem")).toHaveLength(4);
  },
};
