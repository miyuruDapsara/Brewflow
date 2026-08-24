const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const authorize = require('../../middleware/role');
const {
  createOrderSchema,
  updateStatusSchema,
} = require('./order.validation');
const orderController = require('./order.controller');
const { ROLES } = require('../auth/auth.constants');

const router = express.Router();

router.post(
  '/',
  authenticate,
  validate(createOrderSchema),
  asyncHandler(orderController.create)
);

router.get(
  '/my-orders',
  authenticate,
  asyncHandler(orderController.listMine)
);

router.get('/:id', authenticate, asyncHandler(orderController.getById));

router.patch(
  '/:id/cancel',
  authenticate,
  asyncHandler(orderController.cancel)
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(ROLES.STAFF, ROLES.MANAGER),
  validate(updateStatusSchema),
  asyncHandler(orderController.updateStatus)
);

module.exports = router;
