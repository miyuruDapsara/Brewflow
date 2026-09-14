import EmptyState from '../common/EmptyState';
import StockBadge from '../inventory/StockBadge';

export default function InventoryReport({ report }) {
  const items = report?.items || [];
  const summary = report?.summary || { totalItems: 0, lowStockCount: 0 };

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--bf-muted)]">
        {summary.totalItems} items · {summary.lowStockCount} low stock
      </p>
      {!items.length ? (
        <EmptyState
          title="No inventory items"
          description="Add ingredients under Inventory to see stock here."
        />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--bf-border)] bg-white/70 px-3 py-2 text-sm"
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
      )}
    </div>
  );
}
