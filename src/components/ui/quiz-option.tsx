// lib: Quiz Option / OX (oJohJ), Quiz Option / Multiple Choice (wUqTS)
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type OptionStateClasses = {
  selected: boolean;
};

function optionStateClasses({ selected }: OptionStateClasses) {
  return selected
    ? "border-nl-accent text-nl-accent ring-1 ring-inset ring-nl-accent"
    : "border-nl-border text-nl-text hover:border-nl-accent hover:bg-nl-accent-wash";
}

export type QuizOptionOXProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  selected?: boolean;
};

export function QuizOptionOX({ label, selected = false, className, type = "button", ...props }: QuizOptionOXProps) {
  return (
    <button
      type={type}
      role="radio"
      aria-checked={selected}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-5 rounded-nl-card border bg-nl-bg p-6 text-[20px] leading-[1.5] font-bold transition-colors",
        optionStateClasses({ selected }),
        className,
      )}
      {...props}
    >
      {label}
    </button>
  );
}

export type QuizOptionChoiceProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  index: number;
  text: string;
  selected?: boolean;
};

export function QuizOptionChoice({
  index,
  text,
  selected = false,
  className,
  type = "button",
  ...props
}: QuizOptionChoiceProps) {
  return (
    <button
      type={type}
      role="radio"
      aria-checked={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-nl-card border bg-nl-bg px-5 py-4 text-left transition-colors",
        optionStateClasses({ selected }),
        className,
      )}
      {...props}
    >
      <span className="text-nl-body font-bold">{index}</span>
      <span className="text-nl-body font-normal">{text}</span>
    </button>
  );
}
