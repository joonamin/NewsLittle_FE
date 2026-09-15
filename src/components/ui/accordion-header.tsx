// lib: Accordion / Date Group Header (X7imC)
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type DateGroupHeaderProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  expanded?: boolean;
};

export function DateGroupHeader({
  label,
  expanded = true,
  className,
  type = "button",
  ...props
}: DateGroupHeaderProps) {
  const Icon = expanded ? ChevronUp : ChevronDown;

  return (
    <button
      type={type}
      aria-expanded={expanded}
      className={cn("flex h-12 w-full items-center justify-between", className)}
      {...props}
    >
      <span className="text-[18px] leading-[1.5] text-nl-text tracking-nl-tight font-bold">{label}</span>
      <Icon width={24} height={24} className="text-nl-accent" aria-hidden />
    </button>
  );
}
