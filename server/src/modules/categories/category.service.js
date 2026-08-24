const mongoose = require('mongoose');
const Category = require('./category.model');
const Product = require('../products/product.model');
const ApiError = require('../../utils/ApiError');

function toCategory(doc) {
  return doc.toSafeObject();
}

async function listActiveCategories() {
  const categories = await Category.find({ isActive: true }).sort({
    displayOrder: 1,
    name: 1,
  });
  return categories.map(toCategory);
}

async function getCategoryById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.notFound('Category not found');
  }

  const category = await Category.findById(id);
  if (!category || !category.isActive) {
    throw ApiError.notFound('Category not found');
  }

  return toCategory(category);
}

async function getNextDisplayOrder() {
  const last = await Category.findOne().sort({ displayOrder: -1 }).select('displayOrder');
  return last ? last.displayOrder + 1 : 0;
}

async function createCategory(payload) {
  const displayOrder =
    payload.displayOrder !== undefined
      ? payload.displayOrder
      : await getNextDisplayOrder();

  const category = await Category.create({
    name: payload.name,
    categoryType: payload.categoryType,
    description: payload.description || '',
    displayOrder,
    isActive: payload.isActive !== undefined ? payload.isActive : true,
  });

  return toCategory(category);
}

async function updateCategory(id, payload) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.notFound('Category not found');
  }

  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  Object.assign(category, payload);
  await category.save();
  return toCategory(category);
}

async function deleteCategory(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.notFound('Category not found');
  }

  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  const activeProductCount = await Product.countDocuments({
    categoryId: category._id,
    isActive: true,
  });

  if (activeProductCount > 0) {
    throw ApiError.conflict(
      'Category has active products; deactivate it or reassign products first'
    );
  }

  await category.deleteOne();
  return { id: category._id.toString() };
}

module.exports = {
  listActiveCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
