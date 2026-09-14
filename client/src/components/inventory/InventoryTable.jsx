import { useState } from 'react';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import StockBadge from './StockBadge';

export default function InventoryTable({
  items = [],
  onAdjust,
  adjustingId = '',
}) {
  const [drafts, setDrafts] = useState({});

  if (!items.length) {
    return (
      <EmptyState
        title="No inventory items"
        description="Add ingredients to track RECIPE_BASED products."
      />
    );
  }

  function draftFor(id) {
    return drafts[id] || { type: 'RESTOCK', quantityChange: 10, notes: '' };
  }

  function setDraft(id, patch) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...draftFor(id), ...patch },
    }));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const draft = draftFor(item.id);
        const busy = adjustingId === item.id;
        return (
          <article
            key={item.id}
            className="bf-glass space-y-3 rounded-2xl p-4"
          >
            <header className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-[var(--bf-ink)]">
                  {item.name}
                </h3>
                <p className="text-xs text-[var(--bf-muted)]">
                  Unit: {item.unit} · Reorder at {item.reorderLevel}
                </p>
              </div>
              <StockBadge
                quantity={item.currentQuantity}
                reorderLevel={item.reorderLevel}
              />
            </header>

            <div className="flex flex-wrap items-end gap-2">
              <label className="text-xs text-[var(--bf-muted)]">
                Type
                <select
                  className="mt-1 block rounded-lg border border-[var(--bf-border)] bg-white px-2 py-1.5 text-sm"
                  value={draft.type}
                  onChange={(e) => setDraft(item.id, { type: e.target.value })}
                >
                  <option value="RESTOCK">RESTOCK</option>
                  <option value="MANUAL_ADJUSTMENT">MANUAL_ADJUSTMENT</option>
                  <option value="CORRECTION">CORRECTION</option>
                </select>
              </label>
              <label className="text-xs text-[var(--bf-muted)]">
                Change
                <input
                  type="number"
                  className="mt-1 block w-24 rounded-lg border border-[var(--bf-border)] bg-white px-2 py-1.5 text-sm"
                  value={draft.quantityChange}
                  onChange={(e) =>
                    setDraft(item.id, {
                      quantityChange: Number(e.target.value),
                    })
                  }
                />
              </label>
              <Button
                disabled={busy}
                onClick={() =>
                  onAdjust?.(item.id, {
                    type: draft.type,
                    quantityChange: Number(draft.quantityChange),
                    notes: draft.notes || '',
                  })
                }
              >
                {busy ? 'Updating…' : 'Adjust'}
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
