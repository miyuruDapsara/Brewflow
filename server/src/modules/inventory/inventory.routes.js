const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const authorize = require('../../middleware/role');
const { ROLES } = require('../auth/auth.constants');
const inventoryController = require('./inventory.controller');
const {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  adjustInventorySchema,
  idParamSchema,
} = require('./inventory.validation');

const router = express.Router();

router.use(authenticate, authorize(ROLES.MANAGER));

router.get('/', asyncHandler(inventoryController.list));
router.get('/low-stock', asyncHandler(inventoryController.listLowStock));
router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(inventoryController.getById)
);
router.post(
  '/',
  validate(createInventoryItemSchema),
  asyncHandler(inventoryController.create)
);
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateInventoryItemSchema),
  asyncHandler(inventoryController.update)
);
router.post(
  '/:id/adjust',
  validate(idParamSchema, 'params'),
  validate(adjustInventorySchema),
  asyncHandler(inventoryController.adjust)
);

module.exports = router;
