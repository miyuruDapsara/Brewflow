const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const authorize = require('../../middleware/role');
const {
  createProductSchema,
  updateProductSchema,
} = require('./product.validation');
const productController = require('./product.controller');
const { ROLES } = require('../auth/auth.constants');

const router = express.Router();

router.get('/', asyncHandler(productController.list));
router.get('/:id', asyncHandler(productController.getById));

router.post(
  '/',
  authenticate,
  authorize(ROLES.MANAGER),
  validate(createProductSchema),
  asyncHandler(productController.create)
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.MANAGER),
  validate(updateProductSchema),
  asyncHandler(productController.update)
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.MANAGER),
  asyncHandler(productController.remove)
);

module.exports = router;
