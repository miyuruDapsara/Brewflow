const request = require('supertest');
const app = require('../../src/app');
const Category = require('../../src/modules/categories/category.model');
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
  createCustomerToken,
} = require('../helpers/db');

describe('payments PayHere integration', () => {
  let customer;
  let otherCustomer;
  let product;

  beforeAll(async () => {
    env.payhereMerchantId = 'merchant_test';
    env.payhereMerchantSecret = 'secret_test';
    env.payhereCurrency = 'LKR';
    env.payhereCheckoutUrl = 'https://sandbox.payhere.lk/pay/checkout';
    env.payhereNotifyUrl = 'https://example.com/api/payments/notify';
    env.payhereReturnUrl = 'http://localhost:5173/checkout/return';
    env.payhereCancelUrl = 'http://localhost:5173/checkout/cancel';
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearCatalogData();
    await clearTestUsers();
    customer = await createCustomerToken();
    otherCustomer = await createCustomerToken();

    const category = await Category.create({
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
      stockQuantity: 20,
      isAvailable: true,
      isActive: true,
      modifierGroups: [],
    });
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  async function createPendingOrder(token = customer.token) {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderType: 'PICKUP',
        items: [{ productId: product._id.toString(), quantity: 1 }],
      });
    expect(res.status).toBe(201);
    return res.body.data.order;
  }

  it('creates a checkout session for an owned PENDING_PAYMENT order', async () => {
    const order = await createPendingOrder();

    const res = await request(app)
      .post('/api/payments/checkout-session')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ orderId: order.id });

    expect(res.status).toBe(200);
    expect(res.body.data.session.merchant_id).toBe('merchant_test');
    expect(res.body.data.session.order_id).toBe(order.orderNumber);
    expect(res.body.data.session.amount).toBe(formatPayHereAmount(order.total));
    expect(res.body.data.session.currency).toBe('LKR');
    expect(res.body.data.session.hash).toMatch(/^[A-F0-9]{32}$/);
    expect(res.body.data.session).not.toHaveProperty('merchant_secret');
  });

  it('forbids another customer from creating a checkout session', async () => {
    const order = await createPendingOrder();
    const res = await request(app)
      .post('/api/payments/checkout-session')
      .set('Authorization', `Bearer ${otherCustomer.token}`)
      .send({ orderId: order.id });
    expect(res.status).toBe(403);
  });

  it('activates order on valid success notify', async () => {
    const order = await createPendingOrder();
    const amount = formatPayHereAmount(order.total);
    const md5sig = buildNotifySignature({
      merchantId: 'merchant_test',
      orderId: order.orderNumber,
      payhereAmount: amount,
      payhereCurrency: 'LKR',
      statusCode: '2',
      merchantSecret: 'secret_test',
    });

    const res = await request(app)
      .post('/api/payments/notify')
      .type('form')
      .send({
        merchant_id: 'merchant_test',
        order_id: order.orderNumber,
        payhere_amount: amount,
        payhere_currency: 'LKR',
        status_code: '2',
        md5sig,
        payment_id: 'pay_1',
      });

    expect(res.status).toBe(200);

    const updated = await Order.findById(order.id);
    expect(updated.status).toBe('PLACED');
    expect(updated.paymentStatus).toBe('SUCCEEDED');
    expect(updated.payherePaymentId).toBe('pay_1');
  });

  it('rejects invalid md5sig', async () => {
    const order = await createPendingOrder();
    const res = await request(app)
      .post('/api/payments/notify')
      .type('form')
      .send({
        merchant_id: 'merchant_test',
        order_id: order.orderNumber,
        payhere_amount: formatPayHereAmount(order.total),
        payhere_currency: 'LKR',
        status_code: '2',
        md5sig: 'DEADBEEF',
        payment_id: 'pay_bad',
      });

    expect(res.status).toBe(400);
    const unchanged = await Order.findById(order.id);
    expect(unchanged.status).toBe('PENDING_PAYMENT');
  });

  it('ignores duplicate notify events', async () => {
    const order = await createPendingOrder();
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
      payment_id: 'pay_dup',
    };

    const first = await request(app).post('/api/payments/notify').type('form').send(payload);
    const second = await request(app).post('/api/payments/notify').type('form').send(payload);
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });

  it('marks payment failed on status_code -2', async () => {
    const order = await createPendingOrder();
    const amount = formatPayHereAmount(order.total);
    const res = await request(app)
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
        payment_id: 'pay_fail',
      });

    expect(res.status).toBe(200);
    const updated = await Order.findById(order.id);
    expect(updated.status).toBe('PAYMENT_FAILED');
    expect(updated.paymentStatus).toBe('FAILED');
  });
});
