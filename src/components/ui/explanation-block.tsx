// lib: 해설 블록 (Xf1zx)
export type ExplanationBlockProps = {
  header: string;
  body: string;
  hint?: string | null;
};

export function ExplanationBlock({ header, body, hint }: ExplanationBlockProps) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-nl-card border border-nl-border bg-nl-accent-subtle p-6">
      <p className="text-[18px] leading-[1.5] text-nl-accent font-bold">{header}</p>
      <p className="text-nl-caption text-nl-text font-normal leading-[1.6]">{body}</p>
      {hint ? <p className="text-nl-micro text-nl-muted font-normal">{hint}</p> : null}
    </div>
  );
}
