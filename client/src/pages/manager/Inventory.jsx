import { useCallback, useEffect, useState } from 'react';
import InventoryForm from '../../components/inventory/InventoryForm';
import InventoryTable from '../../components/inventory/InventoryTable';
import LowStockList from '../../components/inventory/LowStockList';
import ErrorMessage from '../../components/common/ErrorMessage';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { UI_DEMO_INVENTORY } from '../../data/uiDemoData';
import {
  adjustInventory,
  createInventoryItem,
  listInventory,
  listLowStock,
} from '../../services/inventory';
import { isUiDemoEnabled } from '../../utils/uiDemo';
import { getErrorMessage } from '../../utils/errorHandler';

function withLowStockFlags(items) {
  return items.map((item) => ({
    ...item,
    isLowStock: Number(item.currentQuantity) <= Number(item.reorderLevel),
  }));
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [adjustingId, setAdjustingId] = useState('');
  const demoMode = isUiDemoEnabled();

  const applyLocalItems = useCallback((next) => {
    const flagged = withLowStockFlags(next);
    setItems(flagged);
    setLowStock(flagged.filter((i) => i.isLowStock));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    if (demoMode) {
      applyLocalItems(UI_DEMO_INVENTORY.map((i) => ({ ...i })));
      setLoading(false);
      return;
    }

    try {
      const [all, low] = await Promise.all([
        listInventory(),
        listLowStock(),
      ]);
      setItems(all.items || []);
      setLowStock(low.items || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load inventory'));
    } finally {
      setLoading(false);
    }
  }, [applyLocalItems, demoMode]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(payload) {
    setCreating(true);
    setError('');

    if (demoMode) {
      const created = {
        id: `demo-inv-${Date.now()}`,
        name: payload.name,
        unit: payload.unit,
        currentQuantity: Number(payload.currentQuantity) || 0,
        reorderLevel: Number(payload.reorderLevel) || 0,
        isActive: true,
      };
      applyLocalItems([created, ...items]);
      setCreating(false);
      return;
    }

    try {
      await createInventoryItem(payload);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to create item'));
      throw err;
    } finally {
      setCreating(false);
    }
  }

  async function handleAdjust(id, payload) {
    setAdjustingId(id);
    setError('');

    if (demoMode) {
      applyLocalItems(
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                currentQuantity:
                  Number(item.currentQuantity) + Number(payload.delta || 0),
              }
            : item
        )
      );
      setAdjustingId('');
      return;
    }

    try {
      await adjustInventory(id, payload);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to adjust stock'));
    } finally {
      setAdjustingId('');
    }
  }

  return (
    <section className="bf-page space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="bf-display text-3xl font-bold tracking-tight text-[var(--bf-ink)]">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-[var(--bf-muted)]">
            {demoMode
              ? 'UI demo stock — create/adjust stay in the browser only.'
              : 'Manage ingredients for RECIPE_BASED products. Stock deducts when payment succeeds.'}
          </p>
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Spinner label="Loading inventory…" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <InventoryForm onSubmit={handleCreate} submitting={creating} />
            <div className="bf-glass space-y-3 rounded-2xl p-4">
              <h2 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
                Low stock
              </h2>
              <LowStockList items={lowStock} />
            </div>
          </div>
          <InventoryTable
            items={items}
            onAdjust={handleAdjust}
            adjustingId={adjustingId}
          />
        </div>
      )}
    </section>
  );
}
