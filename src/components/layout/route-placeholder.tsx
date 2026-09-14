type RoutePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  notes?: readonly string[];
  sessionId?: string;
};

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
  notes = [],
  sessionId,
}: RoutePlaceholderProps) {
  return (
    <section className="max-w-2xl space-y-6" data-testid="route-placeholder">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-600">{eyebrow}</p>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-base leading-7 text-slate-700">{description}</p>
      </div>

      {sessionId ? (
        <p className="rounded border border-slate-200 p-4 text-sm">
          세션 ID: <code data-testid="session-id">{sessionId}</code>
        </p>
      ) : null}

      {notes.length > 0 ? (
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
