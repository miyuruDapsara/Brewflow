jest.mock('../../services/api', () => ({
  apiRequest: jest.fn(),
}));

const { apiRequest } = require('../../services/api');
const {
  getSalesReport,
  getProductReport,
  getInventoryReport,
} = require('../../services/report');

describe('report service', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('requests sales, products, and inventory reports', async () => {
    apiRequest.mockResolvedValueOnce({ report: {} });
    await getSalesReport({ from: '2026-01-01', groupBy: 'day' });
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/reports/sales',
      params: { from: '2026-01-01', groupBy: 'day' },
    });

    apiRequest.mockResolvedValueOnce({ report: { products: [] } });
    await getProductReport({ to: '2026-01-31' });
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/reports/products',
      params: { to: '2026-01-31' },
    });

    apiRequest.mockResolvedValueOnce({ report: { items: [] } });
    await getInventoryReport();
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/reports/inventory',
    });
  });
});
