const mongoose = require('mongoose');
const Order = require('../orders/order.model');
const User = require('../auth/user.model');
const WebhookEvent = require('../webhooks/webhookEvent.model');
const ApiError = require('../../utils/ApiError');
const { env } = require('../../config/env');
const {
  formatPayHereAmount,
  buildCheckoutHash,
  buildNotifySignature,
} = require('./payhere.hash');
const {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} = require('../orders/order.constants');
const { emitOrderCreated } = require('../../sockets/orderEvents');

function assertObjectId(id, label = 'id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest(`Invalid ${label}`);
  }
}

function requirePayHereConfig() {
  if (!env.payhereMerchantId || !env.payhereMerchantSecret) {
    throw ApiError.internal(
      'PayHere is not configured (PAYHERE_MERCHANT_ID / PAYHERE_MERCHANT_SECRET)'
    );
  }
  if (!env.payhereNotifyUrl) {
    throw ApiError.internal('PAYHERE_NOTIFY_URL is required');
  }
}

function splitName(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: 'Customer', lastName: 'BrewFlow' };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: 'Customer' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

async function createCheckoutSession(orderId, customerId) {
  requirePayHereConfig();
  assertObjectId(orderId, 'orderId');
  assertObjectId(customerId, 'customerId');

  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }
  if (order.customerId.toString() !== customerId) {
    throw ApiError.forbidden('You cannot pay for this order');
  }
  if (order.status !== ORDER_STATUSES.PENDING_PAYMENT) {
    throw ApiError.conflict('Order is not awaiting payment');
  }
  if (order.paymentStatus === PAYMENT_STATUSES.SUCCEEDED) {
    throw ApiError.conflict('Order is already paid');
  }

  const user = await User.findById(customerId);
  if (!user) {
    throw ApiError.notFound('Customer not found');
  }

  const amount = formatPayHereAmount(order.total);
  const currency = env.payhereCurrency;
  const payhereOrderId = order.orderNumber;
  const hash = buildCheckoutHash({
    merchantId: env.payhereMerchantId,
    orderId: payhereOrderId,
    amount,
    currency,
    merchantSecret: env.payhereMerchantSecret,
  });

  const { firstName, lastName } = splitName(user.name);
  const itemSummary = (order.items || [])
    .map((item) => `${item.name} x${item.quantity}`)
    .join(', ')
    .slice(0, 200);

  const returnUrl = `${env.payhereReturnUrl}${
    env.payhereReturnUrl.includes('?') ? '&' : '?'
  }orderId=${order._id.toString()}`;
  const cancelUrl = `${env.payhereCancelUrl}${
    env.payhereCancelUrl.includes('?') ? '&' : '?'
  }orderId=${order._id.toString()}`;

  return {
    checkoutUrl: env.payhereCheckoutUrl,
    merchant_id: env.payhereMerchantId,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: env.payhereNotifyUrl,
    order_id: payhereOrderId,
    items: itemSummary || 'BrewFlow order',
    amount,
    currency,
    first_name: firstName,
    last_name: lastName,
    email: user.email,
    phone: '0000000000',
    address: 'N/A',
    city: 'Colombo',
    country: 'Sri Lanka',
    hash,
    brewflowOrderId: order._id.toString(),
  };
}

async function recordNotifyEvent(providerEventId, eventType) {
  try {
    await WebhookEvent.create({
      provider: 'payhere',
      providerEventId,
      eventType,
      status: 'PROCESSED',
    });
    return true;
  } catch (err) {
    if (err.code === 11000) {
      return false;
    }
    throw err;
  }
}

async function handleNotify(payload) {
  requirePayHereConfig();

  const merchantId = payload.merchant_id;
  const orderId = payload.order_id;
  const payhereAmount = payload.payhere_amount;
  const payhereCurrency = payload.payhere_currency;
  const statusCode = String(payload.status_code);
  const md5sig = payload.md5sig;
  const paymentId = payload.payment_id || '';

  if (!merchantId || !orderId || !payhereAmount || !payhereCurrency || !md5sig) {
    throw ApiError.badRequest('Incomplete PayHere notify payload');
  }

  if (merchantId !== env.payhereMerchantId) {
    throw ApiError.badRequest('Invalid merchant_id');
  }

  const expected = buildNotifySignature({
    merchantId,
    orderId,
    payhereAmount,
    payhereCurrency,
    statusCode,
    merchantSecret: env.payhereMerchantSecret,
  });

  if (expected !== String(md5sig).toUpperCase()) {
    throw ApiError.badRequest('Invalid PayHere md5sig');
  }

  const providerEventId =
    paymentId || `${orderId}:${statusCode}:${md5sig}`.slice(0, 200);
  const isNew = await recordNotifyEvent(
    providerEventId,
    `payhere.status.${statusCode}`
  );
  if (!isNew) {
    return { duplicate: true, orderNumber: orderId };
  }

  const order = await Order.findOne({ orderNumber: orderId });
  if (!order) {
    throw ApiError.notFound('Order not found for PayHere notify');
  }

  const expectedAmount = formatPayHereAmount(order.total);
  if (String(payhereAmount) !== expectedAmount) {
    throw ApiError.badRequest('PayHere amount does not match order total');
  }
  if (String(payhereCurrency) !== env.payhereCurrency) {
    throw ApiError.badRequest('PayHere currency mismatch');
  }

  if (statusCode === '2') {
    order.status = ORDER_STATUSES.PLACED;
    order.paymentStatus = PAYMENT_STATUSES.SUCCEEDED;
    order.payherePaymentId = paymentId || order.payherePaymentId || null;
    await order.save();
    // Inventory deduction deferred to Phase 13.
    emitOrderCreated(order.toSafeObject());
    return { duplicate: false, status: order.status, paymentStatus: order.paymentStatus };
  }

  if (statusCode === '0') {
    return { duplicate: false, status: order.status, paymentStatus: order.paymentStatus };
  }

  order.status = ORDER_STATUSES.PAYMENT_FAILED;
  order.paymentStatus =
    statusCode === '-1'
      ? PAYMENT_STATUSES.CANCELLED
      : PAYMENT_STATUSES.FAILED;
  order.payherePaymentId = paymentId || order.payherePaymentId || null;
  await order.save();

  return { duplicate: false, status: order.status, paymentStatus: order.paymentStatus };
}

module.exports = {
  createCheckoutSession,
  handleNotify,
  formatPayHereAmount,
  buildCheckoutHash,
  buildNotifySignature,
};
