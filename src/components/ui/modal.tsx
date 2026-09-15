// lib: Modal / Base · 공통 원본 (ppksg), Modal / Close · 공통 X 닫기 (JxfkW)
import { X } from "lucide-react";
import { useEffect, useId } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Button } from "./button";

export type ModalSize = "standard" | "compact";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: ModalSize;
  children: ReactNode;
  footer?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

const sizeClasses: Record<ModalSize, { padding: string; gap: string; title: string }> = {
  standard: { padding: "p-8", gap: "gap-5", title: "text-[24px]" },
  compact: { padding: "p-6", gap: "gap-4", title: "text-[20px]" },
};

export function Modal({
  open,
  onClose,
  title,
  size = "standard",
  children,
  footer,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const { padding, gap, title: titleSize } = sizeClasses[size];

  return (
    <div className="bg-nl-overlay fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "relative flex w-[600px] flex-col rounded-nl-card border border-nl-border bg-nl-bg",
          padding,
          gap,
        )}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-nl-button bg-nl-bg"
        >
          <X width={24} height={24} className="text-nl-muted" aria-hidden />
        </button>
        <div className="pr-[60px]">
          <p id={titleId} className={cn(titleSize, "leading-[1.5] text-nl-text font-bold")}>
            {title}
          </p>
        </div>
        <div className={cn("flex flex-col", gap)}>{children}</div>
        <div className={cn("flex flex-col", gap)}>
          {footer ?? (
            <div className="flex w-full justify-end gap-3">
              <Button variant="secondary" onClick={onCancel ?? onClose}>
                {cancelLabel}
              </Button>
              <Button variant="primary" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
