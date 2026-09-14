import { apiRequest } from './api';

export async function getSalesReport(params = {}) {
  return apiRequest({
    method: 'get',
    url: '/api/reports/sales',
    params,
  });
}

export async function getProductReport(params = {}) {
  return apiRequest({
    method: 'get',
    url: '/api/reports/products',
    params,
  });
}

export async function getInventoryReport() {
  return apiRequest({
    method: 'get',
    url: '/api/reports/inventory',
  });
}
