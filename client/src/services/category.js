import { apiRequest } from './api';

export async function listCategories() {
  return apiRequest({
    method: 'get',
    url: '/api/categories',
  });
}
