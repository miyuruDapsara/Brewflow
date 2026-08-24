const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const authenticate = require('../../src/middleware/auth');
const authorize = require('../../src/middleware/role');
const errorMiddleware = require('../../src/middleware/error');
const notFoundMiddleware = require('../../src/middleware/notFound');
const User = require('../../src/modules/auth/user.model');
const { env } = require('../../src/config/env');
const {
  connectTestDb,
  clearTestUsers,
  disconnectTestDb,
  uniqueEmail,
} = require('../helpers/db');

describe('auth API integration', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterEach(async () => {
    await clearTestUsers();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('registers a customer and returns user + token without passwordHash', async () => {
    const email = uniqueEmail('register');
    const response = await request(app).post('/api/auth/register').send({
      name: 'New Customer',
      email,
      password: 'secret12',
      role: 'manager',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(email);
    expect(response.body.data.user.role).toBe('customer');
    expect(response.body.data.user.passwordHash).toBeUndefined();
    expect(response.body.data.token).toBeDefined();
  });

  it('rejects duplicate email with 409', async () => {
    const email = uniqueEmail('dup');
    await request(app).post('/api/auth/register').send({
      name: 'First',
      email,
      password: 'secret12',
    });

    const response = await request(app).post('/api/auth/register').send({
      name: 'Second',
      email,
      password: 'secret12',
    });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT_ERROR');
  });

  it('rejects invalid register payloads with 400', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'A',
      email: 'not-an-email',
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('logs in with valid credentials and rejects bad password', async () => {
    const email = uniqueEmail('login');
    await request(app).post('/api/auth/register').send({
      name: 'Login User',
      email,
      password: 'secret12',
    });

    const ok = await request(app).post('/api/auth/login').send({
      email,
      password: 'secret12',
    });

    expect(ok.status).toBe(200);
    expect(ok.body.data.token).toBeDefined();

    const bad = await request(app).post('/api/auth/login').send({
      email,
      password: 'nope-nope',
    });

    expect(bad.status).toBe(401);
    expect(bad.body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('rejects login for unknown email', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: uniqueEmail('missing'),
      password: 'secret12',
    });

    expect(response.status).toBe(401);
  });

  it('returns the current user on GET /api/auth/me', async () => {
    const email = uniqueEmail('me');
    const registered = await request(app).post('/api/auth/register').send({
      name: 'Me User',
      email,
      password: 'secret12',
    });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registered.body.data.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(email);
  });

  it('rejects GET /api/auth/me without a token', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
  });

  it('enforces manager-only authorization with role middleware', async () => {
    const miniApp = express();
    miniApp.get(
      '/manager-area',
      authenticate,
      authorize('manager'),
      (req, res) => res.status(200).json({ ok: true })
    );
    miniApp.use(notFoundMiddleware);
    miniApp.use(errorMiddleware);

    const customerEmail = uniqueEmail('cust-role');
    const customer = await request(app).post('/api/auth/register').send({
      name: 'Customer',
      email: customerEmail,
      password: 'secret12',
    });

    const customerDenied = await request(miniApp)
      .get('/manager-area')
      .set('Authorization', `Bearer ${customer.body.data.token}`);

    expect(customerDenied.status).toBe(403);

    const manager = await User.create({
      name: 'Manager',
      email: uniqueEmail('mgr-role'),
      passwordHash: 'unused',
      role: 'manager',
    });
    const managerToken = jwt.sign(
      { userId: manager._id.toString(), role: 'manager' },
      env.jwtSecret,
      { expiresIn: '1h' }
    );

    const managerAllowed = await request(miniApp)
      .get('/manager-area')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(managerAllowed.status).toBe(200);
    expect(managerAllowed.body).toEqual({ ok: true });
  });
});
