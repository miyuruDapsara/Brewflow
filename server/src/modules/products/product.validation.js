const Joi = require('joi');
const {
  PRODUCT_TYPE_VALUES,
  INVENTORY_MODE_VALUES,
  SELECTION_TYPE_VALUES,
  INVENTORY_MODES,
} = require('./product.constants');

const objectId = Joi.string().hex().length(24);

const modifierOptionSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  priceAdjustment: Joi.number().integer().required(),
});

const modifierGroupSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  isRequired: Joi.boolean().default(false),
  minSelections: Joi.number().integer().min(0).default(0),
  selectionType: Joi.string()
    .valid(...SELECTION_TYPE_VALUES)
    .default('SINGLE'),
  options: Joi.array().items(modifierOptionSchema).default([]),
});

const recipeItemSchema = Joi.object({
  inventoryItemId: objectId.required(),
  quantityRequired: Joi.number().positive().required(),
  unit: Joi.string().trim().min(1).required(),
});

const createProductSchema = Joi.object({
  categoryId: objectId.required(),
  name: Joi.string().trim().min(2).max(100).required(),
  productType: Joi.string()
    .valid(...PRODUCT_TYPE_VALUES)
    .required(),
  basePrice: Joi.number().integer().positive().required(),
  imageUrl: Joi.string().trim().uri().allow(''),
  inventoryMode: Joi.string()
    .valid(...INVENTORY_MODE_VALUES)
    .required(),
  stockQuantity: Joi.number().integer().min(0),
  recipeItems: Joi.array().items(recipeItemSchema),
  isAvailable: Joi.boolean(),
  isActive: Joi.boolean(),
  modifierGroups: Joi.array().items(modifierGroupSchema).default([]),
})
  .custom((value, helpers) => {
    if (value.inventoryMode === INVENTORY_MODES.STOCK_BASED) {
      if (value.stockQuantity === undefined || value.stockQuantity === null) {
        return helpers.error('any.custom', {
          message: 'stockQuantity is required for STOCK_BASED products',
        });
      }
    }

    if (value.inventoryMode === INVENTORY_MODES.RECIPE_BASED) {
      if (!value.recipeItems || value.recipeItems.length === 0) {
        return helpers.error('any.custom', {
          message: 'recipeItems are required for RECIPE_BASED products',
        });
      }
    }

    return value;
  })
  .messages({
    'any.custom': '{{#message}}',
  });

const updateProductSchema = Joi.object({
  categoryId: objectId,
  name: Joi.string().trim().min(2).max(100),
  productType: Joi.string().valid(...PRODUCT_TYPE_VALUES),
  basePrice: Joi.number().integer().positive(),
  imageUrl: Joi.string().trim().uri().allow(''),
  inventoryMode: Joi.string().valid(...INVENTORY_MODE_VALUES),
  stockQuantity: Joi.number().integer().min(0),
  recipeItems: Joi.array().items(recipeItemSchema),
  isAvailable: Joi.boolean(),
  isActive: Joi.boolean(),
  modifierGroups: Joi.array().items(modifierGroupSchema),
})
  .min(1)
  .custom((value, helpers) => {
    if (value.inventoryMode === INVENTORY_MODES.STOCK_BASED) {
      if (value.stockQuantity === undefined || value.stockQuantity === null) {
        return helpers.error('any.custom', {
          message: 'stockQuantity is required when inventoryMode is STOCK_BASED',
        });
      }
    }

    if (value.inventoryMode === INVENTORY_MODES.RECIPE_BASED) {
      if (!value.recipeItems || value.recipeItems.length === 0) {
        return helpers.error('any.custom', {
          message: 'recipeItems are required when inventoryMode is RECIPE_BASED',
        });
      }
    }

    return value;
  })
  .messages({
    'any.custom': '{{#message}}',
  });

module.exports = {
  createProductSchema,
  updateProductSchema,
};
