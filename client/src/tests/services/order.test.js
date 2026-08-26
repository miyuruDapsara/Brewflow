jest.mock('../../services/api', () => ({
  apiRequest: jest.fn(),
}));

const { apiRequest } = require('../../services/api');
const {
  createOrder,
  listMyOrders,
  getOrder,
  cancelOrder,
  listAdminOrders,
  updateOrderStatus,
} = require('../../services/order');

describe('order service', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('creates an order without sending client prices', async () => {
    apiRequest.mockResolvedValue({
      order: { id: 'o1', total: 1080 },
    });

    const payload = {
      orderType: 'PICKUP',
      items: [
        {
          productId: 'p1',
          quantity: 2,
          selectedModifiers: [{ groupId: 'g1', optionId: 'opt1' }],
          notes: '',
        },
      ],
    };

    const result = await createOrder(payload);

    expect(apiRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/orders',
      data: payload,
    });
    expect(result.order.id).toBe('o1');
  });

  it('lists my orders, gets one, and cancels', async () => {
    apiRequest.mockResolvedValueOnce({ orders: [] });
    await listMyOrders();
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/orders/my-orders',
    });

    apiRequest.mockResolvedValueOnce({ order: { id: 'o1' } });
    await getOrder('o1');
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/orders/o1',
    });

    apiRequest.mockResolvedValueOnce({ order: { id: 'o1', status: 'CANCELLED' } });
    await cancelOrder('o1');
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'patch',
      url: '/api/orders/o1/cancel',
    });
  });

  it('lists admin orders and updates status', async () => {
    apiRequest.mockResolvedValueOnce({ orders: [{ id: 'o1' }] });
    await listAdminOrders();
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/admin/orders',
    });

    apiRequest.mockResolvedValueOnce({
      order: { id: 'o1', status: 'PREPARING' },
    });
    await updateOrderStatus('o1', 'PREPARING');
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'patch',
      url: '/api/orders/o1/status',
      data: { status: 'PREPARING' },
    });
  });
});
