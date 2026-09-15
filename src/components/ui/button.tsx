// lib: Button (Rd5Tc)
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "default";
export type ButtonSize = "l" | "m" | "s" | "xs";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border border-transparent bg-nl-accent text-nl-on-accent",
  secondary: "border border-nl-border bg-nl-bg text-nl-text",
  default: "border-2 border-nl-accent bg-nl-accent-subtle text-nl-accent",
};

const sizeClasses: Record<ButtonSize, string> = {
  l: "h-12 px-6",
  m: "h-11 px-5",
  s: "h-11 px-4",
  xs: "h-10 px-5",
};

export function Button({
  variant = "primary",
  size = "l",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-nl-button text-nl-caption leading-[1.5] font-bold tracking-nl-tight transition-colors",
        "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-nl-disabled disabled:text-nl-disabled-content",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
