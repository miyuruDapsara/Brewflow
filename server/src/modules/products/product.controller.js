const productService = require('./product.service');
const { sendSuccess } = require('../../utils/response');

async function list(req, res) {
  const products = await productService.listActiveProducts({
    categoryId: req.query.categoryId,
  });
  return sendSuccess(res, { products });
}

async function getById(req, res) {
  const product = await productService.getProductById(req.params.id);
  return sendSuccess(res, { product });
}

async function create(req, res) {
  const product = await productService.createProduct(req.body);
  return sendSuccess(res, { product }, 201);
}

async function update(req, res) {
  const product = await productService.updateProduct(req.params.id, req.body);
  return sendSuccess(res, { product });
}

async function remove(req, res) {
  const result = await productService.deleteProduct(req.params.id);
  return sendSuccess(res, result);
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
