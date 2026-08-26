const STAT_KEYS = [
  { key: 'PLACED', label: 'Placed' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY', label: 'Ready' },
];

export default function StaffStats({ counts = {} }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {STAT_KEYS.map(({ key, label }) => (
        <div
          key={key}
          className="bf-glass rounded-2xl px-3 py-4 text-center"
        >
          <p className="bf-display text-2xl font-bold text-[var(--bf-ink)]">
            {counts[key] || 0}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--bf-muted)]">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
