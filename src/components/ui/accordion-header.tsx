// lib: Accordion / Date Group Header (X7imC)
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type AccordionHeaderPriorityProps = {
  /** 1순위 정보 (가장 강조되는 주 식별자/제목). 예: 아카이브의 '제목' */
  p1?: ReactNode;
  /** 2순위 정보 (보조 맥락/일시 등). 예: 아카이브의 '날짜' */
  p2?: ReactNode;
  /** 3순위 정보 (부차 정보/수량/배지 등). 예: 아카이브의 '개수' */
  p3?: ReactNode;
};

export type AccordionHeaderProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
  AccordionHeaderPriorityProps & {
    /** 기존 단일 라벨 호환용 (p1/p2/p3 미지정 시 fallback) */
    label?: string;
    expanded?: boolean;
    /** 접힘/펼침 상태를 아이콘뿐 아니라 화면에 보이는 텍스트로도 병기한다(NFR-07). */
    showsStateText?: boolean;
  };

export function AccordionHeader({
  p1,
  p2,
  p3,
  label,
  expanded = true,
  showsStateText = false,
  className,
  type = "button",
  ...props
}: AccordionHeaderProps) {
  const Icon = expanded ? ChevronUp : ChevronDown;
  const hasPriorityProps = p1 !== undefined || p2 !== undefined || p3 !== undefined;

  return (
    <button
      type={type}
      aria-expanded={expanded}
      className={cn(
        "flex min-h-12 w-full items-center justify-between rounded-nl-button px-2 -mx-2 py-2 text-left transition-colors hover:bg-nl-subtle",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1 pr-3">
        {hasPriorityProps ? (
          <>
            {p1 !== undefined && p1 !== null ? (
              <span className="text-[18px] leading-[1.5] font-bold tracking-nl-tight text-nl-text">
                {p1}
              </span>
            ) : null}
            {p2 !== undefined && p2 !== null ? (
              <span className="flex items-center gap-2 text-nl-caption font-normal text-nl-muted">
                {p1 !== undefined && p1 !== null ? (
                  <span className="text-nl-border select-none" aria-hidden="true">
                    ·
                  </span>
                ) : null}
                {p2}
              </span>
            ) : null}
            {p3 !== undefined && p3 !== null ? (
              <span className="inline-flex items-center justify-center rounded-full border border-nl-border bg-nl-subtle px-2.5 py-0.5 text-nl-micro font-medium text-nl-muted">
                {p3}
              </span>
            ) : null}
          </>
        ) : (
          <span className="text-[18px] leading-[1.5] font-bold tracking-nl-tight text-nl-text">
            {label}
          </span>
        )}
      </div>
      <span className="flex shrink-0 items-center gap-1.5 self-center">
        {showsStateText ? (
          <span className="text-nl-micro font-normal text-nl-muted">{expanded ? "펼침" : "접힘"}</span>
        ) : null}
        <Icon width={24} height={24} className="text-nl-accent" aria-hidden />
      </span>
    </button>
  );
}

export const DateGroupHeader = AccordionHeader;
export type DateGroupHeaderProps = AccordionHeaderProps;

