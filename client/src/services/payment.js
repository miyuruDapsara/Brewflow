import { apiRequest } from './api';

export async function createCheckoutSession(orderId) {
  return apiRequest({
    method: 'post',
    url: '/api/payments/checkout-session',
    data: { orderId },
  });
}
