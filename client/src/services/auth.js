import { apiRequest } from './api';

export async function register({ name, email, password }) {
  return apiRequest({
    method: 'post',
    url: '/api/auth/register',
    data: { name, email, password },
  });
}

export async function login({ email, password }) {
  return apiRequest({
    method: 'post',
    url: '/api/auth/login',
    data: { email, password },
  });
}

export async function me() {
  const data = await apiRequest({
    method: 'get',
    url: '/api/auth/me',
  });
  return data.user;
}
