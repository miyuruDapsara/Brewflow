import { apiRequest } from './api';

export async function listProducts({ categoryId } = {}) {
  const params = {};
  if (categoryId) {
    params.categoryId = categoryId;
  }

  return apiRequest({
    method: 'get',
    url: '/api/products',
    params,
  });
}

export async function getProduct(id) {
  return apiRequest({
    method: 'get',
    url: `/api/products/${id}`,
  });
}
