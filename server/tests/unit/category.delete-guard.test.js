const categoryService = require('../../src/modules/categories/category.service');
const Category = require('../../src/modules/categories/category.model');
const Product = require('../../src/modules/products/product.model');
const {
  connectTestDb,
  clearCatalogData,
  disconnectTestDb,
} = require('../helpers/db');

describe('category.service delete guard', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterEach(async () => {
    await clearCatalogData();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('throws conflict when active products still reference the category', async () => {
    const category = await Category.create({
      name: 'Coffee',
      categoryType: 'BEVERAGE',
      displayOrder: 1,
    });

    await Product.create({
      categoryId: category._id,
      name: 'Latte',
      productType: 'BEVERAGE',
      basePrice: 400,
      inventoryMode: 'STOCK_BASED',
      stockQuantity: 3,
      isActive: true,
    });

    await expect(categoryService.deleteCategory(category._id.toString())).rejects.toMatchObject({
      statusCode: 409,
      code: 'CONFLICT_ERROR',
    });
  });
});
