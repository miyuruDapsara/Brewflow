const { formatCurrency } = require('../../utils/formatCurrency');

describe('formatCurrency', () => {
  it('formats cents as USD', () => {
    expect(formatCurrency(450)).toBe('$4.50');
  });

  it('handles invalid values as zero', () => {
    expect(formatCurrency(NaN)).toBe('$0.00');
  });
});
