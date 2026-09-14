import { formatCurrency } from '../../utils/formatCurrency';
import EmptyState from '../common/EmptyState';

export default function PopularProducts({ products = [] }) {
  if (!products.length) {
    return (
      <EmptyState
        title="No product sales"
        description="Paid orders in this range will show units sold here."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {products.map((p) => (
        <li
          key={p.productId || p.name}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--bf-border)] bg-white/70 px-3 py-2 text-sm"
        >
          <span className="font-medium text-[var(--bf-ink)]">{p.name}</span>
          <span className="text-[var(--bf-muted)]">
            {p.unitsSold} sold · {formatCurrency(p.revenue)}
          </span>
        </li>
      ))}
    </ul>
  );
}
