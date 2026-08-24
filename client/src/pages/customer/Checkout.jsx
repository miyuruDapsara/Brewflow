import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import useCart from '../../hooks/useCart';
import { createOrder } from '../../services/order';
import { formatCurrency } from '../../utils/formatCurrency';
import { getErrorMessage } from '../../utils/errorHandler';

function cartItemsToOrderPayload(items) {
  return items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    selectedModifiers: (item.selectedModifiers || []).map((mod) => ({
      groupId: mod.groupId,
      optionId: mod.optionId,
    })),
    notes: item.notes || '',
  }));
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [orderType, setOrderType] = useState('PICKUP');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handlePlaceOrder() {
    setError('');
    setSubmitting(true);
    try {
      const data = await createOrder({
        orderType,
        items: cartItemsToOrderPayload(items),
      });
      clearCart();
      navigate(`/orders/${data.order.id}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to place order'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!items.length) {
    return (
      <section className="bf-page space-y-4">
        <h1 className="bf-display text-3xl font-bold text-[var(--bf-ink)]">
          Checkout
        </h1>
        <EmptyState
          title="Nothing to check out"
          description="Add items from the menu first."
        />
        <Link to="/menu">
          <Button>Browse menu</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="bf-page mx-auto max-w-xl space-y-6">
      <h1 className="bf-display text-3xl font-bold tracking-tight text-[var(--bf-ink)]">
        Checkout
      </h1>

      <fieldset className="bf-glass space-y-3 rounded-2xl p-4">
        <legend className="px-1 text-sm font-medium text-[var(--bf-muted)]">
          Order type
        </legend>
        <label className="flex items-center gap-2 text-sm text-[var(--bf-ink)]">
          <input
            type="radio"
            name="orderType"
            value="PICKUP"
            checked={orderType === 'PICKUP'}
            onChange={() => setOrderType('PICKUP')}
          />
          Pickup
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--bf-ink)]">
          <input
            type="radio"
            name="orderType"
            value="DINE_IN"
            checked={orderType === 'DINE_IN'}
            onChange={() => setOrderType('DINE_IN')}
          />
          Dine in
        </label>
      </fieldset>

      <div className="bf-glass-strong rounded-2xl p-4">
        <h2 className="bf-display font-bold text-[var(--bf-ink)]">
          Order preview
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--bf-muted)]">
          {items.map((item) => (
            <li key={item.lineId} className="flex justify-between gap-3">
              <span>
                {item.name} × {item.quantity}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-[var(--bf-muted)]">
          Cart preview subtotal: {formatCurrency(subtotal)}. Final tax and total
          are calculated on the server when you place the order.
        </p>
      </div>

      <ErrorMessage message={error} />

      <Button disabled={submitting} onClick={handlePlaceOrder}>
        {submitting ? 'Placing order...' : 'Place order'}
      </Button>
    </section>
  );
}
