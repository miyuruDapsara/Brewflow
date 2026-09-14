import { apiRequest } from './api';

export async function listInventory() {
  return apiRequest({
    method: 'get',
    url: '/api/inventory',
  });
}

export async function listLowStock() {
  return apiRequest({
    method: 'get',
    url: '/api/inventory/low-stock',
  });
}

export async function createInventoryItem(payload) {
  return apiRequest({
    method: 'post',
    url: '/api/inventory',
    data: payload,
  });
}

export async function updateInventoryItem(id, payload) {
  return apiRequest({
    method: 'put',
    url: `/api/inventory/${id}`,
    data: payload,
  });
}

export async function adjustInventory(id, payload) {
  return apiRequest({
    method: 'post',
    url: `/api/inventory/${id}/adjust`,
    data: payload,
  });
}
