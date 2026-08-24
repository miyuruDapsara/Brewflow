const Product = require('../../src/modules/products/product.model');
const { isProductAvailable } = require('../../src/modules/products/product.service');
const { INVENTORY_MODES } = require('../../src/modules/products/product.constants');
const mongoose = require('mongoose');

describe('product availability helper', () => {
  it('returns false when inactive or unavailable', () => {
    expect(
      isProductAvailable({
        isActive: false,
        isAvailable: true,
        inventoryMode: INVENTORY_MODES.STOCK_BASED,
        stockQuantity: 5,
      })
    ).toBe(false);

    expect(
      isProductAvailable({
        isActive: true,
        isAvailable: false,
        inventoryMode: INVENTORY_MODES.STOCK_BASED,
        stockQuantity: 5,
      })
    ).toBe(false);
  });

  it('requires stock for STOCK_BASED products', () => {
    expect(
      isProductAvailable({
        isActive: true,
        isAvailable: true,
        inventoryMode: INVENTORY_MODES.STOCK_BASED,
        stockQuantity: 0,
      })
    ).toBe(false);

    expect(
      isProductAvailable({
        isActive: true,
        isAvailable: true,
        inventoryMode: INVENTORY_MODES.STOCK_BASED,
        stockQuantity: 2,
      })
    ).toBe(true);
  });

  it('requires recipeItems for RECIPE_BASED products', () => {
    expect(
      isProductAvailable({
        isActive: true,
        isAvailable: true,
        inventoryMode: INVENTORY_MODES.RECIPE_BASED,
        recipeItems: [],
      })
    ).toBe(false);

    expect(
      isProductAvailable({
        isActive: true,
        isAvailable: true,
        inventoryMode: INVENTORY_MODES.RECIPE_BASED,
        recipeItems: [
          {
            inventoryItemId: new mongoose.Types.ObjectId(),
            quantityRequired: 1,
            unit: 'g',
          },
        ],
      })
    ).toBe(true);
  });

  it('exposes the same helper on the Product model', () => {
    expect(
      Product.isProductAvailable({
        isActive: true,
        isAvailable: true,
        inventoryMode: INVENTORY_MODES.STOCK_BASED,
        stockQuantity: 1,
      })
    ).toBe(true);
  });
});
