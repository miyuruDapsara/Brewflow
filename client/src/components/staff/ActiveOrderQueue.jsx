import EmptyState from '../common/EmptyState';
import StaffOrderCard from './StaffOrderCard';

export default function ActiveOrderQueue({
  orders = [],
  updatingId = '',
  busyStatus = '',
  onStatusChange,
}) {
  if (!orders.length) {
    return (
      <EmptyState
        title="No active orders"
        description="Paid orders in PLACED, PREPARING, or READY will show up here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <StaffOrderCard
          key={order.id}
          order={order}
          updating={updatingId === order.id}
          busyStatus={updatingId === order.id ? busyStatus : ''}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
