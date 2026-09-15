// lib: Select / 필터 (gBhCc)
import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type FilterSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  label: string;
  options: readonly string[];
  className?: string;
};

export function FilterSelect({ label, options, className, ...props }: FilterSelectProps) {
  return (
    <label
      className={cn(
        "inline-flex h-10 items-center gap-1 rounded-nl-button border border-nl-border bg-nl-bg px-5 text-nl-caption font-bold text-nl-text",
        className,
      )}
    >
      <span>{label}:</span>
      <select
        className="appearance-none bg-transparent pr-1 font-bold text-nl-text focus:outline-none"
        {...props}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown width={16} height={16} aria-hidden />
    </label>
  );
}
