const Joi = require('joi');
const validate = require('../../src/middleware/validate');
const ApiError = require('../../src/utils/ApiError');

describe('validate middleware', () => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  it('replaces the request property with validated values', () => {
    const middleware = validate(schema, 'body');
    const req = { body: { email: 'a@b.com', extra: true } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(req.body).toEqual({ email: 'a@b.com' });
    expect(next).toHaveBeenCalledWith();
  });

  it('forwards an ApiError when validation fails', () => {
    const middleware = validate(schema, 'body');
    const req = { body: {} };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details[0].field).toBe('email');
  });
});
