const request = require('supertest');
const app = require('../../src/app');
const Category = require('../../src/modules/categories/category.model');
const Product = require('../../src/modules/products/product.model');
const {
  connectTestDb,
  clearCatalogData,
  clearTestUsers,
  disconnectTestDb,
  createManagerToken,
  createCustomerToken,
} = require('../helpers/db');

describe('categories API integration', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterEach(async () => {
    await clearCatalogData();
    await clearTestUsers();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('lists only active categories publicly, sorted by displayOrder', async () => {
    await Category.create([
      {
        name: 'Snacks',
        categoryType: 'FOOD',
        displayOrder: 2,
        isActive: true,
      },
      {
        name: 'Coffee',
        categoryType: 'BEVERAGE',
        displayOrder: 1,
        isActive: true,
      },
      {
        name: 'Hidden',
        categoryType: 'FOOD',
        displayOrder: 0,
        isActive: false,
      },
    ]);

    const response = await request(app).get('/api/categories');

    expect(response.status).toBe(200);
    expect(response.body.data.categories).toHaveLength(2);
    expect(response.body.data.categories.map((c) => c.name)).toEqual([
      'Coffee',
      'Snacks',
    ]);
  });

  it('allows managers to create, update, and delete categories', async () => {
    const { token } = await createManagerToken();

    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Tea',
        categoryType: 'BEVERAGE',
        description: 'Hot tea',
      });

    expect(created.status).toBe(201);
    expect(created.body.data.category.name).toBe('Tea');

    const updated = await request(app)
      .put(`/api/categories/${created.body.data.category.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isActive: false });

    expect(updated.status).toBe(200);
    expect(updated.body.data.category.isActive).toBe(false);

    const deleted = await request(app)
      .delete(`/api/categories/${created.body.data.category.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleted.status).toBe(200);
  });

  it('forbids customers from creating categories', async () => {
    const { token } = await createCustomerToken();

    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Tea',
        categoryType: 'BEVERAGE',
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
  });

  it('blocks deleting a category that still has active products', async () => {
    const { token } = await createManagerToken();
    const category = await Category.create({
      name: 'Baked',
      categoryType: 'BAKED_ITEM',
      displayOrder: 1,
    });

    await Product.create({
      categoryId: category._id,
      name: 'Muffin',
      productType: 'BAKED_ITEM',
      basePrice: 300,
      inventoryMode: 'STOCK_BASED',
      stockQuantity: 5,
      isActive: true,
    });

    const response = await request(app)
      .delete(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT_ERROR');
  });

  it('returns a public category by id when active', async () => {
    const category = await Category.create({
      name: 'Coffee',
      categoryType: 'BEVERAGE',
      displayOrder: 1,
    });

    const response = await request(app).get(`/api/categories/${category._id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.category.name).toBe('Coffee');
  });
});
