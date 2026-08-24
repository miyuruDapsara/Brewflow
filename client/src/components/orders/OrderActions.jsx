import Button from '../common/Button';

export default function OrderActions({ order, onCancel, cancelling = false }) {
  if (!order || order.status !== 'PLACED') {
    return null;
  }

  return (
    <Button
      variant="secondary"
      disabled={cancelling}
      onClick={() => onCancel?.(order.id)}
    >
      {cancelling ? 'Cancelling...' : 'Cancel order'}
    </Button>
  );
}
