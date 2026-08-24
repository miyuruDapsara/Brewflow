const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Category = require('../../src/modules/categories/category.model');
const Product = require('../../src/modules/products/product.model');
const {
  connectTestDb,
  clearCatalogData,
  clearTestUsers,
  disconnectTestDb,
  createManagerToken,
} = require('../helpers/db');

describe('products API integration', () => {
  let managerToken;
  let category;

  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearCatalogData();
    await clearTestUsers();
    const manager = await createManagerToken();
    managerToken = manager.token;
    category = await Category.create({
      name: 'Coffee',
      categoryType: 'BEVERAGE',
      displayOrder: 1,
    });
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('creates STOCK_BASED and RECIPE_BASED products with modifiers', async () => {
    const stock = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        categoryId: category._id.toString(),
        name: 'Chocolate Muffin',
        productType: 'BAKED_ITEM',
        basePrice: 350,
        inventoryMode: 'STOCK_BASED',
        stockQuantity: 12,
      });

    expect(stock.status).toBe(201);
    expect(stock.body.data.product.stockQuantity).toBe(12);
    expect(stock.body.data.product.isCurrentlyAvailable).toBe(true);

    const recipe = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        categoryId: category._id.toString(),
        name: 'Latte',
        productType: 'BEVERAGE',
        basePrice: 450,
        inventoryMode: 'RECIPE_BASED',
        recipeItems: [
          {
            inventoryItemId: new mongoose.Types.ObjectId().toString(),
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
              { name: 'Large', priceAdjustment: 75 },
            ],
          },
        ],
      });

    expect(recipe.status).toBe(201);
    expect(recipe.body.data.product.modifierGroups).toHaveLength(1);
    expect(recipe.body.data.product.recipeItems).toHaveLength(1);
  });

  it('rejects products with a missing categoryId reference', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        categoryId: new mongoose.Types.ObjectId().toString(),
        name: 'Ghost Drink',
        productType: 'BEVERAGE',
        basePrice: 400,
        inventoryMode: 'STOCK_BASED',
        stockQuantity: 1,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('lists only active products and supports categoryId filter', async () => {
    const other = await Category.create({
      name: 'Snacks',
      categoryType: 'FOOD',
      displayOrder: 2,
    });

    await Product.create([
      {
        categoryId: category._id,
        name: 'Latte',
        productType: 'BEVERAGE',
        basePrice: 450,
        inventoryMode: 'STOCK_BASED',
        stockQuantity: 5,
        isActive: true,
      },
      {
        categoryId: category._id,
        name: 'Hidden Latte',
        productType: 'BEVERAGE',
        basePrice: 450,
        inventoryMode: 'STOCK_BASED',
        stockQuantity: 5,
        isActive: false,
      },
      {
        categoryId: other._id,
        name: 'Cookie',
        productType: 'BAKED_ITEM',
        basePrice: 200,
        inventoryMode: 'STOCK_BASED',
        stockQuantity: 8,
        isActive: true,
      },
    ]);

    const all = await request(app).get('/api/products');
    expect(all.status).toBe(200);
    expect(all.body.data.products).toHaveLength(2);

    const filtered = await request(app).get(
      `/api/products?categoryId=${category._id}`
    );
    expect(filtered.status).toBe(200);
    expect(filtered.body.data.products).toHaveLength(1);
    expect(filtered.body.data.products[0].name).toBe('Latte');
  });

  it('gets, updates, and deletes a product as manager', async () => {
    const created = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        categoryId: category._id.toString(),
        name: 'Americano',
        productType: 'BEVERAGE',
        basePrice: 300,
        inventoryMode: 'STOCK_BASED',
        stockQuantity: 4,
      });

    const id = created.body.data.product.id;

    const got = await request(app).get(`/api/products/${id}`);
    expect(got.status).toBe(200);
    expect(got.body.data.product.name).toBe('Americano');

    const updated = await request(app)
      .put(`/api/products/${id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        basePrice: 325,
        isAvailable: false,
      });

    expect(updated.status).toBe(200);
    expect(updated.body.data.product.basePrice).toBe(325);
    expect(updated.body.data.product.isAvailable).toBe(false);
    expect(updated.body.data.product.isCurrentlyAvailable).toBe(false);

    const deleted = await request(app)
      .delete(`/api/products/${id}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(deleted.status).toBe(200);

    const missing = await request(app).get(`/api/products/${id}`);
    expect(missing.status).toBe(404);
  });
});
