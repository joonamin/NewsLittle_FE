// lib: Accordion / Date Group Header (X7imC)
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type DateGroupHeaderProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  expanded?: boolean;
  /** 접힘/펼침 상태를 아이콘뿐 아니라 화면에 보이는 텍스트로도 병기한다(NFR-07). */
  showsStateText?: boolean;
};

export function DateGroupHeader({
  label,
  expanded = true,
  showsStateText = false,
  className,
  type = "button",
  ...props
}: DateGroupHeaderProps) {
  const Icon = expanded ? ChevronUp : ChevronDown;

  return (
    <button
      type={type}
      aria-expanded={expanded}
      className={cn(
        "flex h-12 w-full items-center justify-between rounded-nl-button px-2 -mx-2 transition-colors hover:bg-nl-subtle",
        className,
      )}
      {...props}
    >
      <span className="text-[18px] leading-[1.5] text-nl-text tracking-nl-tight font-bold">{label}</span>
      <span className="flex items-center gap-1.5">
        {showsStateText ? (
          <span className="text-nl-micro text-nl-muted font-normal">{expanded ? "펼침" : "접힘"}</span>
        ) : null}
        <Icon width={24} height={24} className="text-nl-accent" aria-hidden />
      </span>
    </button>
  );
}
