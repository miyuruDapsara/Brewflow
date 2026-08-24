const express = require('express');
const request = require('supertest');
const authorize = require('../../src/middleware/role');
const errorMiddleware = require('../../src/middleware/error');

function buildApp() {
  const app = express();
  app.get(
    '/manager-only',
    (req, res, next) => {
      req.user = req.headers['x-test-role']
        ? { id: '1', role: req.headers['x-test-role'] }
        : undefined;
      next();
    },
    authorize('manager'),
    (req, res) => res.status(200).json({ ok: true })
  );
  app.use(errorMiddleware);
  return app;
}

describe('authorize middleware', () => {
  const app = buildApp();

  it('returns 401 when no user is present', async () => {
    const response = await request(app).get('/manager-only');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('returns 403 when the role is not allowed', async () => {
    const response = await request(app)
      .get('/manager-only')
      .set('x-test-role', 'customer');

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
  });

  it('allows an authorized role through', async () => {
    const response = await request(app)
      .get('/manager-only')
      .set('x-test-role', 'manager');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
