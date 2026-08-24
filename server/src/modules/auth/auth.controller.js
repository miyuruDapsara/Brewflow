const authService = require('./auth.service');
const { sendSuccess } = require('../../utils/response');

async function register(req, res) {
  const result = await authService.register(req.body);
  return sendSuccess(res, result, 201);
}

async function login(req, res) {
  const result = await authService.login(req.body);
  return sendSuccess(res, result, 200);
}

async function me(req, res) {
  const user = await authService.getMe(req.user.id);
  return sendSuccess(res, { user }, 200);
}

module.exports = {
  register,
  login,
  me,
};
