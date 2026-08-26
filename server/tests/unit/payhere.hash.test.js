const {
  formatPayHereAmount,
  buildCheckoutHash,
  buildNotifySignature,
} = require('../../src/modules/payments/payhere.hash');

describe('payhere.hash', () => {
  it('formats minor units as two-decimal amounts', () => {
    expect(formatPayHereAmount(1080)).toBe('10.80');
    expect(formatPayHereAmount(0)).toBe('0.00');
  });

  it('builds a stable checkout hash', () => {
    const hash = buildCheckoutHash({
      merchantId: '123',
      orderId: 'BF-1',
      amount: '10.80',
      currency: 'LKR',
      merchantSecret: 'secret',
    });
    expect(hash).toMatch(/^[A-F0-9]{32}$/);
    expect(
      buildCheckoutHash({
        merchantId: '123',
        orderId: 'BF-1',
        amount: '10.80',
        currency: 'LKR',
        merchantSecret: 'secret',
      })
    ).toBe(hash);
  });

  it('builds notify signature including status_code', () => {
    const sig = buildNotifySignature({
      merchantId: '123',
      orderId: 'BF-1',
      payhereAmount: '10.80',
      payhereCurrency: 'LKR',
      statusCode: '2',
      merchantSecret: 'secret',
    });
    expect(sig).toMatch(/^[A-F0-9]{32}$/);
    expect(
      buildNotifySignature({
        merchantId: '123',
        orderId: 'BF-1',
        payhereAmount: '10.80',
        payhereCurrency: 'LKR',
        statusCode: '-2',
        merchantSecret: 'secret',
      })
    ).not.toBe(sig);
  });
});
