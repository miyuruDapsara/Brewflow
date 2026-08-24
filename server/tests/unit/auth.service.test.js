const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authService = require('../../src/modules/auth/auth.service');
const User = require('../../src/modules/auth/user.model');
const { env } = require('../../src/config/env');
const {
  connectTestDb,
  clearTestUsers,
  disconnectTestDb,
  uniqueEmail,
} = require('../helpers/db');

describe('auth.service', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterEach(async () => {
    await clearTestUsers();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('hashes the password and returns a JWT with userId and role', async () => {
    const email = uniqueEmail('svc-register');
    const result = await authService.register({
      name: 'Test User',
      email,
      password: 'secret12',
    });

    expect(result.user.email).toBe(email);
    expect(result.user.role).toBe('customer');
    expect(result.user.passwordHash).toBeUndefined();
    expect(result.token).toBeDefined();

    const stored = await User.findOne({ email }).select('+passwordHash');
    expect(stored.passwordHash).not.toBe('secret12');
    expect(await bcrypt.compare('secret12', stored.passwordHash)).toBe(true);

    const payload = jwt.verify(result.token, env.jwtSecret);
    expect(payload.userId).toBe(result.user.id);
    expect(payload.role).toBe('customer');
  });

  it('rejects login with the wrong password', async () => {
    const email = uniqueEmail('svc-login');
    await authService.register({
      name: 'Test User',
      email,
      password: 'secret12',
    });

    await expect(
      authService.login({ email, password: 'wrong-password' })
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'AUTHENTICATION_ERROR',
    });
  });

  it('ignores client-provided role and always registers as customer', async () => {
    const email = uniqueEmail('svc-role');
    const result = await authService.register({
      name: 'Hacker',
      email,
      password: 'secret12',
      role: 'manager',
    });

    expect(result.user.role).toBe('customer');
  });
});
