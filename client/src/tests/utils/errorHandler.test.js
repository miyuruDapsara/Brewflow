const { getErrorMessage } = require('../../utils/errorHandler');

describe('getErrorMessage', () => {
  it('reads API error payloads', () => {
    expect(
      getErrorMessage({
        response: { data: { error: { message: 'Invalid email or password' } } },
      })
    ).toBe('Invalid email or password');
  });

  it('falls back to Error.message', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('uses the provided fallback', () => {
    expect(getErrorMessage(null, 'fallback')).toBe('fallback');
  });
});
