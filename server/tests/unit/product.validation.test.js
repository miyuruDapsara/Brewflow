const {
  createProductSchema,
} = require('../../src/modules/products/product.validation');
const { INVENTORY_MODES } = require('../../src/modules/products/product.constants');
const mongoose = require('mongoose');

describe('product validation', () => {
  const categoryId = new mongoose.Types.ObjectId().toString();
  const inventoryItemId = new mongoose.Types.ObjectId().toString();

  it('accepts a valid STOCK_BASED product', () => {
    const { error } = createProductSchema.validate({
      categoryId,
      name: 'Chocolate Muffin',
      productType: 'BAKED_ITEM',
      basePrice: 350,
      inventoryMode: INVENTORY_MODES.STOCK_BASED,
      stockQuantity: 10,
    });

    expect(error).toBeUndefined();
  });

  it('rejects STOCK_BASED without stockQuantity', () => {
    const { error } = createProductSchema.validate({
      categoryId,
      name: 'Chocolate Muffin',
      productType: 'BAKED_ITEM',
      basePrice: 350,
      inventoryMode: INVENTORY_MODES.STOCK_BASED,
    });

    expect(error).toBeDefined();
  });

  it('accepts a valid RECIPE_BASED product with recipeItems', () => {
    const { error } = createProductSchema.validate({
      categoryId,
      name: 'Latte',
      productType: 'BEVERAGE',
      basePrice: 450,
      inventoryMode: INVENTORY_MODES.RECIPE_BASED,
      recipeItems: [
        {
          inventoryItemId,
          quantityRequired: 18,
          unit: 'g',
        },
      ],
      modifierGroups: [
        {
          name: 'Size',
          isRequired: true,
          minSelections: 1,
          selectionType: 'SINGLE',
          options: [
            { name: 'Small', priceAdjustment: 0 },
            { name: 'Large', priceAdjustment: 50 },
          ],
        },
      ],
    });

    expect(error).toBeUndefined();
  });

  it('rejects RECIPE_BASED without recipeItems', () => {
    const { error } = createProductSchema.validate({
      categoryId,
      name: 'Latte',
      productType: 'BEVERAGE',
      basePrice: 450,
      inventoryMode: INVENTORY_MODES.RECIPE_BASED,
      recipeItems: [],
    });

    expect(error).toBeDefined();
  });

  it('rejects non-positive basePrice', () => {
    const { error } = createProductSchema.validate({
      categoryId,
      name: 'Latte',
      productType: 'BEVERAGE',
      basePrice: 0,
      inventoryMode: INVENTORY_MODES.STOCK_BASED,
      stockQuantity: 1,
    });

    expect(error).toBeDefined();
  });
});
