import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { GlobalNav } from "./global-nav";

const menus = [
  { label: "홈", href: "/" },
  { label: "랜덤 퀴즈", href: "/random" },
  { label: "아카이브", href: "/archive" },
];

const meta = {
  title: "UI/GlobalNav",
  component: GlobalNav,
  args: {
    menus,
    activeHref: "/",
  },
} satisfies Meta<typeof GlobalNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  args: { isLoggedIn: false, onLogin: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const loginButton = canvas.getByRole("button", { name: "로그인" });
    await userEvent.click(loginButton);
    await expect(args.onLogin).toHaveBeenCalledOnce();
  },
};

export const LoggedIn: Story = {
  args: { isLoggedIn: true, userName: "강민준", onOpenUserMenu: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const userButton = canvas.getByRole("button", { name: /강민준/ });
    await userEvent.click(userButton);
    await expect(args.onOpenUserMenu).toHaveBeenCalledOnce();
  },
};
