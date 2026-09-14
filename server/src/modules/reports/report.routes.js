const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const authorize = require('../../middleware/role');
const { ROLES } = require('../auth/auth.constants');
const reportController = require('./report.controller');
const {
  salesQuerySchema,
  rangeQuerySchema,
} = require('./report.validation');

const router = express.Router();

router.use(authenticate, authorize(ROLES.MANAGER));

router.get(
  '/sales',
  validate(salesQuerySchema, 'query'),
  asyncHandler(reportController.sales)
);

router.get(
  '/products',
  validate(rangeQuerySchema, 'query'),
  asyncHandler(reportController.products)
);

router.get('/inventory', asyncHandler(reportController.inventory));

module.exports = router;
