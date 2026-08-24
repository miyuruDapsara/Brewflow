import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import OrderStatusBadge from './OrderStatusBadge';

export default function OrderCard({ order }) {
  return (
    <Link
      to={`/orders/${order.id}`}
      className="bf-card block p-4 transition duration-300 hover:border-[var(--bf-accent)]/25"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="bf-display font-bold text-[var(--bf-ink)]">
            {order.orderNumber}
          </p>
          <p className="text-xs text-[var(--bf-muted)]">{order.orderType}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-3 flex justify-between text-sm text-[var(--bf-muted)]">
        <span>{order.items?.length || 0} item(s)</span>
        <span className="font-medium text-[var(--bf-accent)]">
          {formatCurrency(order.total)}
        </span>
      </div>
    </Link>
  );
}
