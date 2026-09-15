// lib: User Menu / 사용자 설정 드롭다운 (PnlA2), Menu Item / 사용자 메뉴 항목 (z37PUu)
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type UserMenuProps = HTMLAttributes<HTMLDivElement>;

export function UserMenu({ className, ...props }: UserMenuProps) {
  return (
    <div
      role="menu"
      className={cn("shadow-nl-menu w-[220px] rounded-nl-button border border-nl-border bg-nl-bg p-2", className)}
      {...props}
    />
  );
}

export type UserMenuItemTone = "default" | "danger";

export type UserMenuItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  tone?: UserMenuItemTone;
  emphasis?: boolean;
};

const toneClasses: Record<UserMenuItemTone, string> = {
  default: "text-nl-text",
  danger: "text-nl-negative",
};

export function UserMenuItem({
  label,
  tone = "default",
  emphasis = false,
  className,
  type = "button",
  ...props
}: UserMenuItemProps) {
  return (
    <button
      type={type}
      role="menuitem"
      className={cn(
        "flex h-10 w-full items-center px-3 text-left text-nl-caption",
        emphasis ? "font-bold" : "font-normal",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {label}
    </button>
  );
}

export function UserMenuDivider() {
  return <div role="separator" className="h-px w-full bg-nl-border" />;
}
