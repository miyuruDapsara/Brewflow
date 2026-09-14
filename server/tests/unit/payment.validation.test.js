const mongoose = require('mongoose');
const {
  checkoutSessionSchema,
} = require('../../src/modules/payments/payment.validation');

describe('payment validation', () => {
  it('accepts a valid checkout orderId', () => {
    const orderId = new mongoose.Types.ObjectId().toString();
    const { error, value } = checkoutSessionSchema.validate({ orderId });

    expect(error).toBeUndefined();
    expect(value.orderId).toBe(orderId);
  });

  it('rejects missing or malformed orderId', () => {
    expect(checkoutSessionSchema.validate({}).error).toBeDefined();
    expect(
      checkoutSessionSchema.validate({ orderId: 'not-an-object-id' }).error
    ).toBeDefined();
    expect(
      checkoutSessionSchema.validate({ orderId: 'abc' }).error
    ).toBeDefined();
  });
});
