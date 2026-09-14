import Button from '../common/Button';

function toInputDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function ReportFilters({
  from,
  to,
  groupBy,
  onChange,
  onApply,
  loading = false,
}) {
  return (
    <form
      className="bf-glass flex flex-wrap items-end gap-3 rounded-2xl p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onApply?.();
      }}
    >
      <label className="text-xs text-[var(--bf-muted)]">
        From
        <input
          type="date"
          className="mt-1 block rounded-lg border border-[var(--bf-border)] bg-white px-2 py-1.5 text-sm text-[var(--bf-ink)]"
          value={toInputDate(from)}
          onChange={(e) => onChange?.({ from: e.target.value })}
        />
      </label>
      <label className="text-xs text-[var(--bf-muted)]">
        To
        <input
          type="date"
          className="mt-1 block rounded-lg border border-[var(--bf-border)] bg-white px-2 py-1.5 text-sm text-[var(--bf-ink)]"
          value={toInputDate(to)}
          onChange={(e) => onChange?.({ to: e.target.value })}
        />
      </label>
      <label className="text-xs text-[var(--bf-muted)]">
        Group by
        <select
          className="mt-1 block rounded-lg border border-[var(--bf-border)] bg-white px-2 py-1.5 text-sm text-[var(--bf-ink)]"
          value={groupBy || 'day'}
          onChange={(e) => onChange?.({ groupBy: e.target.value })}
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
        </select>
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? 'Loading…' : 'Apply'}
      </Button>
    </form>
  );
}
