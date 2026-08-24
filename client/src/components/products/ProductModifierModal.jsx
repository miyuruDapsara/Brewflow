import { useEffect, useMemo, useState } from 'react';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import { CART_MAX_QUANTITY } from '../../utils/constants';
import {
  buildSelectedModifiers,
  clampQuantity,
  computeLineTotal,
  computeUnitPrice,
  validateModifierSelection,
} from '../../utils/cartPricing';
import { formatCurrency } from '../../utils/formatCurrency';

function emptySelection(groups = []) {
  const map = {};
  for (const group of groups) {
    map[group.id] = [];
  }
  return map;
}

export default function ProductModifierModal({
  open,
  product,
  onClose,
  onAdd,
}) {
  const groups = product?.modifierGroups || [];
  const [selectionByGroup, setSelectionByGroup] = useState(() =>
    emptySelection(groups)
  );
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (open && product) {
      setSelectionByGroup(emptySelection(product.modifierGroups || []));
      setQuantity(1);
      setNotes('');
      setErrors({});
      setSubmitError('');
    }
  }, [open, product]);

  const selectedModifiers = useMemo(
    () => buildSelectedModifiers(groups, selectionByGroup),
    [groups, selectionByGroup]
  );

  const unitPrice = computeUnitPrice(product?.basePrice, selectedModifiers);
  const lineTotal = computeLineTotal(
    product?.basePrice,
    selectedModifiers,
    quantity
  );

  function toggleOption(group, optionId) {
    setSelectionByGroup((prev) => {
      const current = prev[group.id] || [];
      let next;

      if (group.selectionType === 'SINGLE') {
        next = current.includes(optionId) ? [] : [optionId];
      } else if (current.includes(optionId)) {
        next = current.filter((id) => id !== optionId);
      } else {
        next = [...current, optionId];
      }

      return { ...prev, [group.id]: next };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[group.id];
      return next;
    });
  }

  function handleSubmit() {
    const result = validateModifierSelection(groups, selectionByGroup);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    try {
      onAdd?.({
        product,
        selectedModifiers,
        quantity: clampQuantity(quantity),
        notes,
      });
      onClose?.();
    } catch (err) {
      setSubmitError(err.message || 'Unable to add to cart');
    }
  }

  if (!product) {
    return null;
  }

  return (
    <Modal
      open={open}
      title={`Customize ${product.name}`}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-[var(--bf-ink)]">
            {formatCurrency(lineTotal)}
            <span className="ml-2 font-normal text-[var(--bf-muted)]">
              ({formatCurrency(unitPrice)} each)
            </span>
          </p>
          <Button onClick={handleSubmit}>Add to cart</Button>
        </div>
      }
    >
      <div className="space-y-5">
        {groups.map((group) => (
          <fieldset key={group.id} className="space-y-2">
            <legend className="text-sm font-semibold text-[var(--bf-ink)]">
              {group.name}
              {group.isRequired ? (
                <span className="ml-2 text-xs font-normal text-[var(--bf-accent)]">
                  Required
                </span>
              ) : (
                <span className="ml-2 text-xs font-normal text-[var(--bf-muted)]">
                  Optional
                </span>
              )}
            </legend>
            <div className="space-y-2">
              {(group.options || []).map((option) => {
                const checked = (selectionByGroup[group.id] || []).includes(
                  option.id
                );
                const inputType =
                  group.selectionType === 'SINGLE' ? 'radio' : 'checkbox';

                return (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[var(--bf-border)] bg-[var(--bf-cream)]/50 px-3 py-2 text-sm transition hover:border-[var(--bf-accent)]/40 hover:bg-[var(--bf-accent-soft)]"
                  >
                    <span className="flex items-center gap-2 text-[var(--bf-ink)]">
                      <input
                        type={inputType}
                        name={`group-${group.id}`}
                        checked={checked}
                        onChange={() => toggleOption(group, option.id)}
                      />
                      {option.name}
                    </span>
                    <span className="text-[var(--bf-muted)]">
                      {option.priceAdjustment
                        ? `+${formatCurrency(option.priceAdjustment)}`
                        : 'Included'}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors[group.id] ? (
              <p className="text-xs text-red-700">{errors[group.id]}</p>
            ) : null}
          </fieldset>
        ))}

        <label className="block text-sm" htmlFor="modifier-qty">
          <span className="font-medium text-[var(--bf-muted)]">Quantity</span>
          <input
            id="modifier-qty"
            type="number"
            min={1}
            max={CART_MAX_QUANTITY}
            value={quantity}
            onChange={(event) =>
              setQuantity(clampQuantity(event.target.value))
            }
            className="mt-1 w-24 rounded-lg border border-[var(--bf-border)] bg-white px-3 py-2 text-[var(--bf-ink)] outline-none focus:border-[var(--bf-accent)] focus:ring-2 focus:ring-[var(--bf-accent)]/25"
          />
        </label>

        <label className="block text-sm" htmlFor="modifier-notes">
          <span className="font-medium text-[var(--bf-muted)]">
            Notes (optional)
          </span>
          <textarea
            id="modifier-notes"
            rows={2}
            maxLength={200}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--bf-border)] bg-white px-3 py-2 text-[var(--bf-ink)] outline-none focus:border-[var(--bf-accent)] focus:ring-2 focus:ring-[var(--bf-accent)]/25"
            placeholder="e.g. extra hot"
          />
        </label>

        <ErrorMessage message={submitError} />
      </div>
    </Modal>
  );
}
