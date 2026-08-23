const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI || '',
};

function assertServerEnv() {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is required');
  }
}

module.exports = {
  env,
  assertServerEnv,
};
