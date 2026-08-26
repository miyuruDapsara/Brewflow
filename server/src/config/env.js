const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  taxRate: Number(process.env.TAX_RATE ?? 0.08),
  payhereMerchantId: process.env.PAYHERE_MERCHANT_ID || '',
  payhereMerchantSecret: process.env.PAYHERE_MERCHANT_SECRET || '',
  payhereCurrency: process.env.PAYHERE_CURRENCY || 'LKR',
  payhereCheckoutUrl:
    process.env.PAYHERE_CHECKOUT_URL ||
    'https://sandbox.payhere.lk/pay/checkout',
  payhereNotifyUrl: process.env.PAYHERE_NOTIFY_URL || '',
  payhereReturnUrl:
    process.env.PAYHERE_RETURN_URL || 'http://localhost:5173/checkout/return',
  payhereCancelUrl:
    process.env.PAYHERE_CANCEL_URL || 'http://localhost:5173/checkout/cancel',
};

function assertServerEnv() {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is required');
  }
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }
}

module.exports = {
  env,
  assertServerEnv,
};
