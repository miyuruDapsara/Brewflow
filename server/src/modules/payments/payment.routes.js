const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { checkoutSessionSchema } = require('./payment.validation');
const paymentController = require('./payment.controller');

const router = express.Router();

router.post(
  '/checkout-session',
  authenticate,
  validate(checkoutSessionSchema),
  asyncHandler(paymentController.createCheckoutSession)
);

router.post(
  '/notify',
  express.urlencoded({ extended: false }),
  asyncHandler(paymentController.notify)
);

module.exports = router;
