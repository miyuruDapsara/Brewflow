const Joi = require('joi');

const listAuditQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  action: Joi.string().trim().max(80),
  entityType: Joi.string().trim().max(40),
  entityId: Joi.string().trim().max(40),
}).unknown(false);

module.exports = {
  listAuditQuerySchema,
};
