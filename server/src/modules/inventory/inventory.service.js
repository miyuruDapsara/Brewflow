const mongoose = require('mongoose');
const InventoryItem = require('./inventoryItem.model');
const InventoryTransaction = require('./inventoryTransaction.model');
const Product = require('../products/product.model');
const ApiError = require('../../utils/ApiError');
const { TRANSACTION_TYPES } = require('./inventory.constants');
const auditService = require('../audit/audit.service');
const { AUDIT_ACTIONS, ENTITY_TYPES } = require('../audit/audit.constants');
const { INVENTORY_MODES } = require('../products/product.constants');
const logger = require('../../utils/logger');

function assertObjectId(id, label = 'id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest(`Invalid ${label}`);
  }
}

function toItem(doc) {
  return doc.toSafeObject();
}

async function listItems() {
  const items = await InventoryItem.find().sort({ name: 1 });
  return items.map(toItem);
}

async function listLowStock() {
  const items = await InventoryItem.find({ isActive: true });
  return items
    .filter((item) => item.currentQuantity <= item.reorderLevel)
    .map(toItem);
}

async function getById(id) {
  assertObjectId(id);
  const item = await InventoryItem.findById(id);
  if (!item) {
    throw ApiError.notFound('Inventory item not found');
  }
  return toItem(item);
}

async function createItem(payload) {
  const item = await InventoryItem.create({
    name: payload.name,
    unit: payload.unit,
    currentQuantity: payload.currentQuantity ?? 0,
    reorderLevel: payload.reorderLevel ?? 0,
    isActive: payload.isActive !== false,
  });
  return toItem(item);
}

async function updateItem(id, payload) {
  assertObjectId(id);
  const item = await InventoryItem.findById(id);
  if (!item) {
    throw ApiError.notFound('Inventory item not found');
  }

  if (payload.name !== undefined) item.name = payload.name;
  if (payload.unit !== undefined) item.unit = payload.unit;
  if (payload.reorderLevel !== undefined) {
    item.reorderLevel = payload.reorderLevel;
  }
  if (payload.isActive !== undefined) item.isActive = payload.isActive;

  await item.save();
  return toItem(item);
}

async function adjustStock(id, { type, quantityChange, notes }, actorId) {
  assertObjectId(id);
  const item = await InventoryItem.findById(id);
  if (!item) {
    throw ApiError.notFound('Inventory item not found');
  }

  let change = Number(quantityChange);
  if (type === TRANSACTION_TYPES.RESTOCK) {
    change = Math.abs(change);
  }

  const next = item.currentQuantity + change;
  if (next < 0) {
    throw ApiError.badRequest('Adjustment would make quantity negative');
  }

  item.currentQuantity = next;
  await item.save();

  const tx = await InventoryTransaction.create({
    type,
    quantityChange: change,
    quantityAfter: next,
    inventoryItemId: item._id,
    notes: notes || '',
    createdBy: actorId || null,
  });

  if (actorId) {
    try {
      await auditService.writeLog({
        actorId,
        action: AUDIT_ACTIONS.INVENTORY_ADJUSTED,
        entityType: ENTITY_TYPES.INVENTORY_ITEM,
        entityId: item._id.toString(),
        details: {
          name: item.name,
          type,
          quantityChange: change,
          quantityAfter: next,
          notes: notes || '',
        },
      });
    } catch (err) {
      logger.error('Audit write failed:', err.message);
    }
  }

  return {
    item: toItem(item),
    transaction: tx.toSafeObject(),
  };
}

async function logProductTransaction({
  type,
  productId,
  quantityChange,
  quantityAfter,
  orderId,
  notes,
}) {
  await InventoryTransaction.create({
    type,
    quantityChange,
    quantityAfter,
    productId,
    orderId: orderId || null,
    notes: notes || '',
  });
}

async function logIngredientTransaction({
  type,
  inventoryItemId,
  quantityChange,
  quantityAfter,
  orderId,
  notes,
}) {
  await InventoryTransaction.create({
    type,
    quantityChange,
    quantityAfter,
    inventoryItemId,
    orderId: orderId || null,
    notes: notes || '',
  });
}

/**
 * Deduct inventory for a paid order. Idempotent via order.inventoryDeducted.
 * On insufficient stock: leaves inventoryDeducted false; does not un-pay.
 */
