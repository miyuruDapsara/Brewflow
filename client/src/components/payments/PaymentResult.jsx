import { Link } from 'react-router-dom';
import Button from '../common/Button';

export default function PaymentResult({ status, orderId, message }) {
  if (status === 'success') {
    return (
      <div className="bf-glass-strong space-y-4 rounded-2xl p-6 text-center">
        <h2 className="bf-display text-2xl font-bold text-[var(--bf-ink)]">
          Payment successful
        </h2>
        <p className="text-sm text-[var(--bf-muted)]">
          {message || 'Your order is placed and waiting for the kitchen.'}
        </p>
        {orderId ? (
          <Link to={`/orders/${orderId}`}>
            <Button>View order</Button>
          </Link>
        ) : null}
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="bf-glass-strong space-y-4 rounded-2xl p-6 text-center">
        <h2 className="bf-display text-2xl font-bold text-[var(--bf-ink)]">
          Confirming payment
        </h2>
        <p className="text-sm text-[var(--bf-muted)]">
          {message ||
            'Waiting for PayHere to confirm. This page will update when notify completes.'}
        </p>
        {orderId ? (
          <Link to={`/orders/${orderId}`}>
            <Button variant="secondary">View order status</Button>
          </Link>
        ) : null}
      </div>
    );
  }

  if (status === 'failed' || status === 'cancelled') {
    return (
      <div className="bf-glass-strong space-y-4 rounded-2xl p-6 text-center">
        <h2 className="bf-display text-2xl font-bold text-[var(--bf-ink)]">
          {status === 'cancelled' ? 'Payment cancelled' : 'Payment failed'}
        </h2>
        <p className="text-sm text-[var(--bf-muted)]">
          {message || 'You can try again from checkout.'}
        </p>
        <Link to="/checkout">
          <Button>Back to checkout</Button>
        </Link>
      </div>
    );
  }

  return null;
}
