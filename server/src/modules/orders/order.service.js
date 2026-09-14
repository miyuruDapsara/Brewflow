const mongoose = require('mongoose');
const Order = require('./order.model');
const Product = require('../products/product.model');
const ApiError = require('../../utils/ApiError');
const { env } = require('../../config/env');
const {
  calculateOrderPricing,
  generateOrderNumber,
} = require('./order.calculator');
const {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  STATUS_TRANSITIONS,
} = require('./order.constants');
const { ROLES } = require('../auth/auth.constants');
const {
  emitOrderUpdated,
  emitOrderReady,
  emitOrderCancelled,
} = require('../../sockets/orderEvents');
const inventoryService = require('../inventory/inventory.service');
const auditService = require('../audit/audit.service');
const { AUDIT_ACTIONS, ENTITY_TYPES } = require('../audit/audit.constants');

function toOrder(doc) {
  return doc.toSafeObject();
}

function assertObjectId(id, label = 'id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest(`Invalid ${label}`);
  }
}

async function createOrder(customerId, payload) {
  assertObjectId(customerId, 'customerId');

  const productIds = [
    ...new Set(payload.items.map((item) => String(item.productId))),
  ];
  const products = await Product.find({
    _id: { $in: productIds },
  });

  if (products.length !== productIds.length) {
    throw ApiError.badRequest('One or more products were not found');
  }

  for (const product of products) {
    const ok = await Product.hasFulfillableStock(product);
    if (!ok) {
      throw ApiError.badRequest(
        `Product is unavailable or out of ingredients: ${product.name}`
      );
    }
  }

  const priced = calculateOrderPricing(products, payload.items, env.taxRate);

  let order;
  let attempts = 0;
  while (attempts < 5) {
    attempts += 1;
    try {
      order = await Order.create({
        customerId,
        orderNumber: generateOrderNumber(),
        orderType: payload.orderType,
        status: ORDER_STATUSES.PENDING_PAYMENT,
        paymentStatus: PAYMENT_STATUSES.PENDING,
        subtotal: priced.subtotal,
        tax: priced.tax,
        discount: priced.discount,
        total: priced.total,
        items: priced.items,
      });
      break;
    } catch (err) {
      if (err.code === 11000 && attempts < 5) {
        continue;
      }
      throw err;
    }
  }

  if (!order) {
    throw ApiError.internal('Unable to create order');
  }

  return toOrder(order);
}

async function listMyOrders(customerId) {
  assertObjectId(customerId, 'customerId');
  const orders = await Order.find({ customerId })
    .sort({ createdAt: -1 })
    .limit(50);
  return orders.map(toOrder);
}

async function getOrderById(orderId, actor) {
  assertObjectId(orderId, 'orderId');
  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  const isOwner = order.customerId.toString() === actor.id;
  const isStaff =
    actor.role === ROLES.STAFF || actor.role === ROLES.MANAGER;

  if (!isOwner && !isStaff) {
    throw ApiError.forbidden('You cannot access this order');
  }

  return toOrder(order);
}

async function cancelOrder(orderId, customerId) {
  assertObjectId(orderId, 'orderId');
  assertObjectId(customerId, 'customerId');

  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.customerId.toString() !== customerId) {
    throw ApiError.forbidden('You cannot cancel this order');
  }

  if (order.status !== ORDER_STATUSES.PLACED) {
    throw ApiError.conflict('Only PLACED orders can be cancelled by the customer');
  }

  order.status = ORDER_STATUSES.CANCELLED;
  await order.save();
  try {
    await inventoryService.restoreForOrder(order);
  } catch (err) {
    console.error('Inventory restore failed on cancel:', err.message);
  }
  const safe = toOrder(order);
  emitOrderCancelled(safe);
  return safe;
}

async function updateOrderStatus(orderId, nextStatus, actorId) {
  assertObjectId(orderId, 'orderId');

  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  const allowed = STATUS_TRANSITIONS[order.status] || [];
  if (!allowed.includes(nextStatus)) {
    throw ApiError.badRequest(
      `Invalid status transition from ${order.status} to ${nextStatus}`
    );
  }

  order.status = nextStatus;
  await order.save();

  if (nextStatus === ORDER_STATUSES.CANCELLED) {
    try {
      await inventoryService.restoreForOrder(order);
    } catch (err) {
      console.error('Inventory restore failed on status cancel:', err.message);
    }
    if (actorId) {
      auditService.writeLogSafe({
        actorId,
        action: AUDIT_ACTIONS.ORDER_CANCELLED_BY_STAFF,
        entityType: ENTITY_TYPES.ORDER,
        entityId: order._id.toString(),
        details: { orderNumber: order.orderNumber },
      });
    }
  }

  const safe = toOrder(order);

  if (nextStatus === ORDER_STATUSES.CANCELLED) {
    emitOrderCancelled(safe);
  } else if (nextStatus === ORDER_STATUSES.READY) {
    emitOrderUpdated(safe);
    emitOrderReady(safe);
  } else {
    emitOrderUpdated(safe);
  }

  return safe;
}

async function listAdminOrders() {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
  return orders.map(toOrder);
}

module.exports = {
  createOrder,
  listMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  listAdminOrders,
};
