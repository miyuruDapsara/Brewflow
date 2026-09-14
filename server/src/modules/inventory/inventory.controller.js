const inventoryService = require('./inventory.service');
const { sendSuccess } = require('../../utils/response');

async function list(req, res) {
  const items = await inventoryService.listItems();
  return sendSuccess(res, { items });
}

async function listLowStock(req, res) {
  const items = await inventoryService.listLowStock();
  return sendSuccess(res, { items });
}

async function getById(req, res) {
  const item = await inventoryService.getById(req.params.id);
  return sendSuccess(res, { item });
}

async function create(req, res) {
  const item = await inventoryService.createItem(req.body);
  return sendSuccess(res, { item }, 201);
}

async function update(req, res) {
  const item = await inventoryService.updateItem(req.params.id, req.body);
  return sendSuccess(res, { item });
}

async function adjust(req, res) {
  const result = await inventoryService.adjustStock(
    req.params.id,
    req.body,
    req.user.id
  );
  return sendSuccess(res, result);
}

module.exports = {
  list,
  listLowStock,
  getById,
  create,
  update,
  adjust,
};
