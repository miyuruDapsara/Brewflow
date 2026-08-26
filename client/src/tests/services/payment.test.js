jest.mock('../../services/api', () => ({
  apiRequest: jest.fn(),
}));

const { apiRequest } = require('../../services/api');
const { createCheckoutSession } = require('../../services/payment');

describe('payment service', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('creates a PayHere checkout session for an order', async () => {
    apiRequest.mockResolvedValue({
      session: { order_id: 'BF-1', hash: 'ABC' },
    });
    const data = await createCheckoutSession('oid123');
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/payments/checkout-session',
      data: { orderId: 'oid123' },
    });
    expect(data.session.order_id).toBe('BF-1');
  });
});
