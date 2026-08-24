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

  it('explains network failures when there is no response', () => {
    expect(
      getErrorMessage({ message: 'Network Error' }, 'Unable to log in')
    ).toBe(
      'Cannot reach the server. Check that the API is running and try again.'
    );
  });

  it('explains generic 500 proxy failures', () => {
    expect(
      getErrorMessage({
        message: 'Request failed with status code 500',
        response: { status: 500, data: {} },
      })
    ).toBe('Server is temporarily unavailable. Please try again in a moment.');
  });
});
