const request = require('supertest');
const app = require('../../src/app');
const InventoryItem = require('../../src/modules/inventory/inventoryItem.model');
const AuditLog = require('../../src/modules/audit/auditLog.model');
const { AUDIT_ACTIONS } = require('../../src/modules/audit/audit.constants');
const {
  connectTestDb,
  clearCatalogData,
  clearTestUsers,
  disconnectTestDb,
  createManagerToken,
  createCustomerToken,
  createStaffToken,
} = require('../helpers/db');

describe('audit API', () => {
  let manager;
  let customer;
  let staff;

  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearCatalogData();
    await clearTestUsers();
    manager = await createManagerToken();
    customer = await createCustomerToken();
    staff = await createStaffToken();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('lists audit logs for managers only', async () => {
    await AuditLog.create({
      actorId: manager.user._id,
      action: AUDIT_ACTIONS.CATEGORY_CREATED,
      entityType: 'CATEGORY',
      entityId: '507f1f77bcf86cd799439011',
      details: { name: 'Coffee' },
    });

    const ok = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${manager.token}`);
    expect(ok.status).toBe(200);
    expect(ok.body.data.logs.length).toBeGreaterThanOrEqual(1);
    expect(
      ok.body.data.logs.some((l) => l.action === AUDIT_ACTIONS.CATEGORY_CREATED)
    ).toBe(true);

    const staffRes = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${staff.token}`);
    expect(staffRes.status).toBe(403);

    const customerRes = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${customer.token}`);
    expect(customerRes.status).toBe(403);
  });

  it('records an audit log when inventory is adjusted', async () => {
    const item = await InventoryItem.create({
      name: 'Milk',
      unit: 'ml',
      currentQuantity: 100,
      reorderLevel: 20,
      isActive: true,
    });

    const res = await request(app)
      .post(`/api/inventory/${item._id}/adjust`)
      .set('Authorization', `Bearer ${manager.token}`)
      .send({ type: 'RESTOCK', quantityChange: 50 });

    expect(res.status).toBe(200);

    const logs = await AuditLog.find({
      action: AUDIT_ACTIONS.INVENTORY_ADJUSTED,
    });
    expect(logs.length).toBeGreaterThanOrEqual(1);
  });

  it('records an audit log when a category is created', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${manager.token}`)
      .send({
        name: `Audit Cat ${Date.now()}`,
        categoryType: 'BEVERAGE',
      });

    expect(res.status).toBe(201);

    const logs = await AuditLog.find({
      action: AUDIT_ACTIONS.CATEGORY_CREATED,
    });
    expect(logs.length).toBeGreaterThanOrEqual(1);
  });
});
