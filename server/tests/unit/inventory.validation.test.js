const mongoose = require('mongoose');
const {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  adjustInventorySchema,
  idParamSchema,
} = require('../../src/modules/inventory/inventory.validation');

describe('inventory validation', () => {
  it('accepts a valid create inventory item payload', () => {
    const { error, value } = createInventoryItemSchema.validate({
      name: 'Whole milk',
      unit: 'ml',
      currentQuantity: 1000,
      reorderLevel: 200,
    });

    expect(error).toBeUndefined();
    expect(value.name).toBe('Whole milk');
  });

  it('rejects short names and negative quantities on create', () => {
    expect(
      createInventoryItemSchema.validate({ name: 'A', unit: 'ml' }).error
    ).toBeDefined();
    expect(
      createInventoryItemSchema.validate({
        name: 'Milk',
        unit: 'ml',
        currentQuantity: -1,
      }).error
    ).toBeDefined();
  });

  it('requires at least one field on update', () => {
    expect(updateInventoryItemSchema.validate({}).error).toBeDefined();
    expect(
      updateInventoryItemSchema.validate({ reorderLevel: 50 }).error
    ).toBeUndefined();
  });

  it('accepts adjust payloads and rejects zero change', () => {
    expect(
      adjustInventorySchema.validate({
        type: 'RESTOCK',
        quantityChange: 10,
      }).error
    ).toBeUndefined();

    expect(
      adjustInventorySchema.validate({
        type: 'RESTOCK',
        quantityChange: 0,
      }).error
    ).toBeDefined();

    expect(
      adjustInventorySchema.validate({
        type: 'UNKNOWN',
        quantityChange: 1,
      }).error
    ).toBeDefined();
  });

  it('validates id params', () => {
    const id = new mongoose.Types.ObjectId().toString();
    expect(idParamSchema.validate({ id }).error).toBeUndefined();
    expect(idParamSchema.validate({ id: 'bad' }).error).toBeDefined();
  });
});
