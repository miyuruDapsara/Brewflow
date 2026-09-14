jest.mock('../../services/api', () => ({
  apiRequest: jest.fn(),
}));

const { apiRequest } = require('../../services/api');
const { listAuditLogs } = require('../../services/audit');

describe('audit service', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('requests paginated audit logs', async () => {
    apiRequest.mockResolvedValueOnce({ logs: [], pagination: { total: 0 } });
    await listAuditLogs({ page: 1, limit: 20 });
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/audit',
      params: { page: 1, limit: 20 },
    });
  });
});
