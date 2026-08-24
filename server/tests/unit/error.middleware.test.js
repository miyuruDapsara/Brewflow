const errorMiddleware = require('../../src/middleware/error');
const ApiError = require('../../src/utils/ApiError');

describe('error middleware', () => {
  function mockRes() {
    return {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };
  }

  it('formats ApiError responses', () => {
    const res = mockRes();
    const err = ApiError.badRequest('Invalid input', [
      { field: 'email', message: 'Email is required' },
    ]);

    errorMiddleware(err, {}, res, jest.fn());

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: [{ field: 'email', message: 'Email is required' }],
      },
    });
  });

  it('defaults unknown errors to 500', () => {
    const res = mockRes();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    errorMiddleware(new Error('boom'), {}, res, jest.fn());

    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
