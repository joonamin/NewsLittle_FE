import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { GlobalNav } from "../global-nav";

const menus = [
  { id: "home", label: "홈", href: "/" },
  { id: "random", label: "랜덤 퀴즈", href: "/random" },
  { id: "archive", label: "아카이브", href: "/archive" },
  { id: "settings", label: "설정", href: "/settings" },
] as const;

const meta = {
  title: "UI/GlobalNav",
  component: GlobalNav,
  args: {
    menus,
    activeItemId: "home",
    account: { status: "guest", loginLabel: "로그인" },
  },
} satisfies Meta<typeof GlobalNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  args: { onLogin: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const home = canvas.getByRole("link", { name: "홈" });
    await expect(home).toHaveAttribute("aria-current", "page");
    await expect(home).toHaveClass("nl-nav-glass", "text-nl-accent");
    const loginButton = canvas.getByRole("button", { name: "로그인" });
    await expect(loginButton).toHaveClass("nl-nav-glass");
    await userEvent.click(loginButton);
    await expect(args.onLogin).toHaveBeenCalledOnce();
  },
};

export const LoggedIn: Story = {
  args: {
    account: {
      status: "member",
      displayName: "강민준",
      menuItems: [
        { id: "settings", label: "설정", type: "link", href: "/settings" },
        { id: "logout", label: "로그아웃", type: "action", action: "logout" },
      ],
    },
    onAccountAction: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const userButton = canvas.getByRole("button", { name: /강민준/ });
    await userEvent.click(userButton);
    await expect(canvas.getByRole("menuitem", { name: "로그아웃" })).toBeVisible();
    await userEvent.click(canvas.getByRole("menuitem", { name: "로그아웃" }));
    await expect(args.onAccountAction).toHaveBeenCalledOnce();
  },
};

export const Administrator: Story = {
  args: {
    menus: [...menus, { id: "operations", label: "운영", href: "/admin" }],
    account: {
      status: "member",
      displayName: "운영자 A",
      menuItems: [{ id: "logout", label: "로그아웃", type: "action", action: "logout" }],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "운영" })).toBeVisible();
  },
};
