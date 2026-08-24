const Joi = require('joi');
const { ORDER_TYPE_VALUES, ORDER_STATUS_VALUES } = require('./order.constants');

const objectId = Joi.string().hex().length(24);

const selectedModifierSchema = Joi.object({
  groupId: objectId.required(),
  optionId: objectId.required(),
  groupName: Joi.string().trim().allow(''),
  optionName: Joi.string().trim().allow(''),
  priceAdjustment: Joi.number().integer(),
}).unknown(false);

const orderItemSchema = Joi.object({
  productId: objectId.required(),
  quantity: Joi.number().integer().min(1).max(10).required(),
  selectedModifiers: Joi.array().items(selectedModifierSchema).default([]),
  notes: Joi.string().trim().max(200).allow('').default(''),
}).unknown(false);

const createOrderSchema = Joi.object({
  orderType: Joi.string()
    .valid(...ORDER_TYPE_VALUES)
    .required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
}).unknown(false);

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...ORDER_STATUS_VALUES)
    .required(),
}).unknown(false);

module.exports = {
  createOrderSchema,
  updateStatusSchema,
};
