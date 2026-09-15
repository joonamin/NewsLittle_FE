// lib: 상태 안내 카드 (N0Vy7)
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type StateNoticeTone = "plain" | "accent";

export type StateNoticeProps = {
  title: string;
  description: string;
  tone?: StateNoticeTone;
  actions?: ReactNode;
  className?: string;
};

const titleToneClasses: Record<StateNoticeTone, string> = {
  plain: "text-nl-text",
  accent: "text-nl-accent",
};

export function StateNotice({ title, description, tone = "plain", actions, className }: StateNoticeProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-[600px] flex-col gap-4 rounded-nl-card border border-nl-border bg-nl-bg p-6",
        className,
      )}
    >
      <p className={cn("text-[18px] leading-[1.5] font-bold", titleToneClasses[tone])}>{title}</p>
      <p className="text-nl-caption text-nl-muted font-normal">{description}</p>
      {actions ? <div className="flex w-full gap-2">{actions}</div> : null}
    </div>
  );
}
