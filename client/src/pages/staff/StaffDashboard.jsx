import { useCallback, useEffect, useMemo, useState } from 'react';
import ActiveOrderQueue from '../../components/staff/ActiveOrderQueue';
import StaffStats from '../../components/staff/StaffStats';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Spinner from '../../components/common/Spinner';
import { UI_DEMO_ORDERS } from '../../data/uiDemoData';
import useOrderSocket from '../../hooks/useOrderSocket';
import {
  listAdminOrders,
  updateOrderStatus,
} from '../../services/order';
import { ACTIVE_ORDER_STATUSES } from '../../utils/constants';
import { isUiDemoEnabled } from '../../utils/uiDemo';
import { getErrorMessage } from '../../utils/errorHandler';

function countByStatus(orders) {
  return ACTIVE_ORDER_STATUSES.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status).length;
    return acc;
  }, {});
}

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [busyStatus, setBusyStatus] = useState('');
  const demoMode = isUiDemoEnabled();

  const loadOrders = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    setError('');

    if (demoMode) {
      setOrders(UI_DEMO_ORDERS.map((o) => ({ ...o })));
      if (!silent) {
        setLoading(false);
      }
      return;
    }

    try {
      const data = await listAdminOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load kitchen orders'));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [demoMode]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onOrderEvent = useCallback((order) => {
    if (!order?.id || demoMode) {
      return;
    }
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === order.id);
      if (idx === -1) {
        return [order, ...prev];
      }
      const next = [...prev];
      next[idx] = order;
      return next;
    });
  }, [demoMode]);

  const onReconnect = useCallback(() => {
    if (!demoMode) {
      loadOrders({ silent: true });
    }
  }, [demoMode, loadOrders]);

  useOrderSocket({
    joinStaff: !demoMode,
    onOrderEvent,
    onReconnect,
  });

  const activeOrders = useMemo(
    () =>
      orders
        .filter((o) => ACTIVE_ORDER_STATUSES.includes(o.status))
        .sort((a, b) => {
          const aTime = new Date(a.createdAt || 0).getTime();
          const bTime = new Date(b.createdAt || 0).getTime();
          return aTime - bTime;
        }),
    [orders]
  );

  const counts = useMemo(() => countByStatus(activeOrders), [activeOrders]);

  async function handleStatusChange(orderId, status) {
    setUpdatingId(orderId);
    setBusyStatus(status);
    setError('');

    if (demoMode) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      setUpdatingId('');
      setBusyStatus('');
      return;
    }

    try {
      const data = await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? data.order : o))
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to update order status'));
    } finally {
      setUpdatingId('');
      setBusyStatus('');
    }
  }

  return (
    <section className="bf-page space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="bf-display text-3xl font-bold tracking-tight text-[var(--bf-ink)]">
            Kitchen queue
          </h1>
          <p className="mt-1 text-sm text-[var(--bf-muted)]">
            {demoMode
              ? 'UI demo orders — status clicks update local state only.'
              : 'Live updates via Socket.IO. Use Refresh if you reconnect.'}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => loadOrders()}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      <ErrorMessage message={error} />
      <StaffStats counts={counts} />

      {loading ? (
        <Spinner label="Loading kitchen orders…" />
      ) : (
        <ActiveOrderQueue
          orders={activeOrders}
          updatingId={updatingId}
          busyStatus={busyStatus}
          onStatusChange={handleStatusChange}
        />
      )}
    </section>
  );
}
