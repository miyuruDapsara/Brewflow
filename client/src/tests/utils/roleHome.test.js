const {
  getPostLoginPath,
  getDashboardPath,
} = require('../../utils/roleHome');

describe('roleHome', () => {
  it('getDashboardPath returns ops homes by role', () => {
    expect(getDashboardPath({ role: 'manager' })).toBe('/manager');
    expect(getDashboardPath({ role: 'staff' })).toBe('/staff');
    expect(getDashboardPath({ role: 'customer' })).toBeNull();
    expect(getDashboardPath(null)).toBeNull();
  });

  it('getPostLoginPath prefers fromPath then role home', () => {
    expect(getPostLoginPath({ role: 'manager' }, '/orders')).toBe('/orders');
    expect(getPostLoginPath({ role: 'staff' })).toBe('/staff');
    expect(getPostLoginPath({ role: 'manager' })).toBe('/manager');
    expect(getPostLoginPath({ role: 'customer' })).toBe('/account');
  });
});
