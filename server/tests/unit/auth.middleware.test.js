const jwt = require('jsonwebtoken');
const express = require('express');
const request = require('supertest');
const authenticate = require('../../src/middleware/auth');
const errorMiddleware = require('../../src/middleware/error');
const { env } = require('../../src/config/env');
const User = require('../../src/modules/auth/user.model');
const {
  connectTestDb,
  clearTestUsers,
  disconnectTestDb,
  uniqueEmail,
} = require('../helpers/db');

function buildApp() {
  const app = express();
  app.get('/protected', authenticate, (req, res) => {
    res.status(200).json({ userId: req.user.id });
  });
  app.use(errorMiddleware);
  return app;
}

describe('authenticate middleware', () => {
  const app = buildApp();

  beforeAll(async () => {
    await connectTestDb();
  });

  afterEach(async () => {
    await clearTestUsers();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('returns 401 when Authorization header is missing', async () => {
    const response = await request(app).get('/protected');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('returns 401 for an invalid token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('returns 401 for an expired token', async () => {
    const user = await User.create({
      name: 'Expired',
      email: uniqueEmail('expired'),
      passwordHash: 'hash',
      role: 'customer',
    });

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      env.jwtSecret,
      { expiresIn: -1 }
    );

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it('attaches the user for a valid token', async () => {
    const user = await User.create({
      name: 'Valid',
      email: uniqueEmail('valid'),
      passwordHash: 'hash',
      role: 'customer',
    });

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      env.jwtSecret,
      { expiresIn: '1h' }
    );

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.userId).toBe(user._id.toString());
  });
});
