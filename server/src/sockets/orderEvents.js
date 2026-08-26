const {
  orderRoomName,
  STAFF_ORDERS_ROOM,
} = require('./socketAuthorization');

let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function getIO() {
  return ioInstance;
}

function emitToOrderAndStaff(eventName, order) {
  const io = getIO();
  if (!io || !order?.id) {
    return;
  }
  const payload = { order };
  io.to(orderRoomName(order.id)).emit(eventName, payload);
  io.to(STAFF_ORDERS_ROOM).emit(eventName, payload);
}

function emitOrderCreated(order) {
  emitToOrderAndStaff('order:created', order);
}

function emitOrderUpdated(order) {
  emitToOrderAndStaff('order:updated', order);
}

function emitOrderReady(order) {
  emitToOrderAndStaff('order:ready', order);
}

function emitOrderCancelled(order) {
  emitToOrderAndStaff('order:cancelled', order);
}

module.exports = {
  setIO,
  getIO,
  emitOrderCreated,
  emitOrderUpdated,
  emitOrderReady,
  emitOrderCancelled,
};
