// lib: GLB-01 · 주 내비게이션 (O5rYI2)
import { ChevronDown } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/cn";

import { BrandLockup } from "./brand-lockup";

export type GlobalNavMenuItem = {
  label: string;
  href: string;
};

export type GlobalNavProps = {
  menus: readonly GlobalNavMenuItem[];
  activeHref?: string;
  isLoggedIn: boolean;
  userName?: string | null;
  loginLabel?: string;
  onLogin?: () => void;
  onOpenUserMenu?: () => void;
};

export function GlobalNav({
  menus,
  activeHref,
  isLoggedIn,
  userName,
  loginLabel = "로그인",
  onLogin,
  onOpenUserMenu,
}: GlobalNavProps) {
  return (
    <nav
      aria-label="주 내비게이션"
      className="flex h-20 w-full items-center gap-12 border-b border-nl-border bg-nl-bg px-10"
    >
      <BrandLockup />
      <div className="flex items-center gap-8">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={cn(
              "text-nl-body tracking-nl-tight font-semibold",
              menu.href === activeHref ? "text-nl-text" : "text-nl-muted",
            )}
          >
            {menu.label}
          </Link>
        ))}
      </div>
      <div className="flex-1" />
      <span className="h-6 w-px bg-nl-border" aria-hidden />
      <div className="flex items-center gap-1.5">
        {isLoggedIn ? (
          <button
            type="button"
            aria-haspopup="menu"
            onClick={onOpenUserMenu}
            className="flex items-center gap-1.5 text-nl-caption tracking-nl-tight text-nl-text font-bold"
          >
            <span>{userName}</span>
            <ChevronDown width={20} height={20} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            className="text-nl-caption tracking-nl-tight text-nl-accent font-bold"
          >
            {loginLabel}
          </button>
        )}
      </div>
    </nav>
  );
}
