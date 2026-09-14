import { formatCurrency } from '../../utils/formatCurrency';

export default function SalesSummary({ summary, failedPayments, cancellations, series = [] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="bf-glass rounded-2xl px-3 py-4 text-center">
          <p className="bf-display text-xl font-bold text-[var(--bf-ink)]">
            {formatCurrency(summary?.revenue || 0)}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wide text-[var(--bf-muted)]">
            Revenue
          </p>
        </div>
        <div className="bf-glass rounded-2xl px-3 py-4 text-center">
          <p className="bf-display text-xl font-bold text-[var(--bf-ink)]">
            {summary?.orderCount || 0}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wide text-[var(--bf-muted)]">
            Orders
          </p>
        </div>
        <div className="bf-glass rounded-2xl px-3 py-4 text-center">
          <p className="bf-display text-xl font-bold text-[var(--bf-ink)]">
            {failedPayments || 0}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wide text-[var(--bf-muted)]">
            Failed pays
          </p>
        </div>
        <div className="bf-glass rounded-2xl px-3 py-4 text-center">
          <p className="bf-display text-xl font-bold text-[var(--bf-ink)]">
            {cancellations || 0}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wide text-[var(--bf-muted)]">
            Cancelled
          </p>
        </div>
      </div>

      <div className="bf-glass rounded-2xl p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--bf-muted)]">
          Sales series
        </h3>
        {series.length === 0 ? (
          <p className="text-sm text-[var(--bf-muted)]">No sales in this range.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {series.map((row) => (
              <li
                key={row.period}
                className="flex justify-between gap-3 border-b border-[var(--bf-border)]/60 pb-2"
              >
                <span className="text-[var(--bf-ink)]">{row.period}</span>
                <span className="text-[var(--bf-accent)]">
                  {formatCurrency(row.revenue)} · {row.orderCount} orders
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
