import Button from '../common/Button';
import { STAFF_STATUS_TRANSITIONS } from '../../utils/constants';

const LABELS = {
  PREPARING: 'Start preparing',
  READY: 'Mark ready',
  COMPLETED: 'Complete',
  CANCELLED: 'Cancel',
};

export default function OrderStatusControls({
  status,
  disabled = false,
  busyStatus = '',
  onStatusChange,
}) {
  const next = STAFF_STATUS_TRANSITIONS[status] || [];

  if (!next.length) {
    return (
      <p className="text-xs text-[var(--bf-muted)]">No further actions</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {next.map((target) => {
        const isCancel = target === 'CANCELLED';
        return (
          <Button
            key={target}
            variant={isCancel ? 'secondary' : 'primary'}
            disabled={disabled}
            onClick={() => onStatusChange?.(target)}
          >
            {busyStatus === target ? 'Updating…' : LABELS[target] || target}
          </Button>
        );
      })}
    </div>
  );
}
