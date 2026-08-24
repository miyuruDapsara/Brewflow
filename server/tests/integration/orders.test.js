const request = require('supertest');
const app = require('../../src/app');
const Category = require('../../src/modules/categories/category.model');
const Product = require('../../src/modules/products/product.model');
const {
  connectTestDb,
  clearCatalogData,
  clearTestUsers,
  disconnectTestDb,
  createCustomerToken,
  createStaffToken,
  createManagerToken,
} = require('../helpers/db');

describe('orders API integration', () => {
  let customer;
  let otherCustomer;
  let staff;
  let category;
  let product;

  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearCatalogData();
    await clearTestUsers();

    customer = await createCustomerToken();
    otherCustomer = await createCustomerToken();
    staff = await createStaffToken();
    await createManagerToken();

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
      stockQuantity: 20,
      isAvailable: true,
      isActive: true,
      modifierGroups: [
        {
          name: 'Size',
          isRequired: true,
          minSelections: 1,
          selectionType: 'SINGLE',
          options: [
            { name: 'Small', priceAdjustment: 0 },
            { name: 'Large', priceAdjustment: 100 },
          ],
        },
      ],
    });
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  function sizeOption(name) {
    const group = product.modifierGroups[0];
    const option = group.options.find((o) => o.name === name);
    return {
      groupId: group._id.toString(),
      optionId: option._id.toString(),
    };
  }

  it('rejects unauthenticated create', async () => {
    const res = await request(app).post('/api/orders').send({
      orderType: 'PICKUP',
      items: [{ productId: product._id.toString(), quantity: 1 }],
    });
    expect(res.status).toBe(401);
  });

  it('creates an order with server-calculated totals', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        orderType: 'PICKUP',
        items: [
          {
            productId: product._id.toString(),
            quantity: 2,
            selectedModifiers: [sizeOption('Large')],
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.order.status).toBe('PLACED');
    expect(res.body.data.order.paymentStatus).toBe('PENDING');
    expect(res.body.data.order.subtotal).toBe(1000);
    expect(res.body.data.order.tax).toBe(80);
    expect(res.body.data.order.total).toBe(1080);
    expect(res.body.data.order.orderNumber).toMatch(/^BF-/);
  });

  it('lists only the current customer orders', async () => {
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        orderType: 'DINE_IN',
        items: [
          {
            productId: product._id.toString(),
            quantity: 1,
            selectedModifiers: [sizeOption('Small')],
          },
        ],
      });

    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${otherCustomer.token}`)
      .send({
        orderType: 'PICKUP',
        items: [
          {
            productId: product._id.toString(),
            quantity: 1,
            selectedModifiers: [sizeOption('Small')],
          },
        ],
      });

    const mine = await request(app)
      .get('/api/orders/my-orders')
      .set('Authorization', `Bearer ${customer.token}`);

    expect(mine.status).toBe(200);
    expect(mine.body.data.orders).toHaveLength(1);
    expect(mine.body.data.orders[0].customerId).toBe(
      customer.user._id.toString()
    );
  });

  it('forbids another customer from viewing an order', async () => {
    const created = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        orderType: 'PICKUP',
        items: [
          {
            productId: product._id.toString(),
            quantity: 1,
            selectedModifiers: [sizeOption('Small')],
          },
        ],
      });

    const orderId = created.body.data.order.id;

    const denied = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${otherCustomer.token}`);

    expect(denied.status).toBe(403);
  });

  it('allows customer cancel when PLACED and staff status updates', async () => {
    const created = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        orderType: 'PICKUP',
        items: [
          {
            productId: product._id.toString(),
            quantity: 1,
            selectedModifiers: [sizeOption('Small')],
          },
        ],
      });

    const orderId = created.body.data.order.id;

    const preparing = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${staff.token}`)
      .send({ status: 'PREPARING' });

    expect(preparing.status).toBe(200);
    expect(preparing.body.data.order.status).toBe('PREPARING');

    const badSkip = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${staff.token}`)
      .send({ status: 'COMPLETED' });

    expect(badSkip.status).toBe(400);

    const created2 = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        orderType: 'PICKUP',
        items: [
          {
            productId: product._id.toString(),
            quantity: 1,
            selectedModifiers: [sizeOption('Small')],
          },
        ],
      });

    const cancel = await request(app)
      .patch(`/api/orders/${created2.body.data.order.id}/cancel`)
      .set('Authorization', `Bearer ${customer.token}`);

    expect(cancel.status).toBe(200);
    expect(cancel.body.data.order.status).toBe('CANCELLED');
  });

  it('lists admin orders for staff', async () => {
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        orderType: 'PICKUP',
        items: [
          {
            productId: product._id.toString(),
            quantity: 1,
            selectedModifiers: [sizeOption('Small')],
          },
        ],
      });

    const admin = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${staff.token}`);

    expect(admin.status).toBe(200);
    expect(admin.body.data.orders.length).toBeGreaterThanOrEqual(1);

    const denied = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${customer.token}`);

    expect(denied.status).toBe(403);
  });
});
