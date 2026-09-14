const Joi = require('joi');
const { ADJUST_TYPES } = require('./inventory.constants');

const objectId = Joi.string().hex().length(24);

const createInventoryItemSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  unit: Joi.string().trim().min(1).max(40).required(),
  currentQuantity: Joi.number().min(0).default(0),
  reorderLevel: Joi.number().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

const updateInventoryItemSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  unit: Joi.string().trim().min(1).max(40),
  reorderLevel: Joi.number().min(0),
  isActive: Joi.boolean(),
}).min(1);

const adjustInventorySchema = Joi.object({
  type: Joi.string()
    .valid(...ADJUST_TYPES)
    .required(),
  quantityChange: Joi.number().integer().not(0).required(),
  notes: Joi.string().allow('').max(500).default(''),
});

const idParamSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  adjustInventorySchema,
  idParamSchema,
};
