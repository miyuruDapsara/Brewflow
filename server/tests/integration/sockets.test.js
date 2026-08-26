const http = require('http');
const { Server } = require('socket.io');
const { io: ioc } = require('socket.io-client');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { env } = require('../../src/config/env');
const socketAuth = require('../../src/sockets/socketAuth');
const {
  orderRoomName,
  STAFF_ORDERS_ROOM,
  assertCanJoinOrder,
  assertCanJoinStaff,
} = require('../../src/sockets/socketAuthorization');
const {
  connectTestDb,
  clearCatalogData,
  clearTestUsers,
  disconnectTestDb,
  createCustomerToken,
  createStaffToken,
} = require('../helpers/db');
const Category = require('../../src/modules/categories/category.model');
const Product = require('../../src/modules/products/product.model');
const Order = require('../../src/modules/orders/order.model');

function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe('socket.io auth and rooms', () => {
  let httpServer;
  let io;
  let port;
  let customer;
  let otherCustomer;
  let staff;
  let product;

  beforeAll(async () => {
    await connectTestDb();
    httpServer = http.createServer(app);
    io = new Server(httpServer, { cors: { origin: '*' } });
    io.use(socketAuth);
    io.on('connection', (socket) => {
      socket.on('join:order', async (orderId, ack) => {
        try {
          await assertCanJoinOrder(socket.user, orderId);
          await socket.join(orderRoomName(orderId));
          ack?.({ ok: true });
        } catch (err) {
          ack?.({ ok: false, error: err.message });
        }
      });
      socket.on('join:staff', async (ack) => {
        try {
          assertCanJoinStaff(socket.user);
          await socket.join(STAFF_ORDERS_ROOM);
          ack?.({ ok: true });
        } catch (err) {
          ack?.({ ok: false, error: err.message });
        }
      });
    });

    await new Promise((resolve) => {
      httpServer.listen(0, () => {
        port = httpServer.address().port;
        resolve();
      });
    });
  });

  beforeEach(async () => {
    await clearCatalogData();
    await clearTestUsers();
    customer = await createCustomerToken();
    otherCustomer = await createCustomerToken();
    staff = await createStaffToken();

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
    io.close();
    await new Promise((resolve) => httpServer.close(resolve));
    await disconnectTestDb();
  });

  function clientWithToken(token) {
    return ioc(`http://127.0.0.1:${port}`, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true,
    });
  }

  it('rejects connections without a valid JWT', async () => {
    const socket = ioc(`http://127.0.0.1:${port}`, {
      auth: { token: 'bad-token' },
      transports: ['websocket'],
      forceNew: true,
    });

    const err = await waitFor(socket, 'connect_error');
    expect(err.message).toMatch(/Invalid|Authentication|expired/i);
    socket.close();
  });

  it('forbids a customer from joining staff:orders', async () => {
    const socket = clientWithToken(customer.token);
    await waitFor(socket, 'connect');

    const ack = await new Promise((resolve) => {
      socket.emit('join:staff', resolve);
    });
    expect(ack.ok).toBe(false);
    socket.close();
  });

  it('allows staff to join staff:orders and forbids non-owner join:order', async () => {
    const order = await Order.create({
      customerId: customer.user._id,
      orderNumber: `BF-SOCK-${Date.now()}`,
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
          quantity: 1,
          selectedModifiers: [],
          notes: '',
          unitPrice: 400,
          lineTotal: 400,
        },
      ],
    });

    const staffSocket = clientWithToken(staff.token);
    await waitFor(staffSocket, 'connect');
    const staffAck = await new Promise((resolve) => {
      staffSocket.emit('join:staff', resolve);
    });
    expect(staffAck.ok).toBe(true);

    const otherSocket = clientWithToken(otherCustomer.token);
    await waitFor(otherSocket, 'connect');
    const deny = await new Promise((resolve) => {
      otherSocket.emit('join:order', order._id.toString(), resolve);
    });
    expect(deny.ok).toBe(false);

    const ownerSocket = clientWithToken(customer.token);
    await waitFor(ownerSocket, 'connect');
    const allow = await new Promise((resolve) => {
      ownerSocket.emit('join:order', order._id.toString(), resolve);
    });
    expect(allow.ok).toBe(true);

    staffSocket.close();
    otherSocket.close();
    ownerSocket.close();
  });

  it('rejects forged JWT with wrong secret', async () => {
    const bad = jwt.sign(
      { userId: customer.user._id.toString(), role: 'staff' },
      'wrong-secret'
    );
    const socket = clientWithToken(bad);
    const err = await waitFor(socket, 'connect_error');
    expect(err.message).toMatch(/Invalid|expired|Authentication/i);
    socket.close();
  });
});
