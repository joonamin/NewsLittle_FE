import type { HTMLAttributes } from "react";
import { Check, X, Award, HelpCircle } from "lucide-react";

import { cn } from "@/lib/cn";

export type AnswerOutcome = "correct" | "incorrect" | "given-up" | "service-excluded" | "pending";

export type AnswerComparisonProps = HTMLAttributes<HTMLDivElement> & {
  userAnswer?: string | null;
  correctAnswer?: string | null;
  isCorrect?: boolean;
  outcome?: AnswerOutcome;
};

export function AnswerComparison({
  userAnswer,
  correctAnswer,
  isCorrect,
  outcome,
  className,
  ...props
}: AnswerComparisonProps) {
  const isPending = outcome === "pending";
  const isGivenUp = outcome === "given-up" || (!userAnswer && userAnswer !== "" && !isPending);
  const positive = outcome ? outcome === "correct" : Boolean(isCorrect);
  const isExcluded = outcome === "service-excluded";

  const displayedUserAnswer = isGivenUp
    ? "답변하지 않고 건너뛰었어요"
    : (userAnswer ?? "포기");

  const displayedCorrectAnswer = correctAnswer || "-";

  return (
    <div
      className={cn("flex flex-col gap-2.5 my-3 w-full", className)}
      aria-label="제출 답변 및 정답 대조"
      {...props}
    >
      {/* 1. 내 답변 카드 */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-3.5 rounded-nl-card border p-4 transition-colors",
          positive
            ? "border-emerald-200 bg-emerald-50/70"
            : isPending
              ? "border-amber-200 bg-amber-50/70"
              : isGivenUp
                ? "border-nl-border bg-nl-subtle/80"
                : isExcluded
                  ? "border-indigo-200 bg-indigo-50/60"
                  : "border-rose-200 bg-rose-50/70",
        )}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold leading-none tracking-tight",
              positive
                ? "bg-emerald-600 text-white"
                : isPending
                  ? "bg-amber-600 text-white"
                  : isGivenUp
                    ? "bg-gray-200 text-gray-700"
                    : isExcluded
                      ? "bg-indigo-600 text-white"
                      : "bg-rose-600 text-white",
            )}
          >
            {positive ? (
              <>
                <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden />
                <span>내 답변 (정답)</span>
              </>
            ) : isPending ? (
              <span>내 답변 (판정 중)</span>
            ) : isGivenUp ? (
              <>
                <HelpCircle className="h-3.5 w-3.5" aria-hidden />
                <span>내 답변 (포기)</span>
              </>
            ) : isExcluded ? (
              <span>내 답변 (제외)</span>
            ) : (
              <>
                <X className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden />
                <span>내 답변 (오답)</span>
              </>
            )}
          </span>
        </div>

        <p
          className={cn(
            "text-nl-caption leading-relaxed flex-1 break-keep",
            isGivenUp ? "text-nl-muted italic" : "text-nl-text font-medium",
          )}
        >
          {displayedUserAnswer}
        </p>
      </div>

      {/* 2. 정답 카드 */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-3.5 rounded-nl-card border border-emerald-300 bg-[#edf7e8] p-4 shadow-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-nl-positive px-2.5 py-1 text-xs font-bold text-white leading-none tracking-tight shadow-xs">
            <Award className="h-3.5 w-3.5" aria-hidden />
            <span>정답</span>
          </span>
        </div>

        <p className="text-nl-caption leading-relaxed font-bold text-nl-text flex-1 break-keep">
          {displayedCorrectAnswer}
        </p>
      </div>
    </div>
  );
}
