const InventoryItem = require('../../src/modules/inventory/inventoryItem.model');
const Product = require('../../src/modules/products/product.model');
const Order = require('../../src/modules/orders/order.model');
const inventoryService = require('../../src/modules/inventory/inventory.service');
const { INVENTORY_MODES } = require('../../src/modules/products/product.constants');
const {
  connectTestDb,
  clearCatalogData,
  clearTestUsers,
  disconnectTestDb,
  createManagerToken,
} = require('../helpers/db');
const Category = require('../../src/modules/categories/category.model');

describe('inventory.service deduct/restore', () => {
  let category;

  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearCatalogData();
    await clearTestUsers();
    category = await Category.create({
      name: 'Coffee',
      categoryType: 'BEVERAGE',
      displayOrder: 1,
    });
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('deducts STOCK_BASED once and restores on cancel', async () => {
    const product = await Product.create({
      categoryId: category._id,
      name: 'Muffin',
      productType: 'FOOD',
      basePrice: 300,
      inventoryMode: INVENTORY_MODES.STOCK_BASED,
      stockQuantity: 10,
      isAvailable: true,
      isActive: true,
    });

    const order = await Order.create({
      customerId: (await createManagerToken()).user._id,
      orderNumber: `BF-INV-${Date.now()}`,
      orderType: 'PICKUP',
      status: 'PLACED',
      paymentStatus: 'SUCCEEDED',
      inventoryDeducted: false,
      subtotal: 300,
      tax: 24,
      discount: 0,
      total: 324,
      items: [
        {
          productId: product._id,
          name: 'Muffin',
          productType: 'FOOD',
          basePrice: 300,
          quantity: 2,
          selectedModifiers: [],
          notes: '',
          unitPrice: 300,
          lineTotal: 600,
        },
      ],
    });

    await inventoryService.deductForOrder(order);
    const after = await Product.findById(product._id);
    expect(after.stockQuantity).toBe(8);
    expect(order.inventoryDeducted).toBe(true);

    await inventoryService.deductForOrder(order);
    const again = await Product.findById(product._id);
    expect(again.stockQuantity).toBe(8);

    await inventoryService.restoreForOrder(order);
    const restored = await Product.findById(product._id);
    expect(restored.stockQuantity).toBe(10);
    expect(order.inventoryDeducted).toBe(false);
  });

  it('deducts RECIPE_BASED ingredients', async () => {
    const milk = await InventoryItem.create({
      name: 'Milk',
      unit: 'ml',
      currentQuantity: 1000,
      reorderLevel: 200,
    });

    const product = await Product.create({
      categoryId: category._id,
      name: 'Latte',
      productType: 'BEVERAGE',
      basePrice: 400,
      inventoryMode: INVENTORY_MODES.RECIPE_BASED,
      stockQuantity: 0,
      recipeItems: [
        {
          inventoryItemId: milk._id,
          quantityRequired: 200,
          unit: 'ml',
        },
      ],
      isAvailable: true,
      isActive: true,
    });

    const order = await Order.create({
      customerId: (await createManagerToken()).user._id,
      orderNumber: `BF-RCP-${Date.now()}`,
      orderType: 'PICKUP',
      status: 'PLACED',
      paymentStatus: 'SUCCEEDED',
      subtotal: 400,
      tax: 32,
      discount: 0,
      total: 432,
      items: [
        {
          productId: product._id,
          name: 'Latte',
          productType: 'BEVERAGE',
          basePrice: 400,
          quantity: 2,
          selectedModifiers: [],
          notes: '',
          unitPrice: 400,
          lineTotal: 800,
        },
      ],
    });

    await inventoryService.deductForOrder(order);
    const updated = await InventoryItem.findById(milk._id);
    expect(updated.currentQuantity).toBe(600);
  });

  it('rejects adjust that would go negative', async () => {
    const item = await InventoryItem.create({
      name: 'Sugar',
      unit: 'g',
      currentQuantity: 5,
      reorderLevel: 10,
    });
    const manager = await createManagerToken();

    await expect(
      inventoryService.adjustStock(
        item._id.toString(),
        { type: 'MANUAL_ADJUSTMENT', quantityChange: -10, notes: '' },
        manager.user._id
      )
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('lists low stock when quantity <= reorderLevel', async () => {
    await InventoryItem.create({
      name: 'Beans',
      unit: 'g',
      currentQuantity: 50,
      reorderLevel: 100,
      isActive: true,
    });
    await InventoryItem.create({
      name: 'Cups',
      unit: 'pcs',
      currentQuantity: 200,
      reorderLevel: 50,
      isActive: true,
    });

    const low = await inventoryService.listLowStock();
    expect(low).toHaveLength(1);
    expect(low[0].name).toBe('Beans');
  });
});
