const request = require('supertest');
const app = require('../../src/app');

describe('app bootstrap', () => {
  it('boots the Express app and GET /health returns 200', async () => {
    expect(app).toBeDefined();

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
