import { formatCurrency } from '../../utils/formatCurrency';

export default function CartSummary({ subtotal, itemCount }) {
  return (
    <div className="rounded-lg bg-amber-50/80 p-4 ring-1 ring-amber-100">
      <div className="flex items-center justify-between text-sm text-stone-600">
        <span>Items</span>
        <span>{itemCount}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-base font-semibold text-amber-950">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <p className="mt-2 text-xs text-stone-500">
        Prices shown are estimates. Final total is calculated at checkout.
      </p>
    </div>
  );
}
