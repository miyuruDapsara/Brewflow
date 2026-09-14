const mongoose = require('mongoose');
const {
  createOrderSchema,
  updateStatusSchema,
} = require('../../src/modules/orders/order.validation');

describe('order validation', () => {
  const productId = new mongoose.Types.ObjectId().toString();
  const groupId = new mongoose.Types.ObjectId().toString();
  const optionId = new mongoose.Types.ObjectId().toString();

  it('accepts a valid create order payload', () => {
    const { error, value } = createOrderSchema.validate({
      orderType: 'PICKUP',
      items: [
        {
          productId,
          quantity: 2,
          selectedModifiers: [{ groupId, optionId }],
          notes: 'Extra hot',
        },
      ],
    });

    expect(error).toBeUndefined();
    expect(value.items[0].quantity).toBe(2);
  });

  it('rejects unknown fields and client prices on create', () => {
    const { error } = createOrderSchema.validate({
      orderType: 'PICKUP',
      items: [{ productId, quantity: 1, unitPrice: 999 }],
    });

    expect(error).toBeDefined();
  });

  it('rejects invalid orderType and quantity bounds', () => {
    expect(
      createOrderSchema.validate({
        orderType: 'DELIVERY',
        items: [{ productId, quantity: 1 }],
      }).error
    ).toBeDefined();

    expect(
      createOrderSchema.validate({
        orderType: 'PICKUP',
        items: [{ productId, quantity: 0 }],
      }).error
    ).toBeDefined();

    expect(
      createOrderSchema.validate({
        orderType: 'PICKUP',
        items: [{ productId, quantity: 11 }],
      }).error
    ).toBeDefined();
  });

  it('accepts valid status updates and rejects invalid status', () => {
    expect(updateStatusSchema.validate({ status: 'PREPARING' }).error).toBeUndefined();
    expect(updateStatusSchema.validate({ status: 'SKIPPED' }).error).toBeDefined();
    expect(updateStatusSchema.validate({}).error).toBeDefined();
  });
});
