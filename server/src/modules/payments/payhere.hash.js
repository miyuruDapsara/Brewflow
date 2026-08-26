const crypto = require('crypto');

function md5Upper(value) {
  return crypto.createHash('md5').update(String(value), 'utf8').digest('hex').toUpperCase();
}

/** Format integer minor units (cents) as PayHere amount string. */
function formatPayHereAmount(minorUnits) {
  const n = Number(minorUnits);
  if (!Number.isFinite(n) || n < 0) {
    return '0.00';
  }
  return (n / 100).toFixed(2);
}

/**
 * Checkout hash:
 * upper(md5(merchant_id + order_id + amount + currency + upper(md5(merchant_secret))))
 */
function buildCheckoutHash({
  merchantId,
  orderId,
  amount,
  currency,
  merchantSecret,
}) {
  const secretHash = md5Upper(merchantSecret);
  return md5Upper(`${merchantId}${orderId}${amount}${currency}${secretHash}`);
}

/**
 * Notify md5sig:
 * upper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + upper(md5(merchant_secret))))
 */
function buildNotifySignature({
  merchantId,
  orderId,
  payhereAmount,
  payhereCurrency,
  statusCode,
  merchantSecret,
}) {
  const secretHash = md5Upper(merchantSecret);
  return md5Upper(
    `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${secretHash}`
  );
}

module.exports = {
  md5Upper,
  formatPayHereAmount,
  buildCheckoutHash,
  buildNotifySignature,
};
