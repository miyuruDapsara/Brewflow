import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Spinner from '../../components/common/Spinner';
import PaymentResult from '../../components/payments/PaymentResult';
import { getOrder } from '../../services/order';
import { getErrorMessage } from '../../utils/errorHandler';

export default function CheckoutReturn() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(orderId));

  useEffect(() => {
    if (!orderId) {
      return undefined;
    }

    let cancelled = false;
    let tries = 0;

    async function load() {
      try {
        const data = await getOrder(orderId);
        if (cancelled) {
          return;
        }
        setOrder(data.order);
        setError('');
        if (
          data.order.status === 'PENDING_PAYMENT' &&
          tries < 8
        ) {
          tries += 1;
          setTimeout(load, 1500);
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Unable to load order'));
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (!orderId) {
    return (
      <section className="bf-page mx-auto max-w-xl space-y-4">
        <ErrorMessage message="Missing order reference from PayHere return." />
        <Link to="/orders">
          <Button variant="secondary">Your orders</Button>
        </Link>
      </section>
    );
  }

  if (loading && !order) {
    return <Spinner label="Confirming payment…" />;
  }

  let status = 'pending';
  if (order?.paymentStatus === 'SUCCEEDED' || order?.status === 'PLACED') {
    status = 'success';
  } else if (
    order?.status === 'PAYMENT_FAILED' ||
    order?.paymentStatus === 'FAILED'
  ) {
    status = 'failed';
  } else if (order?.paymentStatus === 'CANCELLED') {
    status = 'cancelled';
  }

  return (
    <section className="bf-page mx-auto max-w-xl space-y-4">
      <ErrorMessage message={error} />
      <PaymentResult status={status} orderId={orderId} />
      {status === 'pending' ? (
        <p className="text-center text-xs text-[var(--bf-muted)]">
          If this stays pending, ensure PayHere can reach your notify URL
          (public tunnel required for local development).
        </p>
      ) : null}
    </section>
  );
}
