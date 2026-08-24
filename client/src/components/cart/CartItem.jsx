import { computeLineTotal } from '../../utils/cartPricing';
import { CART_MAX_QUANTITY } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatCurrency';
import Button from '../common/Button';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const lineTotal = computeLineTotal(
    item.basePrice,
    item.selectedModifiers,
    item.quantity
  );

  return (
    <div className="rounded-lg border border-stone-200 bg-white/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-amber-950">{item.name}</h3>
          {item.selectedModifiers?.length ? (
            <ul className="mt-1 space-y-0.5 text-xs text-stone-500">
              {item.selectedModifiers.map((mod) => (
                <li key={`${mod.groupId}-${mod.optionId}`}>
                  {mod.groupName}: {mod.optionName}
                  {mod.priceAdjustment
                    ? ` (+${formatCurrency(mod.priceAdjustment)})`
                    : ''}
                </li>
              ))}
            </ul>
          ) : null}
          {item.notes ? (
            <p className="mt-1 text-xs italic text-stone-500">
              Note: {item.notes}
            </p>
          ) : null}
        </div>
        <p className="shrink-0 font-medium text-stone-900">
          {formatCurrency(lineTotal)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-stone-700">
          Qty
          <input
            type="number"
            min={1}
            max={CART_MAX_QUANTITY}
            value={item.quantity}
            onChange={(event) =>
              onUpdateQuantity?.(item.lineId, Number(event.target.value))
            }
            className="w-16 rounded-md border border-stone-300 px-2 py-1"
            aria-label={`Quantity for ${item.name}`}
          />
        </label>
        <Button
          variant="ghost"
          className="!px-2 !py-1 text-xs"
          onClick={() => onRemove?.(item.lineId)}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
