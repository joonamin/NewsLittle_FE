// lib: Progress / Step Label (X1rDs1), Progress / Bar (3-Step) (te9hx)
export type ProgressLabelProps = {
  category: string;
  progress: string;
};

export function ProgressLabel({ category, progress }: ProgressLabelProps) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <p className="text-nl-caption text-nl-accent font-bold">{category}</p>
      <p className="text-nl-caption text-nl-muted font-normal">{progress}</p>
    </div>
  );
}

export type ProgressBarProps = {
  current: number;
  total?: number;
};

export function ProgressBar({ current, total = 3 }: ProgressBarProps) {
  const segments = Array.from({ length: total }, (_, index) => index < current);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current}
      className="flex w-full items-center gap-4"
    >
      {segments.map((filled, index) => (
        <span
          key={index}
          className={`h-1 flex-1 rounded-full ${filled ? "bg-nl-accent" : "bg-nl-border"}`}
        />
      ))}
    </div>
  );
}
