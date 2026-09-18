import { Button } from "./button";

export type QuestionNavigationProps = {
  current: number;
  total: number;
  canGoNext: boolean;
  pending?: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function QuestionNavigation({
  current,
  total,
  canGoNext,
  pending = false,
  onPrevious,
  onNext,
}: QuestionNavigationProps) {
  return (
    <nav className="flex items-center justify-between gap-3" aria-label="문항 이동">
      <Button
        variant="secondary"
        disabled={current <= 1 || pending}
        onClick={onPrevious}
      >
        ← 이전 문제
      </Button>
      <p className="text-nl-micro text-nl-muted" aria-live="polite">
        {current} / {total}
      </p>
      <Button disabled={!canGoNext || pending} onClick={onNext}>
        {current >= total ? "결과 보기 →" : "다음 문제 →"}
      </Button>
    </nav>
  );
}
