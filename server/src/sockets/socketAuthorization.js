const mongoose = require('mongoose');
const Order = require('../modules/orders/order.model');
const { ROLES } = require('../modules/auth/auth.constants');

function isStaffRole(role) {
  return role === ROLES.STAFF || role === ROLES.MANAGER;
}

function orderRoomName(orderId) {
  return `order:${orderId}`;
}

const STAFF_ORDERS_ROOM = 'staff:orders';

async function assertCanJoinOrder(user, orderId) {
  if (!user?.id) {
    throw new Error('Authentication required');
  }
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error('Invalid order id');
  }

  if (isStaffRole(user.role)) {
    return true;
  }

  const order = await Order.findById(orderId).select('customerId');
  if (!order) {
    throw new Error('Order not found');
  }
  if (order.customerId.toString() !== user.id) {
    throw new Error('Forbidden');
  }
  return true;
}

function assertCanJoinStaff(user) {
  if (!user?.id || !isStaffRole(user.role)) {
    throw new Error('Forbidden');
  }
  return true;
}

module.exports = {
  isStaffRole,
  orderRoomName,
  STAFF_ORDERS_ROOM,
  assertCanJoinOrder,
  assertCanJoinStaff,
};
