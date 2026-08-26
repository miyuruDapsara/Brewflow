const Joi = require('joi');

const checkoutSessionSchema = Joi.object({
  orderId: Joi.string().hex().length(24).required(),
});

module.exports = {
  checkoutSessionSchema,
};
