const asyncHandler = require('../../src/utils/asyncHandler');

describe('asyncHandler', () => {
  it('forwards resolved handlers without calling next with an error', async () => {
    const next = jest.fn();
    const handler = asyncHandler(async (req, res) => {
      res.done = true;
    });
    const res = {};

    await handler({}, res, next);

    expect(res.done).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it('passes rejected errors to next', async () => {
    const next = jest.fn();
    const error = new Error('boom');
    const handler = asyncHandler(async () => {
      throw error;
    });

    await handler({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
