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
  const Order = require('../../src/modules/orders/order.model');
  const WebhookEvent = require('../../src/modules/webhooks/webhookEvent.model');
  const InventoryItem = require('../../src/modules/inventory/inventoryItem.model');
  const InventoryTransaction = require('../../src/modules/inventory/inventoryTransaction.model');
  const AuditLog = require('../../src/modules/audit/auditLog.model');
  await Order.deleteMany({});
  await WebhookEvent.deleteMany({});
  await InventoryTransaction.deleteMany({});
  await InventoryItem.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});
  await AuditLog.deleteMany({});
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

async function createStaffToken(overrides = {}) {
  const user = await User.create({
    name: overrides.name || 'Test Staff',
    email: overrides.email || uniqueEmail('staff'),
    passwordHash: 'unused-hash',
    role: 'staff',
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
  createStaffToken,
};
