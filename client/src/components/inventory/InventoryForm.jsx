import { useState } from 'react';
import Button from '../common/Button';

const emptyForm = {
  name: '',
  unit: 'g',
  currentQuantity: 0,
  reorderLevel: 0,
};

export default function InventoryForm({ onSubmit, submitting = false }) {
  const [form, setForm] = useState(emptyForm);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit?.({
      name: form.name.trim(),
      unit: form.unit.trim(),
      currentQuantity: Number(form.currentQuantity) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
    });
    setForm(emptyForm);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bf-glass space-y-3 rounded-2xl p-4"
    >
      <h2 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
        Add ingredient
      </h2>
      <label className="block text-sm">
        <span className="text-[var(--bf-muted)]">Name</span>
        <input
          className="mt-1 w-full rounded-xl border border-[var(--bf-border)] bg-white px-3 py-2"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          required
          minLength={2}
        />
      </label>
      <div className="grid grid-cols-3 gap-2">
        <label className="block text-sm">
          <span className="text-[var(--bf-muted)]">Unit</span>
          <input
            className="mt-1 w-full rounded-xl border border-[var(--bf-border)] bg-white px-3 py-2"
            value={form.unit}
            onChange={(e) => update('unit', e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--bf-muted)]">Qty</span>
          <input
            type="number"
            min="0"
            className="mt-1 w-full rounded-xl border border-[var(--bf-border)] bg-white px-3 py-2"
            value={form.currentQuantity}
            onChange={(e) => update('currentQuantity', e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--bf-muted)]">Reorder</span>
          <input
            type="number"
            min="0"
            className="mt-1 w-full rounded-xl border border-[var(--bf-border)] bg-white px-3 py-2"
            value={form.reorderLevel}
            onChange={(e) => update('reorderLevel', e.target.value)}
          />
        </label>
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : 'Create item'}
      </Button>
    </form>
  );
}
