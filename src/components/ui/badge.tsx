// lib: Badge / Status (MtY9u)
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type BadgeTone = "positive" | "negative" | "default" | "accent";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  positive: "bg-nl-positive-subtle text-nl-positive",
  negative: "bg-nl-negative-subtle text-nl-negative",
  default: "bg-nl-subtle text-nl-muted",
  accent: "bg-nl-accent-subtle text-nl-accent",
};

export function Badge({ tone = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[56px] items-center justify-center rounded-nl-badge px-2 py-1 text-nl-micro leading-[1.5] font-normal",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
