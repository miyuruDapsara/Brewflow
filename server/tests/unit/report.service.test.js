const Category = require('../../src/modules/categories/category.model');
const Product = require('../../src/modules/products/product.model');
const Order = require('../../src/modules/orders/order.model');
const InventoryItem = require('../../src/modules/inventory/inventoryItem.model');
const reportService = require('../../src/modules/reports/report.service');
const {
  connectTestDb,
  clearCatalogData,
  clearTestUsers,
  disconnectTestDb,
  createCustomerToken,
} = require('../helpers/db');

describe('report.service', () => {
  let category;
  let product;
  let customer;

  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearCatalogData();
    await clearTestUsers();
    customer = await createCustomerToken();

    category = await Category.create({
      name: 'Coffee',
      categoryType: 'BEVERAGE',
      displayOrder: 1,
    });

    product = await Product.create({
      categoryId: category._id,
      name: 'Latte',
      productType: 'BEVERAGE',
      basePrice: 400,
      inventoryMode: 'STOCK_BASED',
      stockQuantity: 10,
      isAvailable: true,
      isActive: true,
    });

    await Order.create({
      customerId: customer.user._id,
      orderNumber: `BF-RPT-U-${Date.now()}`,
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

    await InventoryItem.create({
      name: 'Espresso beans',
      unit: 'g',
      currentQuantity: 100,
      reorderLevel: 200,
      isActive: true,
    });
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('resolveDateRange defaults to last 7 days when from/to omitted', () => {
    const { start, end } = reportService.resolveDateRange({});
    expect(end.getTime()).toBeGreaterThanOrEqual(start.getTime());
    expect(end.getTime() - start.getTime()).toBeGreaterThanOrEqual(
      6 * 24 * 60 * 60 * 1000
    );
  });

  it('getSalesReport summarizes succeeded non-cancelled revenue', async () => {
    const report = await reportService.getSalesReport({});
    expect(report.summary.orderCount).toBe(1);
    expect(report.summary.revenue).toBe(432);
    expect(report.series.length).toBeGreaterThanOrEqual(1);
    expect(report.categorySales[0].name).toBe('Coffee');
  });

  it('getProductReport ranks units sold', async () => {
    const report = await reportService.getProductReport({});
    expect(report.products).toHaveLength(1);
    expect(report.products[0].name).toBe('Latte');
    expect(report.products[0].unitsSold).toBe(2);
    expect(report.products[0].revenue).toBe(800);
  });

  it('getInventoryReport flags low stock items', async () => {
    const report = await reportService.getInventoryReport();
    expect(report.summary.totalItems).toBe(1);
    expect(report.summary.lowStockCount).toBe(1);
    expect(report.items[0].isLowStock).toBe(true);
  });
});
