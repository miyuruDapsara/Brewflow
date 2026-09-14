const request = require('supertest');
const app = require('../../src/app');
const InventoryItem = require('../../src/modules/inventory/inventoryItem.model');
const Product = require('../../src/modules/products/product.model');
const Order = require('../../src/modules/orders/order.model');
const { env } = require('../../src/config/env');
const {
  buildNotifySignature,
  formatPayHereAmount,
} = require('../../src/modules/payments/payhere.hash');
const {
  connectTestDb,
  clearCatalogData,
  clearTestUsers,
  disconnectTestDb,
  createManagerToken,
  createCustomerToken,
  createStaffToken,
} = require('../helpers/db');
const Category = require('../../src/modules/categories/category.model');

describe('inventory API + payment deduct', () => {
  let manager;
  let customer;
  let staff;
  let product;

  beforeAll(async () => {
    env.payhereMerchantId = 'merchant_test';
    env.payhereMerchantSecret = 'secret_test';
    env.payhereCurrency = 'LKR';
    env.payhereNotifyUrl = 'https://example.com/api/payments/notify';
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearCatalogData();
    await clearTestUsers();
    manager = await createManagerToken();
    customer = await createCustomerToken();
    staff = await createStaffToken();

    const category = await Category.create({
      name: 'Snacks',
      categoryType: 'FOOD',
      displayOrder: 1,
    });

    product = await Product.create({
      categoryId: category._id,
      name: 'Cookie',
      productType: 'FOOD',
      basePrice: 200,
      inventoryMode: 'STOCK_BASED',
      stockQuantity: 20,
      isAvailable: true,
      isActive: true,
    });
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('allows manager CRUD and adjust; forbids customer', async () => {
    const created = await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${manager.token}`)
      .send({
        name: 'Milk',
        unit: 'ml',
        currentQuantity: 500,
        reorderLevel: 100,
      });

    expect(created.status).toBe(201);
    const id = created.body.data.item.id;

    const denied = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${customer.token}`);
    expect(denied.status).toBe(403);

    const staffDenied = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${staff.token}`);
    expect(staffDenied.status).toBe(403);

    const adjusted = await request(app)
      .post(`/api/inventory/${id}/adjust`)
      .set('Authorization', `Bearer ${manager.token}`)
      .send({ type: 'RESTOCK', quantityChange: 100, notes: 'delivery' });

    expect(adjusted.status).toBe(200);
    expect(adjusted.body.data.item.currentQuantity).toBe(600);
  });

  it('deducts stock on successful notify once; cancel restores', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        orderType: 'PICKUP',
        items: [{ productId: product._id.toString(), quantity: 3 }],
      });

    expect(orderRes.status).toBe(201);
    const order = orderRes.body.data.order;
    const amount = formatPayHereAmount(order.total);
    const payload = {
      merchant_id: 'merchant_test',
      order_id: order.orderNumber,
      payhere_amount: amount,
      payhere_currency: 'LKR',
      status_code: '2',
      md5sig: buildNotifySignature({
        merchantId: 'merchant_test',
        orderId: order.orderNumber,
        payhereAmount: amount,
        payhereCurrency: 'LKR',
        statusCode: '2',
        merchantSecret: 'secret_test',
      }),
      payment_id: 'pay_inv_1',
    };

    const notify = await request(app)
      .post('/api/payments/notify')
      .type('form')
      .send(payload);
    expect(notify.status).toBe(200);

    let dbProduct = await Product.findById(product._id);
    expect(dbProduct.stockQuantity).toBe(17);

    const again = await request(app)
      .post('/api/payments/notify')
      .type('form')
      .send(payload);
    expect(again.status).toBe(200);
    dbProduct = await Product.findById(product._id);
    expect(dbProduct.stockQuantity).toBe(17);

    const cancel = await request(app)
      .patch(`/api/orders/${order.id}/cancel`)
      .set('Authorization', `Bearer ${customer.token}`);
    expect(cancel.status).toBe(200);

    dbProduct = await Product.findById(product._id);
    expect(dbProduct.stockQuantity).toBe(20);
  });

  it('does not deduct on failed payment notify', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        orderType: 'PICKUP',
        items: [{ productId: product._id.toString(), quantity: 1 }],
      });
    const order = orderRes.body.data.order;
    const amount = formatPayHereAmount(order.total);

    await request(app)
      .post('/api/payments/notify')
      .type('form')
      .send({
        merchant_id: 'merchant_test',
        order_id: order.orderNumber,
        payhere_amount: amount,
        payhere_currency: 'LKR',
        status_code: '-2',
        md5sig: buildNotifySignature({
          merchantId: 'merchant_test',
          orderId: order.orderNumber,
          payhereAmount: amount,
          payhereCurrency: 'LKR',
          statusCode: '-2',
          merchantSecret: 'secret_test',
        }),
        payment_id: 'pay_fail_inv',
      });

    const dbProduct = await Product.findById(product._id);
    expect(dbProduct.stockQuantity).toBe(20);
    const dbOrder = await Order.findById(order.id);
    expect(dbOrder.inventoryDeducted).toBe(false);
  });
});
