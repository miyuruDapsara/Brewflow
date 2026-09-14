const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const authorize = require('../../middleware/role');
const { ROLES } = require('../auth/auth.constants');
const auditController = require('./audit.controller');
const { listAuditQuerySchema } = require('./audit.validation');

const router = express.Router();

router.use(authenticate, authorize(ROLES.MANAGER));

router.get(
  '/',
  validate(listAuditQuerySchema, 'query'),
  asyncHandler(auditController.list)
);

module.exports = router;
