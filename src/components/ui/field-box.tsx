// lib: Field Box / 값 박스 (Iy0mI)
export type ReadonlyFieldProps = {
  value: string;
  hint?: string | null;
};

export function ReadonlyField({ value, hint }: ReadonlyFieldProps) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-nl-button border border-nl-border bg-nl-bg p-3">
      <p className="text-nl-caption text-nl-text font-normal">{value}</p>
      {hint ? <p className="text-nl-micro text-nl-muted font-normal">{hint}</p> : null}
    </div>
  );
}
