const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { connectDatabase } = require('../../src/config/database');
const { env } = require('../../src/config/env');
const User = require('../../src/modules/auth/user.model');
const Category = require('../../src/modules/categories/category.model');
const Product = require('../../src/modules/products/product.model');

async function connectTestDb() {
  if (mongoose.connection.readyState === 0) {
    await connectDatabase();
  }
}

async function clearTestUsers() {
  await User.deleteMany({ email: /@example\.com$/i });
}

async function clearCatalogData() {
  await Product.deleteMany({});
  await Category.deleteMany({});
}

async function disconnectTestDb() {
  await clearCatalogData();
  await clearTestUsers();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}

function uniqueEmail(prefix = 'user') {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`;
}

async function createManagerToken(overrides = {}) {
  const user = await User.create({
    name: overrides.name || 'Test Manager',
    email: overrides.email || uniqueEmail('manager'),
    passwordHash: 'unused-hash',
    role: 'manager',
    isActive: true,
  });

  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    env.jwtSecret,
    { expiresIn: '1h' }
  );

  return { user, token };
}

async function createCustomerToken(overrides = {}) {
  const user = await User.create({
    name: overrides.name || 'Test Customer',
    email: overrides.email || uniqueEmail('customer'),
    passwordHash: 'unused-hash',
    role: 'customer',
    isActive: true,
  });

  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    env.jwtSecret,
    { expiresIn: '1h' }
  );

  return { user, token };
}

module.exports = {
  connectTestDb,
  clearTestUsers,
  clearCatalogData,
  disconnectTestDb,
  uniqueEmail,
  createManagerToken,
  createCustomerToken,
};
