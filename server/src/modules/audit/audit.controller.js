const auditService = require('./audit.service');
const { sendSuccess } = require('../../utils/response');

async function list(req, res) {
  const result = await auditService.listLogs(req.query);
  return sendSuccess(res, result);
}

module.exports = {
  list,
};
