const Joi = require('joi');

const salesQuerySchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  groupBy: Joi.string().valid('day', 'week').default('day'),
});

const rangeQuerySchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
});

module.exports = {
  salesQuerySchema,
  rangeQuerySchema,
};
