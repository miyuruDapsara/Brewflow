export default function EmptyState({ title = 'Nothing here yet', description }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--bf-border)] bg-white/70 px-6 py-10 text-center">
      <h2 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm text-[var(--bf-muted)]">{description}</p>
      ) : null}
    </div>
  );
}
