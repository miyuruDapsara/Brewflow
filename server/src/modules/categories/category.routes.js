const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const authorize = require('../../middleware/role');
const {
  createCategorySchema,
  updateCategorySchema,
} = require('./category.validation');
const categoryController = require('./category.controller');
const { ROLES } = require('../auth/auth.constants');

const router = express.Router();

router.get('/', asyncHandler(categoryController.list));
router.get('/:id', asyncHandler(categoryController.getById));

router.post(
  '/',
  authenticate,
  authorize(ROLES.MANAGER),
  validate(createCategorySchema),
  asyncHandler(categoryController.create)
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.MANAGER),
  validate(updateCategorySchema),
  asyncHandler(categoryController.update)
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.MANAGER),
  asyncHandler(categoryController.remove)
);

module.exports = router;
