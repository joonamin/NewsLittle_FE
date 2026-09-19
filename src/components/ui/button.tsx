// lib: Button (Rd5Tc)
import type { ButtonHTMLAttributes } from "react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "default";
export type ButtonSize = "l" | "m" | "s" | "xs";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border border-transparent bg-nl-accent text-nl-on-accent hover:bg-nl-accent/90",
  secondary: "border border-nl-border bg-nl-bg text-nl-text hover:bg-nl-subtle",
  default: "border-2 border-nl-accent bg-nl-accent-subtle text-nl-accent hover:bg-nl-accent-wash",
};

const sizeClasses: Record<ButtonSize, string> = {
  l: "h-12 px-6",
  m: "h-11 px-5",
  s: "h-11 px-4",
  xs: "h-10 px-5",
};

const spinnerSizeClasses: Record<ButtonSize, string> = {
  l: "h-5 w-5 border-2",
  m: "h-4 w-4 border-2",
  s: "h-4 w-4 border-2",
  xs: "h-3.5 w-3.5 border-2",
};

const spinnerPositionClasses: Record<ButtonSize, string> = {
  l: "left-6",
  m: "left-5",
  s: "left-4",
  xs: "left-5",
};

const spinnerColorClasses: Record<ButtonVariant, string> = {
  primary: "border-white/30 border-t-white",
  secondary: "border-nl-border border-t-nl-accent",
  default: "border-nl-accent/30 border-t-nl-accent",
};

export function Button({
  variant = "primary",
  size = "l",
  loading = false,
  disabled,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-nl-button text-nl-caption leading-[1.5] font-bold tracking-nl-tight transition-colors",
        !loading && "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-nl-disabled disabled:text-nl-disabled-content",
        loading && "cursor-wait opacity-80",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 flex items-center justify-center",
            spinnerPositionClasses[size],
          )}
          aria-hidden="true"
        >
          <Spinner className={cn(spinnerSizeClasses[size], spinnerColorClasses[variant])} />
        </span>
      ) : null}
      {children}
    </button>
  );
}
