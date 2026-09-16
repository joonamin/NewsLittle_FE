// lib: GLB-01 · 주 내비게이션
import { Archive, ChevronDown, Dices, House, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";

import { cn } from "@/lib/cn";

import { BrandLockup } from "./brand-lockup";
import { UserMenu, UserMenuDivider, UserMenuItem, UserMenuLink } from "./user-menu";

export type GlobalNavMenuItem = { id: string; label: string; href: string };

export type GlobalNavAccountMenuItem =
  | { id: string; label: string; type: "link"; href: string }
  | { id: string; label: string; type: "action"; action: "logout" };

export type GlobalNavAccount =
  | { status: "guest"; loginLabel: string }
  | { status: "member"; displayName: string; menuItems: readonly GlobalNavAccountMenuItem[] };

export type GlobalNavProps = {
  menus: readonly GlobalNavMenuItem[];
  activeItemId?: string;
  account: GlobalNavAccount;
  todayListCount?: number | null;
  onNavigate?: (item: GlobalNavMenuItem) => void;
  onLogin?: () => void;
  onAccountNavigate?: (item: Extract<GlobalNavAccountMenuItem, { type: "link" }>) => void;
  onAccountAction?: (item: Extract<GlobalNavAccountMenuItem, { type: "action" }>) => void;
};

const mobileIcons = { home: House, random: Dices, archive: Archive, settings: Settings } as const;

function navigationClick(
  event: MouseEvent<HTMLAnchorElement>,
  item: GlobalNavMenuItem,
  onNavigate: GlobalNavProps["onNavigate"],
) {
  if (!onNavigate) return;
  event.preventDefault();
  onNavigate(item);
}

function AccountControl({
  account,
  onLogin,
  onAccountNavigate,
  onAccountAction,
}: Pick<GlobalNavProps, "account" | "onLogin" | "onAccountNavigate" | "onAccountAction">) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeWhenClickedOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeWhenClickedOutside);
    return () => document.removeEventListener("pointerdown", closeWhenClickedOutside);
  }, [open]);

  if (account.status === "guest") {
    return (
      <button type="button" onClick={onLogin} className="nl-nav-glass min-h-11 rounded-full px-3 text-nl-caption tracking-nl-tight text-nl-accent font-bold">
        {account.loginLabel}
      </button>
    );
  }

  const focusMenuItem = (position: "first" | "last") => {
    const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
    (position === "first" ? items?.[0] : items?.[items.length - 1])?.focus();
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setOpen(true);
    window.setTimeout(() => focusMenuItem(event.key === "ArrowDown" ? "first" : "last"));
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKeyDown}
        className="nl-nav-glass flex min-h-11 items-center gap-1.5 rounded-full px-3 text-nl-caption tracking-nl-tight text-nl-text font-bold"
      >
        <span>{account.displayName}</span>
        <ChevronDown width={20} height={20} aria-hidden />
      </button>
      {open ? (
        <UserMenu
          ref={menuRef}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            setOpen(false);
            triggerRef.current?.focus();
          }}
          className="absolute top-full right-0 z-30 mt-2"
        >
          {account.menuItems.map((item, index) => (
            <div key={item.id}>
              {index > 0 ? <UserMenuDivider /> : null}
              {item.type === "link" ? (
                <UserMenuLink
                  href={item.href}
                  label={item.label}
                  className="nl-nav-glass rounded-nl-button"
                  onClick={(event) => {
                    if (onAccountNavigate) {
                      event.preventDefault();
                      onAccountNavigate(item);
                    }
                    setOpen(false);
                  }}
                />
              ) : (
                <UserMenuItem
                  label={item.label}
                  tone="danger"
                  className="nl-nav-glass rounded-nl-button"
                  onClick={() => {
                    onAccountAction?.(item);
                    setOpen(false);
                  }}
                />
              )}
            </div>
          ))}
        </UserMenu>
      ) : null}
    </div>
  );
}

export function GlobalNav({
  menus,
  activeItemId,
  account,
  todayListCount = null,
  onNavigate,
  onLogin,
  onAccountNavigate,
  onAccountAction,
}: GlobalNavProps) {
  const mobileMenus = menus.filter((menu) => menu.id in mobileIcons);

  return (
    <header>
      <nav aria-label="주 내비게이션" className="sticky top-0 z-20 hidden h-20 w-full items-center gap-12 border-b border-nl-border bg-nl-bg px-10 md:flex">
        <Link href="/" aria-label="NewsLittle 홈" className="shrink-0"><BrandLockup /></Link>
        <div className="flex items-center gap-8">
          {menus.map((menu) => (
            <Link
              key={menu.id}
              href={menu.href}
              aria-current={menu.id === activeItemId ? "page" : undefined}
              onClick={(event) => navigationClick(event, menu, onNavigate)}
              className={cn(
                "nl-nav-glass min-h-11 rounded-full px-3 content-center text-nl-body tracking-nl-tight font-semibold",
                menu.id === activeItemId ? "text-nl-accent" : "text-nl-muted",
              )}
            >
              {menu.label}
            </Link>
          ))}
        </div>
        <div className="flex-1" />
        <span className="h-6 w-px bg-nl-border" aria-hidden />
        <AccountControl account={account} onLogin={onLogin} onAccountNavigate={onAccountNavigate} onAccountAction={onAccountAction} />
      </nav>

      <nav aria-label="모바일 주 내비게이션" className="fixed inset-x-0 bottom-0 z-20 flex min-h-[72px] border-t border-nl-border bg-nl-bg pb-[env(safe-area-inset-bottom)] md:hidden">
        {mobileMenus.map((menu) => {
          const Icon = mobileIcons[menu.id as keyof typeof mobileIcons];
          const isActive = menu.id === activeItemId;
          const showCount = menu.id === "home" && account.status === "member" && todayListCount !== null;
          return (
            <Link
              key={menu.id}
              href={menu.href}
              aria-current={isActive ? "page" : undefined}
              onClick={(event) => navigationClick(event, menu, onNavigate)}
              className={cn(
                "nl-nav-glass relative m-1 flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-nl-button text-nl-micro font-semibold",
                isActive ? "text-nl-accent" : "text-nl-muted",
              )}
            >
              <Icon width={22} height={22} aria-hidden />
              <span>{menu.label}</span>
              {showCount ? <span className="absolute top-2 ml-7 min-w-4 rounded-full bg-nl-accent px-1 text-center text-[10px] leading-4 text-nl-on-accent" aria-label={`오늘 목록 ${todayListCount}개`}>{todayListCount}</span> : null}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
