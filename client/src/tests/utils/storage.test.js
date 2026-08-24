/**
 * @jest-environment jsdom
 */

const {
  getToken,
  setToken,
  clearToken,
} = require('../../utils/storage');
const { STORAGE_KEYS } = require('../../utils/constants');

describe('storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('stores and reads the auth token', () => {
    setToken('abc123');
    expect(getToken()).toBe('abc123');
    expect(window.localStorage.getItem(STORAGE_KEYS.TOKEN)).toBe('abc123');
  });

  it('clears the auth token', () => {
    setToken('abc123');
    clearToken();
    expect(getToken()).toBeNull();
  });
});
