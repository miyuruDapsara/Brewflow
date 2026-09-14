const reportService = require('./report.service');
const { sendSuccess } = require('../../utils/response');

async function sales(req, res) {
  const report = await reportService.getSalesReport(req.query);
  return sendSuccess(res, { report });
}

async function products(req, res) {
  const report = await reportService.getProductReport(req.query);
  return sendSuccess(res, { report });
}

async function inventory(req, res) {
  const report = await reportService.getInventoryReport();
  return sendSuccess(res, { report });
}

module.exports = {
  sales,
  products,
  inventory,
};
