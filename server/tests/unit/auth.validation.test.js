const {
  registerSchema,
  loginSchema,
} = require('../../src/modules/auth/auth.validation');

describe('auth validation', () => {
  it('accepts a valid register payload', () => {
    const { error, value } = registerSchema.validate({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret1',
    });

    expect(error).toBeUndefined();
    expect(value.email).toBe('ada@example.com');
  });

  it('rejects short name, invalid email, and short password', () => {
    const { error } = registerSchema.validate({
      name: 'A',
      email: 'bad',
      password: '123',
    });

    expect(error).toBeDefined();
    expect(error.details.length).toBeGreaterThan(0);
  });

  it('accepts a valid login payload', () => {
    const { error } = loginSchema.validate({
      email: 'ada@example.com',
      password: 'secret1',
    });

    expect(error).toBeUndefined();
  });

  it('rejects login without password', () => {
    const { error } = loginSchema.validate({
      email: 'ada@example.com',
    });

    expect(error).toBeDefined();
  });
});
