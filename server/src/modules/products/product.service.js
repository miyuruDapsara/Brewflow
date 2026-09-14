const mongoose = require('mongoose');
const Product = require('./product.model');
const Category = require('../categories/category.model');
const InventoryItem = require('../inventory/inventoryItem.model');
const { INVENTORY_MODES } = require('./product.constants');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const { AUDIT_ACTIONS, ENTITY_TYPES } = require('../audit/audit.constants');

async function toProduct(doc) {
  const safe = doc.toSafeObject();
  safe.isCurrentlyAvailable = await Product.hasFulfillableStock(doc);
  return safe;
}

async function assertCategoryExists(categoryId) {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw ApiError.badRequest('Invalid categoryId');
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw ApiError.badRequest('categoryId must reference an existing category');
  }

  return category;
}

function normalizeInventoryFields(payload) {
  const data = { ...payload };

  if (data.inventoryMode === INVENTORY_MODES.STOCK_BASED) {
    data.recipeItems = [];
  }

  if (data.inventoryMode === INVENTORY_MODES.RECIPE_BASED) {
    data.stockQuantity = 0;
  }

  return data;
}

async function assertRecipeInventoryItems(recipeItems = []) {
  if (!recipeItems.length) {
    return;
  }
  const ids = [
    ...new Set(recipeItems.map((r) => String(r.inventoryItemId))),
  ];
  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid inventoryItemId in recipeItems');
    }
  }
  const found = await InventoryItem.find({ _id: { $in: ids } });
  if (found.length !== ids.length) {
    throw ApiError.badRequest(
      'recipeItems.inventoryItemId must reference existing inventory items'
    );
  }
}

async function listActiveProducts({ categoryId } = {}) {
  const filter = { isActive: true };

  if (categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw ApiError.badRequest('Invalid categoryId');
    }
    filter.categoryId = categoryId;
  }

  const products = await Product.find(filter).sort({ name: 1 });
  return Promise.all(products.map((p) => toProduct(p)));
}

async function getProductById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.notFound('Product not found');
  }

  const product = await Product.findById(id);
  if (!product || !product.isActive) {
    throw ApiError.notFound('Product not found');
  }

  return toProduct(product);
}

async function createProduct(payload, actorId) {
  await assertCategoryExists(payload.categoryId);
  const data = normalizeInventoryFields(payload);
  if (data.inventoryMode === INVENTORY_MODES.RECIPE_BASED) {
    await assertRecipeInventoryItems(data.recipeItems);
  }
  const product = await Product.create(data);
  const safe = toProduct(product);
  if (actorId) {
    auditService.writeLogSafe({
      actorId,
      action: AUDIT_ACTIONS.PRODUCT_CREATED,
      entityType: ENTITY_TYPES.PRODUCT,
      entityId: safe.id,
      details: { name: safe.name, basePrice: safe.basePrice },
    });
  }
  return safe;
}

async function updateProduct(id, payload, actorId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.notFound('Product not found');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const previousPrice = product.basePrice;

  if (payload.categoryId) {
    await assertCategoryExists(payload.categoryId);
  }

  const nextMode = payload.inventoryMode || product.inventoryMode;
  const merged = {
    inventoryMode: nextMode,
    stockQuantity:
      payload.stockQuantity !== undefined
        ? payload.stockQuantity
        : product.stockQuantity,
    recipeItems:
      payload.recipeItems !== undefined
        ? payload.recipeItems
        : product.recipeItems,
  };

  if (nextMode === INVENTORY_MODES.STOCK_BASED) {
    if (merged.stockQuantity === undefined || merged.stockQuantity === null) {
      throw ApiError.badRequest(
        'stockQuantity is required when inventoryMode is STOCK_BASED'
      );
    }
  }

  if (nextMode === INVENTORY_MODES.RECIPE_BASED) {
    if (!merged.recipeItems || merged.recipeItems.length === 0) {
      throw ApiError.badRequest(
        'recipeItems are required when inventoryMode is RECIPE_BASED'
      );
    }
  }

  const data = normalizeInventoryFields({
    ...payload,
    inventoryMode: nextMode,
    stockQuantity: merged.stockQuantity,
    recipeItems: merged.recipeItems,
  });

  if (nextMode === INVENTORY_MODES.RECIPE_BASED) {
    await assertRecipeInventoryItems(data.recipeItems);
  }

  Object.assign(product, data);
  await product.save();
  const safe = toProduct(product);
  if (actorId) {
    const details = { name: safe.name };
    if (
      payload.basePrice !== undefined &&
      Number(payload.basePrice) !== Number(previousPrice)
    ) {
      details.previousPrice = previousPrice;
      details.basePrice = safe.basePrice;
      details.priceChanged = true;
    }
    auditService.writeLogSafe({
      actorId,
      action: AUDIT_ACTIONS.PRODUCT_UPDATED,
      entityType: ENTITY_TYPES.PRODUCT,
      entityId: safe.id,
      details,
    });
  }
  return safe;
}

async function deleteProduct(id, actorId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.notFound('Product not found');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const name = product.name;
  await product.deleteOne();
  if (actorId) {
    auditService.writeLogSafe({
      actorId,
      action: AUDIT_ACTIONS.PRODUCT_DELETED,
      entityType: ENTITY_TYPES.PRODUCT,
      entityId: product._id.toString(),
      details: { name },
    });
  }
  return { id: product._id.toString() };
}

function isProductAvailable(product) {
  return Product.isProductAvailable(product);
}

module.exports = {
  listActiveProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  isProductAvailable,
  assertCategoryExists,
};
