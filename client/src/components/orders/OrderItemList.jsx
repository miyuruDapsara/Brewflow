import { formatCurrency } from '../../utils/formatCurrency';

export default function OrderItemList({ items = [] }) {
  if (!items.length) {
    return <p className="text-sm text-[var(--bf-muted)]">No items</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id || `${item.productId}-${item.name}`}
          className="rounded-xl border border-[var(--bf-border)] bg-[var(--bf-cream)]/60 px-3 py-2 text-sm"
        >
          <div className="flex justify-between gap-3">
            <span className="font-medium text-[var(--bf-ink)]">
              {item.name} × {item.quantity}
            </span>
            <span className="text-[var(--bf-accent)]">
              {formatCurrency(item.lineTotal)}
            </span>
          </div>
          {item.selectedModifiers?.length ? (
            <ul className="mt-1 space-y-0.5 text-xs text-[var(--bf-muted)]">
              {item.selectedModifiers.map((mod) => (
                <li key={`${mod.groupId}-${mod.optionId}`}>
                  {mod.groupName}: {mod.optionName}
                </li>
              ))}
            </ul>
          ) : null}
          {item.notes ? (
            <p className="mt-1 text-xs italic text-[var(--bf-muted)]">
              Note: {item.notes}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
