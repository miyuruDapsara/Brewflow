const categoryService = require('./category.service');
const { sendSuccess } = require('../../utils/response');

async function list(req, res) {
  const categories = await categoryService.listActiveCategories();
  return sendSuccess(res, { categories });
}

async function getById(req, res) {
  const category = await categoryService.getCategoryById(req.params.id);
  return sendSuccess(res, { category });
}

async function create(req, res) {
  const category = await categoryService.createCategory(req.body);
  return sendSuccess(res, { category }, 201);
}

async function update(req, res) {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  return sendSuccess(res, { category });
}

async function remove(req, res) {
  const result = await categoryService.deleteCategory(req.params.id);
  return sendSuccess(res, result);
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
