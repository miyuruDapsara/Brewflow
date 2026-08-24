const mongoose = require('mongoose');
const {
  calculateOrderPricing,
  generateOrderNumber,
} = require('../../src/modules/orders/order.calculator');
const Product = require('../../src/modules/products/product.model');

function makeProduct(overrides = {}) {
  const sizeGroupId = new mongoose.Types.ObjectId();
  const smallId = new mongoose.Types.ObjectId();
  const largeId = new mongoose.Types.ObjectId();

  return {
    _id: new mongoose.Types.ObjectId(),
    name: 'Latte',
    productType: 'BEVERAGE',
    basePrice: 400,
    isActive: true,
    isAvailable: true,
    inventoryMode: 'STOCK_BASED',
    stockQuantity: 10,
    recipeItems: [],
    modifierGroups: [
      {
        _id: sizeGroupId,
        name: 'Size',
        isRequired: true,
        minSelections: 1,
        selectionType: 'SINGLE',
        options: [
          { _id: smallId, name: 'Small', priceAdjustment: 0 },
          { _id: largeId, name: 'Large', priceAdjustment: 100 },
        ],
      },
    ],
    ...overrides,
    _sizeGroupId: sizeGroupId,
    _smallId: smallId,
    _largeId: largeId,
  };
}

describe('order.calculator', () => {
  it('prices from DB and ignores client price fields', () => {
    const product = makeProduct();
    const result = calculateOrderPricing(
      [product],
      [
        {
          productId: product._id.toString(),
          quantity: 2,
          selectedModifiers: [
            {
              groupId: product._sizeGroupId.toString(),
              optionId: product._largeId.toString(),
              priceAdjustment: 9999,
            },
          ],
        },
      ],
      0.08
    );

    expect(result.items[0].unitPrice).toBe(500);
    expect(result.items[0].lineTotal).toBe(1000);
    expect(result.subtotal).toBe(1000);
    expect(result.tax).toBe(80);
    expect(result.total).toBe(1080);
  });

  it('rejects unavailable products', () => {
    const product = makeProduct({ stockQuantity: 0 });
    expect(Product.isProductAvailable(product)).toBe(false);

    expect(() =>
      calculateOrderPricing(
        [product],
        [
          {
            productId: product._id.toString(),
            quantity: 1,
            selectedModifiers: [
              {
                groupId: product._sizeGroupId.toString(),
                optionId: product._smallId.toString(),
              },
            ],
          },
        ],
        0.08
      )
    ).toThrow(/unavailable/i);
  });

  it('rejects missing required modifiers', () => {
    const product = makeProduct();
    expect(() =>
      calculateOrderPricing(
        [product],
        [
          {
            productId: product._id.toString(),
            quantity: 1,
            selectedModifiers: [],
          },
        ],
        0.08
      )
    ).toThrow(/at least 1/i);
  });

  it('generates an order number with BF prefix', () => {
    expect(generateOrderNumber()).toMatch(/^BF-\d{8}-[A-Z0-9]+$/);
  });
});
