import { formatCurrency } from '../../utils/formatCurrency';
import EmptyState from '../common/EmptyState';

export default function CategorySales({ categorySales = [] }) {
  if (!categorySales.length) {
    return (
      <EmptyState
        title="No category sales"
        description="Revenue by category appears after paid orders."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {categorySales.map((row) => (
        <li
          key={row.categoryId || row.name}
          className="flex justify-between gap-3 rounded-xl border border-[var(--bf-border)] bg-white/70 px-3 py-2 text-sm"
        >
          <span className="font-medium text-[var(--bf-ink)]">{row.name}</span>
          <span className="text-[var(--bf-accent)]">
            {formatCurrency(row.revenue)}
          </span>
        </li>
      ))}
    </ul>
  );
}
