import { formatCurrency } from '../../utils/formatCurrency';

export default function CartSummary({ subtotal, itemCount }) {
  return (
    <div className="rounded-xl border border-[var(--bf-border)] bg-[#f3ebe0] p-4">
      <div className="flex items-center justify-between text-sm text-[var(--bf-muted)]">
        <span>Items</span>
        <span>{itemCount}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-base font-semibold text-[var(--bf-ink)]">
        <span>Subtotal</span>
        <span className="text-[var(--bf-accent)]">
          {formatCurrency(subtotal)}
        </span>
      </div>
      <p className="mt-2 text-xs text-[var(--bf-muted)]">
        Prices shown are estimates. Final total is calculated at checkout.
      </p>
    </div>
  );
}
