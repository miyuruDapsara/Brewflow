import OrderItemList from '../orders/OrderItemList';
import OrderStatusBadge from '../orders/OrderStatusBadge';
import OrderStatusControls from './OrderStatusControls';
import { formatCurrency } from '../../utils/formatCurrency';

export default function StaffOrderCard({
  order,
  updating = false,
  busyStatus = '',
  onStatusChange,
}) {
  if (!order) {
    return null;
  }

  return (
    <article className="bf-glass space-y-4 rounded-2xl p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
            {order.orderNumber}
          </h3>
          <p className="mt-1 text-sm text-[var(--bf-muted)]">
            {order.orderType} · {formatCurrency(order.total)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <OrderItemList items={order.items} />

      <OrderStatusControls
        status={order.status}
        disabled={updating}
        busyStatus={busyStatus}
        onStatusChange={(status) => onStatusChange?.(order.id, status)}
      />
    </article>
  );
}
