const paymentService = require('./payment.service');
const { sendSuccess } = require('../../utils/response');

async function createCheckoutSession(req, res) {
  const session = await paymentService.createCheckoutSession(
    req.body.orderId,
    req.user.id
  );
  return sendSuccess(res, { session });
}

async function notify(req, res) {
  const result = await paymentService.handleNotify(req.body);
  // PayHere expects a simple 200 OK response.
  return res.status(200).send('OK');
}

module.exports = {
  createCheckoutSession,
  notify,
};
