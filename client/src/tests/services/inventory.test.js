jest.mock('../../services/api', () => ({
  apiRequest: jest.fn(),
}));

const { apiRequest } = require('../../services/api');
const {
  listInventory,
  listLowStock,
  createInventoryItem,
  adjustInventory,
} = require('../../services/inventory');

describe('inventory service', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('lists inventory and low stock', async () => {
    apiRequest.mockResolvedValueOnce({ items: [] });
    await listInventory();
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/inventory',
    });

    apiRequest.mockResolvedValueOnce({ items: [] });
    await listLowStock();
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/inventory/low-stock',
    });
  });

  it('creates and adjusts inventory items', async () => {
    apiRequest.mockResolvedValueOnce({ item: { id: 'i1' } });
    await createInventoryItem({ name: 'Milk', unit: 'ml' });
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/inventory',
      data: { name: 'Milk', unit: 'ml' },
    });

    apiRequest.mockResolvedValueOnce({ item: { id: 'i1', currentQuantity: 10 } });
    await adjustInventory('i1', { type: 'RESTOCK', quantityChange: 10 });
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/inventory/i1/adjust',
      data: { type: 'RESTOCK', quantityChange: 10 },
    });
  });
});
