const ApiError = require('../../utils/ApiError');
const Product = require('../products/product.model');

/**
 * Validate and price order line items from DB products.
 * Client prices are ignored — only productId, quantity, selectedModifiers, notes are used.
 *
 * @param {Array} products - mongoose product docs
 * @param {Array} inputItems - { productId, quantity, selectedModifiers?, notes? }
 * @param {number} taxRate
 */
function calculateOrderPricing(products, inputItems, taxRate) {
  const productsById = new Map(
    products.map((product) => [product._id.toString(), product])
  );

  const pricedItems = [];

  for (const input of inputItems) {
    const productId = String(input.productId);
    const product = productsById.get(productId);

    if (!product || !product.isActive) {
      throw ApiError.badRequest(`Product not found or inactive: ${productId}`);
    }

    if (!Product.isProductAvailable(product)) {
      throw ApiError.badRequest(`Product is unavailable: ${product.name}`);
    }

    const quantity = Math.floor(Number(input.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 10) {
      throw ApiError.badRequest('Quantity must be an integer between 1 and 10');
    }

    const selectedModifiers = resolveModifiers(
      product,
      input.selectedModifiers || []
    );

    const unitPrice =
      product.basePrice +
      selectedModifiers.reduce(
        (sum, mod) => sum + (Number(mod.priceAdjustment) || 0),
        0
      );
    const lineTotal = unitPrice * quantity;

    pricedItems.push({
      productId: product._id,
      name: product.name,
      productType: product.productType,
      basePrice: product.basePrice,
      quantity,
      selectedModifiers,
      notes: String(input.notes || '').slice(0, 200),
      unitPrice,
      lineTotal,
    });
  }

  const subtotal = pricedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const rate = Number.isFinite(taxRate) ? taxRate : 0;
  const tax = Math.round(subtotal * rate);
  const discount = 0;
  const total = subtotal + tax - discount;

  return {
    items: pricedItems,
    subtotal,
    tax,
    discount,
    total,
  };
}

/**
 * Resolve selected modifiers against product groups using DB prices only.
 * Client may send { groupId, optionId } (and optional display fields which are ignored for price).
 */
function resolveModifiers(product, selectedInput = []) {
  const groups = product.modifierGroups || [];
  const groupsById = new Map(
    groups.map((group) => [group._id.toString(), group])
  );

  const selectionByGroup = {};

  for (const raw of selectedInput) {
    const groupId = String(raw.groupId || '');
    const optionId = String(raw.optionId || '');
    if (!groupId || !optionId) {
      throw ApiError.badRequest('Each modifier selection needs groupId and optionId');
    }

    const group = groupsById.get(groupId);
    if (!group) {
      throw ApiError.badRequest(`Invalid modifier group for ${product.name}`);
    }

    const option = (group.options || []).find(
      (opt) => opt._id.toString() === optionId
    );
    if (!option) {
      throw ApiError.badRequest(`Invalid modifier option for ${group.name}`);
    }

    if (!selectionByGroup[groupId]) {
      selectionByGroup[groupId] = [];
    }
    if (!selectionByGroup[groupId].includes(optionId)) {
      selectionByGroup[groupId].push(optionId);
    }
  }

  for (const group of groups) {
    const groupId = group._id.toString();
    const selected = selectionByGroup[groupId] || [];
    const minSelections =
      typeof group.minSelections === 'number' ? group.minSelections : 1;

    if (group.isRequired && selected.length < minSelections) {
      throw ApiError.badRequest(
        `Select at least ${minSelections} option(s) for ${group.name}`
      );
    }

    if (group.selectionType === 'SINGLE' && selected.length > 1) {
      throw ApiError.badRequest(`Select only one option for ${group.name}`);
    }
  }

  const resolved = [];
  for (const [groupId, optionIds] of Object.entries(selectionByGroup)) {
    const group = groupsById.get(groupId);
    for (const optionId of optionIds) {
      const option = group.options.find((opt) => opt._id.toString() === optionId);
      resolved.push({
        groupId,
        groupName: group.name,
        optionId,
        optionName: option.name,
        priceAdjustment: option.priceAdjustment || 0,
      });
    }
  }

  return resolved;
}

function generateOrderNumber(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BF-${y}${m}${d}-${suffix}`;
}

module.exports = {
  calculateOrderPricing,
  resolveModifiers,
  generateOrderNumber,
};
