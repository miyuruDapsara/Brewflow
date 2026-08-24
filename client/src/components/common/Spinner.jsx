export default function Spinner({ label = 'Loading...' }) {
  return (
    <div
      className="flex items-center gap-3 text-sm text-[var(--bf-muted)]"
      role="status"
    >
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--bf-accent)]/25 border-t-[var(--bf-accent)]" />
      <span>{label}</span>
    </div>
  );
}
