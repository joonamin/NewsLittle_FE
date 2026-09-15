// lib: Chip / Category (GLZd0)
import { Check } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  selected?: boolean;
};

export function Chip({ label, selected = false, className, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      role="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-12 w-[120px] items-center justify-center gap-1.5 rounded-full border transition-colors",
        selected
          ? "border-nl-border bg-nl-text text-nl-on-accent"
          : "border-nl-border bg-nl-bg text-nl-text",
        className,
      )}
      {...props}
    >
      {selected ? <Check width={16} height={16} aria-hidden /> : null}
      <span className="text-nl-caption font-bold">{label}</span>
    </button>
  );
}
