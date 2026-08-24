import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrderActions from '../../components/orders/OrderActions';
import OrderItemList from '../../components/orders/OrderItemList';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import OrderStatusTimeline from '../../components/orders/OrderStatusTimeline';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Spinner from '../../components/common/Spinner';
import { cancelOrder, getOrder } from '../../services/order';
import { formatCurrency } from '../../utils/formatCurrency';
import { getErrorMessage } from '../../utils/errorHandler';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getOrder(id);
        if (!cancelled) {
          setOrder(data.order);
        }
      } catch (err) {
        if (!cancelled) {
          setOrder(null);
          setError(getErrorMessage(err, 'Order not found'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleCancel() {
    setCancelling(true);
    setError('');
    try {
      const data = await cancelOrder(id);
      setOrder(data.order);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to cancel order'));
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return <Spinner label="Loading order..." />;
  }

  if (error && !order) {
    return (
      <div className="space-y-4">
        <ErrorMessage message={error} />
        <Link to="/orders">
          <Button variant="secondary">Back to orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <section className="bf-page mx-auto max-w-2xl space-y-6">
      <Link
        to="/orders"
        className="text-sm font-medium text-[var(--bf-accent)] underline-offset-4 transition hover:underline"
      >
        Back to orders
      </Link>

      <div className="bf-glass-strong rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="bf-display text-2xl font-bold text-[var(--bf-ink)]">
              {order.orderNumber}
            </h1>
            <p className="text-sm text-[var(--bf-muted)]">{order.orderType}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-4">
          <OrderStatusTimeline status={order.status} />
        </div>

        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-[var(--bf-muted)]">
            Items
          </h2>
          <OrderItemList items={order.items} />
        </div>

        <dl className="mt-6 space-y-1 text-sm">
          <div className="flex justify-between text-[var(--bf-muted)]">
            <dt>Subtotal</dt>
            <dd>{formatCurrency(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-[var(--bf-muted)]">
            <dt>Tax</dt>
            <dd>{formatCurrency(order.tax)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold text-[var(--bf-ink)]">
            <dt>Total</dt>
            <dd className="text-[var(--bf-accent)]">
              {formatCurrency(order.total)}
            </dd>
          </div>
          <div className="flex justify-between pt-2 text-[var(--bf-muted)]">
            <dt>Payment</dt>
            <dd>{order.paymentStatus}</dd>
          </div>
        </dl>

        {order.paymentStatus === 'PENDING' ? (
          <p className="mt-4 rounded-lg border border-[var(--bf-border)] bg-[var(--bf-cream)] px-3 py-2 text-sm text-[var(--bf-muted)]">
            Card payment arrives in Phase 10. This order is placed with payment
            pending.
          </p>
        ) : null}

        <div className="mt-6">
          <ErrorMessage message={error} />
          <OrderActions
            order={order}
            onCancel={handleCancel}
            cancelling={cancelling}
          />
        </div>
      </div>
    </section>
  );
}
