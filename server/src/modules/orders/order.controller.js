const orderService = require('./order.service');
const { sendSuccess } = require('../../utils/response');

async function create(req, res) {
  const order = await orderService.createOrder(req.user.id, req.body);
  return sendSuccess(res, { order }, 201);
}

async function listMine(req, res) {
  const orders = await orderService.listMyOrders(req.user.id);
  return sendSuccess(res, { orders });
}

async function getById(req, res) {
  const order = await orderService.getOrderById(req.params.id, req.user);
  return sendSuccess(res, { order });
}

async function cancel(req, res) {
  const order = await orderService.cancelOrder(req.params.id, req.user.id);
  return sendSuccess(res, { order });
}

async function updateStatus(req, res) {
  const order = await orderService.updateOrderStatus(
    req.params.id,
    req.body.status
  );
  return sendSuccess(res, { order });
}

async function listAdmin(req, res) {
  const orders = await orderService.listAdminOrders();
  return sendSuccess(res, { orders });
}

module.exports = {
  create,
  listMine,
  getById,
  cancel,
  updateStatus,
  listAdmin,
};
