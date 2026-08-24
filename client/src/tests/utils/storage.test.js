/**
 * @jest-environment jsdom
 */

const {
  getToken,
  setToken,
  clearToken,
  getCart,
  setCart,
  clearCartStorage,
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

  it('stores and reads the cart', () => {
    const items = [{ lineId: '1', productId: 'p1', quantity: 2 }];
    setCart(items);
    expect(getCart()).toEqual(items);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.CART))).toEqual(
      items
    );
  });

  it('clears the cart and returns empty array for bad JSON', () => {
    setCart([{ lineId: '1' }]);
    clearCartStorage();
    expect(getCart()).toEqual([]);

    window.localStorage.setItem(STORAGE_KEYS.CART, '{not-json');
    expect(getCart()).toEqual([]);
  });
});
