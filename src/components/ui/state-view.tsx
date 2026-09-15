// lib: State / Loading · 로딩 중 (P2Pzg), State / Error · 오류 발생 화면 (MTQm0)
import { CircleAlert } from "lucide-react";

import { Button } from "./button";
import { Spinner } from "./spinner";

export type LoadingStateProps = {
  title: string;
  description?: string;
  className?: string;
};

export function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <div className="flex h-[320px] w-full flex-col items-center justify-center gap-4 rounded-nl-card bg-nl-subtle">
      <Spinner />
      <p className="text-[20px] leading-[1.5] text-nl-text font-bold">{title}</p>
      {description ? <p className="text-nl-caption text-nl-muted font-normal">{description}</p> : null}
    </div>
  );
}

export type ErrorStateProps = {
  title: string;
  description: string;
  retryLabel?: string;
  goHomeLabel?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
};

export function ErrorState({
  title,
  description,
  retryLabel = "다시 시도",
  goHomeLabel = "홈으로",
  onRetry,
  onGoHome,
}: ErrorStateProps) {
  return (
    <div className="flex h-[320px] w-full flex-col items-center justify-center gap-4 rounded-nl-card bg-nl-subtle p-8">
      <CircleAlert width={40} height={40} className="text-nl-negative" aria-hidden />
      <p className="text-[20px] leading-[1.5] text-nl-text font-bold">{title}</p>
      <p className="text-nl-caption text-nl-muted max-w-[420px] text-center font-normal leading-[1.5]">
        {description}
      </p>
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={onRetry}>
          {retryLabel}
        </Button>
        <Button variant="secondary" onClick={onGoHome}>
          {goHomeLabel}
        </Button>
      </div>
    </div>
  );
}
