import { CART_MAX_QUANTITY, CART_NOTES_MAX_LENGTH } from './constants';

function optionIdsKey(selectedModifiers = []) {
  return selectedModifiers
    .map((mod) => mod.optionId)
    .filter(Boolean)
    .slice()
    .sort()
    .join('|');
}

export function sameModifierSelection(a = [], b = []) {
  return optionIdsKey(a) === optionIdsKey(b);
}

export function computeUnitPrice(basePrice, selectedModifiers = []) {
  const base = Number(basePrice) || 0;
  const adjustments = selectedModifiers.reduce(
    (sum, mod) => sum + (Number(mod.priceAdjustment) || 0),
    0
  );
  return base + adjustments;
}

export function computeLineTotal(basePrice, selectedModifiers, quantity) {
  const qty = Math.max(0, Number(quantity) || 0);
  return computeUnitPrice(basePrice, selectedModifiers) * qty;
}

export function computeSubtotal(items = []) {
  return items.reduce(
    (sum, item) =>
      sum +
      computeLineTotal(item.basePrice, item.selectedModifiers, item.quantity),
    0
  );
}

export function clampQuantity(quantity) {
  const qty = Math.floor(Number(quantity) || 0);
  if (qty < 1) {
    return 1;
  }
  if (qty > CART_MAX_QUANTITY) {
    return CART_MAX_QUANTITY;
  }
  return qty;
}

export function sanitizeNotes(notes = '') {
  return String(notes || '').slice(0, CART_NOTES_MAX_LENGTH);
}

/**
 * Validates selected option IDs against product modifier groups.
 * @param {Array} groups - product.modifierGroups
 * @param {Record<string, string[]>} selectionByGroup - groupId -> optionId[]
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateModifierSelection(groups = [], selectionByGroup = {}) {
  const errors = {};

  for (const group of groups) {
    const selected = selectionByGroup[group.id] || [];
    const minSelections =
      typeof group.minSelections === 'number' ? group.minSelections : 1;

    if (group.isRequired && selected.length < minSelections) {
      errors[group.id] = `Select at least ${minSelections} option${
        minSelections === 1 ? '' : 's'
      } for ${group.name}`;
      continue;
    }

    if (group.selectionType === 'SINGLE' && selected.length > 1) {
      errors[group.id] = `Select only one option for ${group.name}`;
      continue;
    }

    const validOptionIds = new Set(
      (group.options || []).map((option) => option.id)
    );
    const hasInvalid = selected.some((id) => !validOptionIds.has(id));
    if (hasInvalid) {
      errors[group.id] = `Invalid option for ${group.name}`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Flatten group selection map into selectedModifiers array using group metadata.
 */
export function buildSelectedModifiers(groups = [], selectionByGroup = {}) {
  const selected = [];

  for (const group of groups) {
    const optionIds = selectionByGroup[group.id] || [];
    for (const optionId of optionIds) {
      const option = (group.options || []).find((o) => o.id === optionId);
      if (!option) {
        continue;
      }
      selected.push({
        groupId: group.id,
        groupName: group.name,
        optionId: option.id,
        optionName: option.name,
        priceAdjustment: option.priceAdjustment || 0,
      });
    }
  }

  return selected;
}

export function createLineId() {
  return `line_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
