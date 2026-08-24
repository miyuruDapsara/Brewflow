const STATUS_STYLES = {
  PLACED: 'bg-sky-50 text-sky-800',
  PREPARING: 'bg-amber-50 text-amber-900',
  READY: 'bg-emerald-50 text-emerald-800',
  COMPLETED: 'bg-stone-100 text-stone-600',
  CANCELLED: 'bg-red-50 text-red-800',
  PENDING_PAYMENT: 'bg-yellow-50 text-yellow-900',
  PAYMENT_FAILED: 'bg-red-50 text-red-800',
};

export default function OrderStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-stone-100 text-stone-600';

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {status}
    </span>
  );
}
