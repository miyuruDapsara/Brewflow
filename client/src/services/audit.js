import { apiRequest } from './api';

export async function listAuditLogs(params = {}) {
  return apiRequest({
    method: 'get',
    url: '/api/audit',
    params,
  });
}
