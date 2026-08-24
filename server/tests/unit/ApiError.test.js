const ApiError = require('../../src/utils/ApiError');

describe('ApiError', () => {
  it('creates an error with status, code, and message', () => {
    const err = new ApiError(400, 'VALIDATION_ERROR', 'Invalid input');

    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('Invalid input');
  });

  it('exposes helpers for common HTTP errors', () => {
    expect(ApiError.badRequest('bad').statusCode).toBe(400);
    expect(ApiError.unauthorized().code).toBe('AUTHENTICATION_ERROR');
    expect(ApiError.forbidden().statusCode).toBe(403);
    expect(ApiError.notFound().code).toBe('NOT_FOUND');
    expect(ApiError.conflict('dup').statusCode).toBe(409);
    expect(ApiError.internal().statusCode).toBe(500);
  });
});
