const Joi = require('joi');
const { CATEGORY_TYPE_VALUES } = require('./category.constants');

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  categoryType: Joi.string()
    .valid(...CATEGORY_TYPE_VALUES)
    .required(),
  description: Joi.string().trim().allow('').max(500),
  displayOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  categoryType: Joi.string().valid(...CATEGORY_TYPE_VALUES),
  description: Joi.string().trim().allow('').max(500),
  displayOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
}).min(1);

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
