const auditService = require('../../src/modules/audit/audit.service');
const { AUDIT_ACTIONS, ENTITY_TYPES } = require('../../src/modules/audit/audit.constants');
const {
  connectTestDb,
  clearCatalogData,
  clearTestUsers,
  disconnectTestDb,
  createManagerToken,
} = require('../helpers/db');

describe('audit.service', () => {
  let manager;

  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearCatalogData();
    await clearTestUsers();
    manager = await createManagerToken();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('writes and lists audit logs', async () => {
    const written = await auditService.writeLog({
      actorId: manager.user._id,
      action: AUDIT_ACTIONS.PRODUCT_CREATED,
      entityType: ENTITY_TYPES.PRODUCT,
      entityId: '507f1f77bcf86cd799439011',
      details: { name: 'Latte' },
    });

    expect(written.action).toBe(AUDIT_ACTIONS.PRODUCT_CREATED);
    expect(written.details.name).toBe('Latte');

    const listed = await auditService.listLogs({ page: 1, limit: 10 });
    expect(listed.logs).toHaveLength(1);
    expect(listed.pagination.total).toBe(1);
    expect(listed.logs[0].entityType).toBe(ENTITY_TYPES.PRODUCT);
  });

  it('writeLogSafe does not throw on bad payload', () => {
    expect(() => auditService.writeLogSafe({})).not.toThrow();
  });
});
