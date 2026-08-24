const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const authenticate = require('../../middleware/auth');
const authorize = require('../../middleware/role');
const orderController = require('./order.controller');
const { ROLES } = require('../auth/auth.constants');

const router = express.Router();

router.get(
  '/',
  authenticate,
  authorize(ROLES.STAFF, ROLES.MANAGER),
  asyncHandler(orderController.listAdmin)
);

module.exports = router;
