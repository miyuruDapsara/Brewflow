import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import OrderCard from '../../components/orders/OrderCard';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Spinner from '../../components/common/Spinner';
import { listMyOrders } from '../../services/order';
import { getErrorMessage } from '../../utils/errorHandler';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await listMyOrders();
        if (!cancelled) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Unable to load orders'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bf-page space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="bf-display text-3xl font-bold tracking-tight text-[var(--bf-ink)]">
          Your orders
        </h1>
        <Link to="/menu">
          <Button variant="secondary">Browse menu</Button>
        </Link>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Spinner label="Loading orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order, it will show up here."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}
