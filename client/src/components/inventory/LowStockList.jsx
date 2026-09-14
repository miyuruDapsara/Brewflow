import StockBadge from './StockBadge';
import EmptyState from '../common/EmptyState';

export default function LowStockList({ items = [] }) {
  if (!items.length) {
    return (
      <EmptyState
        title="No low-stock items"
        description="All active ingredients are above their reorder levels."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-100 bg-red-50/50 px-3 py-2 text-sm"
        >
          <span className="font-medium text-[var(--bf-ink)]">
            {item.name}{' '}
            <span className="text-[var(--bf-muted)]">({item.unit})</span>
          </span>
          <StockBadge
            quantity={item.currentQuantity}
            reorderLevel={item.reorderLevel}
          />
        </li>
      ))}
    </ul>
  );
}
