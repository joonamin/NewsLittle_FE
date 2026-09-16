// lib: User Menu / 사용자 설정 드롭다운 (PnlA2), Menu Item / 사용자 메뉴 항목 (z37PUu)
import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type UserMenuProps = HTMLAttributes<HTMLDivElement>;

export const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(function UserMenu(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="menu"
      className={cn("shadow-nl-menu w-[220px] rounded-nl-button border border-nl-border bg-nl-bg p-2", className)}
      {...props}
    />
  );
});

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

export type UserMenuLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  label: string;
  emphasis?: boolean;
};

export function UserMenuLink({ label, emphasis = false, className, ...props }: UserMenuLinkProps) {
  return (
    <a
      role="menuitem"
      className={cn(
        "flex h-10 w-full items-center px-3 text-left text-nl-caption text-nl-text",
        emphasis ? "font-bold" : "font-normal",
        className,
      )}
      {...props}
    >
      {label}
    </a>
  );
}

export function UserMenuDivider() {
  return <div role="separator" className="h-px w-full bg-nl-border" />;
}
