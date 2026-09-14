const mongoose = require('mongoose');
const Category = require('./category.model');
const Product = require('../products/product.model');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const { AUDIT_ACTIONS, ENTITY_TYPES } = require('../audit/audit.constants');

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

async function createCategory(payload, actorId) {
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

  const safe = toCategory(category);
  if (actorId) {
    try {
      await auditService.writeLog({
        actorId,
        action: AUDIT_ACTIONS.CATEGORY_CREATED,
        entityType: ENTITY_TYPES.CATEGORY,
        entityId: safe.id,
        details: { name: safe.name },
      });
    } catch {
      /* never fail mutation */
    }
  }
  return safe;
}

async function updateCategory(id, payload, actorId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.notFound('Category not found');
  }

  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  Object.assign(category, payload);
  await category.save();
  const safe = toCategory(category);
  if (actorId) {
    auditService.writeLogSafe({
      actorId,
      action: AUDIT_ACTIONS.CATEGORY_UPDATED,
      entityType: ENTITY_TYPES.CATEGORY,
      entityId: safe.id,
      details: { name: safe.name },
    });
  }
  return safe;
}

async function deleteCategory(id, actorId) {
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

  const name = category.name;
  await category.deleteOne();
  if (actorId) {
    auditService.writeLogSafe({
      actorId,
      action: AUDIT_ACTIONS.CATEGORY_DELETED,
      entityType: ENTITY_TYPES.CATEGORY,
      entityId: category._id.toString(),
      details: { name },
    });
  }
  return { id: category._id.toString() };
}

module.exports = {
  listActiveCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