async function deductForOrder(orderDoc) {
  if (!orderDoc) {
    return { deducted: false, reason: 'missing_order' };
  }
  if (orderDoc.inventoryDeducted) {
    return { deducted: false, reason: 'already_deducted' };
  }

  const lineItems = orderDoc.items || [];
  const productIds = [
    ...new Set(lineItems.map((i) => i.productId.toString())),
  ];
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const stockDeltas = [];
  const ingredientDeltas = new Map();

  for (const line of lineItems) {
    const product = productMap.get(line.productId.toString());
    if (!product) {
      throw ApiError.badRequest(
        `Product missing for inventory deduction: ${line.name}`
      );
    }

    if (product.inventoryMode === INVENTORY_MODES.STOCK_BASED) {
      stockDeltas.push({
        product,
        qty: line.quantity,
      });
    } else if (product.inventoryMode === INVENTORY_MODES.RECIPE_BASED) {
      for (const recipe of product.recipeItems || []) {
        const key = recipe.inventoryItemId.toString();
        const need = recipe.quantityRequired * line.quantity;
        ingredientDeltas.set(key, (ingredientDeltas.get(key) || 0) + need);
      }
    }
  }

  for (const { product, qty } of stockDeltas) {
    if (product.stockQuantity < qty) {
      throw ApiError.badRequest(
        `Insufficient stock for product ${product.name}`
      );
    }
  }

  const ingredientIds = [...ingredientDeltas.keys()];
  const ingredients = await InventoryItem.find({
    _id: { $in: ingredientIds },
  });
  const ingredientMap = new Map(
    ingredients.map((i) => [i._id.toString(), i])
  );

  for (const [id, need] of ingredientDeltas) {
    const item = ingredientMap.get(id);
    if (!item) {
      throw ApiError.badRequest(`Missing inventory item ${id}`);
    }
    if (item.currentQuantity < need) {
      throw ApiError.badRequest(
        `Insufficient ingredient stock for ${item.name}`
      );
    }
  }

  for (const { product, qty } of stockDeltas) {
    product.stockQuantity -= qty;
    await product.save();
    await logProductTransaction({
      type: TRANSACTION_TYPES.SALE_DEDUCTION,
      productId: product._id,
      quantityChange: -qty,
      quantityAfter: product.stockQuantity,
      orderId: orderDoc._id,
      notes: `Sale deduction for order ${orderDoc.orderNumber}`,
    });
  }

  for (const [id, need] of ingredientDeltas) {
    const item = ingredientMap.get(id);
    item.currentQuantity -= need;
    await item.save();
    await logIngredientTransaction({
      type: TRANSACTION_TYPES.SALE_DEDUCTION,
      inventoryItemId: item._id,
      quantityChange: -need,
      quantityAfter: item.currentQuantity,
      orderId: orderDoc._id,
      notes: `Sale deduction for order ${orderDoc.orderNumber}`,
    });
  }

  orderDoc.inventoryDeducted = true;
  await orderDoc.save();

  return { deducted: true };
}

async function restoreForOrder(orderDoc) {
  if (!orderDoc || !orderDoc.inventoryDeducted) {
    return { restored: false, reason: 'not_deducted' };
  }

  const lineItems = orderDoc.items || [];
  const productIds = [
    ...new Set(lineItems.map((i) => i.productId.toString())),
  ];
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const ingredientDeltas = new Map();

  for (const line of lineItems) {
    const product = productMap.get(line.productId.toString());
    if (!product) {
      continue;
    }

    if (product.inventoryMode === INVENTORY_MODES.STOCK_BASED) {
      product.stockQuantity += line.quantity;
      await product.save();
      await logProductTransaction({
        type: TRANSACTION_TYPES.CORRECTION,
        productId: product._id,
        quantityChange: line.quantity,
        quantityAfter: product.stockQuantity,
        orderId: orderDoc._id,
        notes: `Restore for cancelled order ${orderDoc.orderNumber}`,
      });
    } else if (product.inventoryMode === INVENTORY_MODES.RECIPE_BASED) {
      for (const recipe of product.recipeItems || []) {
        const key = recipe.inventoryItemId.toString();
        const need = recipe.quantityRequired * line.quantity;
        ingredientDeltas.set(key, (ingredientDeltas.get(key) || 0) + need);
      }
    }
  }

  const ingredientIds = [...ingredientDeltas.keys()];
  const ingredients = await InventoryItem.find({
    _id: { $in: ingredientIds },
  });
  const ingredientMap = new Map(
    ingredients.map((i) => [i._id.toString(), i])
  );

  for (const [id, need] of ingredientDeltas) {
    const item = ingredientMap.get(id);
    if (!item) {
      continue;
    }
    item.currentQuantity += need;
    await item.save();
    await logIngredientTransaction({
      type: TRANSACTION_TYPES.CORRECTION,
      inventoryItemId: item._id,
      quantityChange: need,
      quantityAfter: item.currentQuantity,
      orderId: orderDoc._id,
      notes: `Restore for cancelled order ${orderDoc.orderNumber}`,
    });
  }

  orderDoc.inventoryDeducted = false;
  await orderDoc.save();

  return { restored: true };
}

module.exports = {
  listItems,
  listLowStock,
  getById,
  createItem,
  updateItem,
  adjustStock,
  deductForOrder,
  restoreForOrder,
};
