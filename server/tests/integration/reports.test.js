const request = require('supertest');
const app = require('../../src/app');
const Category = require('../../src/modules/categories/category.model');
const Product = require('../../src/modules/products/product.model');
const Order = require('../../src/modules/orders/order.model');
const InventoryItem = require('../../src/modules/inventory/inventoryItem.model');
const {
  connectTestDb,
  clearCatalogData,
  clearTestUsers,
  disconnectTestDb,
  createManagerToken,
  createCustomerToken,
  createStaffToken,
} = require('../helpers/db');

describe('reports API', () => {
  let manager;
  let customer;
  let staff;
  let category;
  let product;

  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearCatalogData();
    await clearTestUsers();
    manager = await createManagerToken();
    customer = await createCustomerToken();
    staff = await createStaffToken();

    category = await Category.create({
      name: 'Coffee',
      categoryType: 'BEVERAGE',
      displayOrder: 1,
    });

    product = await Product.create({
      categoryId: category._id,
      name: 'Latte',
      productType: 'BEVERAGE',
      basePrice: 400,
      inventoryMode: 'STOCK_BASED',
      stockQuantity: 10,
      isAvailable: true,
      isActive: true,
    });

    await Order.create({
      customerId: customer.user._id,
      orderNumber: `BF-RPT-${Date.now()}`,
      orderType: 'PICKUP',
      status: 'PLACED',
      paymentStatus: 'SUCCEEDED',
      subtotal: 400,
      tax: 32,
      discount: 0,
      total: 432,
      items: [
        {
          productId: product._id,
          name: 'Latte',
          productType: 'BEVERAGE',
          basePrice: 400,
          quantity: 2,
          selectedModifiers: [],
          notes: '',
          unitPrice: 400,
          lineTotal: 800,
        },
      ],
    });

    await Order.create({
      customerId: customer.user._id,
      orderNumber: `BF-FAIL-${Date.now()}`,
      orderType: 'PICKUP',
      status: 'PAYMENT_FAILED',
      paymentStatus: 'FAILED',
      subtotal: 400,
      tax: 32,
      discount: 0,
      total: 432,
      items: [
        {
          productId: product._id,
          name: 'Latte',
          productType: 'BEVERAGE',
          basePrice: 400,
          quantity: 1,
          selectedModifiers: [],
          notes: '',
          unitPrice: 400,
          lineTotal: 400,
        },
      ],
    });

    await Order.create({
      customerId: customer.user._id,
      orderNumber: `BF-CAN-${Date.now()}`,
      orderType: 'PICKUP',
      status: 'CANCELLED',
      paymentStatus: 'SUCCEEDED',
      subtotal: 400,
      tax: 32,
      discount: 0,
      total: 432,
      items: [
        {
          productId: product._id,
          name: 'Latte',
          productType: 'BEVERAGE',
          basePrice: 400,
          quantity: 1,
          selectedModifiers: [],
          notes: '',
          unitPrice: 400,
          lineTotal: 400,
        },
      ],
    });

    await InventoryItem.create({
      name: 'Milk',
      unit: 'ml',
      currentQuantity: 50,
      reorderLevel: 100,
      isActive: true,
    });
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('forbids customer and staff from reports', async () => {
    const c = await request(app)
      .get('/api/reports/sales')
      .set('Authorization', `Bearer ${customer.token}`);
    expect(c.status).toBe(403);

    const s = await request(app)
      .get('/api/reports/products')
      .set('Authorization', `Bearer ${staff.token}`);
    expect(s.status).toBe(403);
  });

  it('returns sales report with series, category, failed and cancel counts', async () => {
    const res = await request(app)
      .get('/api/reports/sales')
      .query({ groupBy: 'day' })
      .set('Authorization', `Bearer ${manager.token}`);

    expect(res.status).toBe(200);
    const report = res.body.data.report;
    expect(report.summary.orderCount).toBe(1);
    expect(report.summary.revenue).toBe(432);
    expect(report.series.length).toBeGreaterThanOrEqual(1);
    expect(report.categorySales[0].name).toBe('Coffee');
    expect(report.categorySales[0].revenue).toBe(800);
    expect(report.failedPayments).toBe(1);
    expect(report.cancellations).toBe(1);
  });

  it('returns product popularity', async () => {
    const res = await request(app)
      .get('/api/reports/products')
      .set('Authorization', `Bearer ${manager.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.report.products[0].name).toBe('Latte');
    expect(res.body.data.report.products[0].unitsSold).toBe(2);
  });

  it('returns inventory summary with low stock', async () => {
    const res = await request(app)
      .get('/api/reports/inventory')
      .set('Authorization', `Bearer ${manager.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.report.summary.totalItems).toBe(1);
    expect(res.body.data.report.summary.lowStockCount).toBe(1);
    expect(res.body.data.report.items[0].isLowStock).toBe(true);
  });
});
