const { apiRateLimiter, authRateLimiter } = require('../../src/middleware/rateLimit');

describe('rateLimit middleware', () => {
  it('exports API and auth limiters as middleware functions', () => {
    expect(typeof apiRateLimiter).toBe('function');
    expect(typeof authRateLimiter).toBe('function');
  });
});
