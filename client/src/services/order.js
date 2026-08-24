import { apiRequest } from './api';

export async function createOrder({ orderType, items }) {
  return apiRequest({
    method: 'post',
    url: '/api/orders',
    data: { orderType, items },
  });
}

export async function listMyOrders() {
  return apiRequest({
    method: 'get',
    url: '/api/orders/my-orders',
  });
}

export async function getOrder(id) {
  return apiRequest({
    method: 'get',
    url: `/api/orders/${id}`,
  });
}

export async function cancelOrder(id) {
  return apiRequest({
    method: 'patch',
    url: `/api/orders/${id}/cancel`,
  });
}
