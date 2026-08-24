const mongoose = require('mongoose');
const { connectDatabase } = require('../../src/config/database');
const User = require('../../src/modules/auth/user.model');

async function connectTestDb() {
  if (mongoose.connection.readyState === 0) {
    await connectDatabase();
  }
}

async function clearTestUsers() {
  await User.deleteMany({ email: /@example\.com$/i });
}

async function disconnectTestDb() {
  await clearTestUsers();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}

function uniqueEmail(prefix = 'user') {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`;
}

module.exports = {
  connectTestDb,
  clearTestUsers,
  disconnectTestDb,
  uniqueEmail,
};
