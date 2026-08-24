const {
  createCategorySchema,
  updateCategorySchema,
} = require('../../src/modules/categories/category.validation');

describe('category validation', () => {
  it('accepts a valid create payload', () => {
    const { error, value } = createCategorySchema.validate({
      name: 'Coffee',
      categoryType: 'BEVERAGE',
      description: 'Hot drinks',
    });

    expect(error).toBeUndefined();
    expect(value.name).toBe('Coffee');
  });

  it('rejects missing categoryType and short name', () => {
    const { error } = createCategorySchema.validate({
      name: 'A',
    });

    expect(error).toBeDefined();
  });

  it('requires at least one field on update', () => {
    const { error } = updateCategorySchema.validate({});
    expect(error).toBeDefined();
  });
});
