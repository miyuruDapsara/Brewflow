const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { authRateLimiter } = require('../../middleware/rateLimit');
const { registerSchema, loginSchema } = require('./auth.validation');
const authController = require('./auth.controller');

const router = express.Router();

router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  asyncHandler(authController.login)
);

router.get('/me', authenticate, asyncHandler(authController.me));

module.exports = router;
