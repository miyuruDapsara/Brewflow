const mongoose = require('mongoose');
const Product = require('./product.model');
const Category = require('../categories/category.model');
const { INVENTORY_MODES } = require('./product.constants');
const ApiError = require('../../utils/ApiError');

function toProduct(doc) {
  const safe = doc.toSafeObject();
  safe.isCurrentlyAvailable = Product.isProductAvailable(doc);
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

async function listActiveProducts({ categoryId } = {}) {
  const filter = { isActive: true };

  if (categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw ApiError.badRequest('Invalid categoryId');
    }
    filter.categoryId = categoryId;
  }

  const products = await Product.find(filter).sort({ name: 1 });
  return products.map(toProduct);
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

async function createProduct(payload) {
  await assertCategoryExists(payload.categoryId);
  const data = normalizeInventoryFields(payload);
  const product = await Product.create(data);
  return toProduct(product);
}

async function updateProduct(id, payload) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.notFound('Product not found');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

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

  Object.assign(product, data);
  await product.save();
  return toProduct(product);
}

async function deleteProduct(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.notFound('Product not found');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  await product.deleteOne();
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
