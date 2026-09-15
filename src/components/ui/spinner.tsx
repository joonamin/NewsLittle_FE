// lib: Spinner / 로딩 스피너 (zK2HK)
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type SpinnerProps = HTMLAttributes<HTMLDivElement>;

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={cn(
        "h-10 w-10 animate-spin rounded-full border-4 border-nl-border border-t-nl-accent",
        className,
      )}
      {...props}
    />
  );
}
