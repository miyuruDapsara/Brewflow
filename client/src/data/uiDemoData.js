/**
 * CLIENT-ONLY UI preview data.
 * Does NOT write to MongoDB or call the API for these payloads.
 *
 * Toggle: set VITE_UI_DEMO=false in vite.config / env to use real API only.
 * Remove this file + imports when seed data (Phase 20) fills the app.
 */

import { PRODUCT_IMAGE_PLACEHOLDER } from './demoContent';

export const UI_DEMO_CATEGORIES = [
  {
    id: 'demo-cat-coffee',
    name: 'Coffee',
    categoryType: 'BEVERAGE',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'demo-cat-tea',
    name: 'Tea',
    categoryType: 'BEVERAGE',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'demo-cat-pastry',
    name: 'Pastries',
    categoryType: 'FOOD',
    displayOrder: 3,
    isActive: true,
  },
];

const sizeGroup = {
  id: 'demo-mod-size',
  name: 'Size',
  isRequired: true,
  minSelections: 1,
  selectionType: 'SINGLE',
  options: [
    { id: 'demo-opt-s', name: 'Small', priceAdjustment: 0 },
    { id: 'demo-opt-l', name: 'Large', priceAdjustment: 75 },
  ],
};

export const UI_DEMO_PRODUCTS = [
  {
    id: 'demo-prod-latte',
    categoryId: 'demo-cat-coffee',
    name: 'Latte',
    productType: 'BEVERAGE',
    basePrice: 450,
    imageUrl:
      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
    inventoryMode: 'RECIPE_BASED',
    stockQuantity: 0,
    recipeItems: [],
    isAvailable: true,
    isActive: true,
    isCurrentlyAvailable: true,
    modifierGroups: [sizeGroup],
  },
  {
    id: 'demo-prod-americano',
    categoryId: 'demo-cat-coffee',
    name: 'Americano',
    productType: 'BEVERAGE',
    basePrice: 350,
    imageUrl:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    inventoryMode: 'STOCK_BASED',
    stockQuantity: 40,
    recipeItems: [],
    isAvailable: true,
    isActive: true,
    isCurrentlyAvailable: true,
    modifierGroups: [sizeGroup],
  },
  {
    id: 'demo-prod-chai',
    categoryId: 'demo-cat-tea',
    name: 'Chai Latte',
    productType: 'BEVERAGE',
    basePrice: 400,
    imageUrl: PRODUCT_IMAGE_PLACEHOLDER,
    inventoryMode: 'STOCK_BASED',
    stockQuantity: 25,
    recipeItems: [],
    isAvailable: true,
    isActive: true,
    isCurrentlyAvailable: true,
    modifierGroups: [],
  },
  {
    id: 'demo-prod-muffin',
    categoryId: 'demo-cat-pastry',
    name: 'Blueberry Muffin',
    productType: 'BAKED_ITEM',
    basePrice: 300,
    imageUrl:
      'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=600&q=80',
    inventoryMode: 'STOCK_BASED',
    stockQuantity: 12,
    recipeItems: [],
    isAvailable: true,
    isActive: true,
    isCurrentlyAvailable: true,
    modifierGroups: [],
  },
];

export const UI_DEMO_ORDERS = [
  {
    id: 'demo-order-1',
    orderNumber: 'BF-DEMO-1001',
    orderType: 'PICKUP',
    status: 'PLACED',
    paymentStatus: 'SUCCEEDED',
    inventoryDeducted: true,
    subtotal: 900,
    tax: 72,
    discount: 0,
    total: 972,
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 'demo-line-1',
        productId: 'demo-prod-latte',
        name: 'Latte',
        productType: 'BEVERAGE',
        quantity: 2,
        basePrice: 450,
        unitPrice: 450,
        lineTotal: 900,
        selectedModifiers: [
          {
            groupId: 'demo-mod-size',
            groupName: 'Size',
            optionId: 'demo-opt-s',
            optionName: 'Small',
            priceAdjustment: 0,
          },
        ],
        notes: 'Extra hot',
      },
    ],
  },
  {
    id: 'demo-order-2',
    orderNumber: 'BF-DEMO-1002',
    orderType: 'DINE_IN',
    status: 'PREPARING',
    paymentStatus: 'SUCCEEDED',
    inventoryDeducted: true,
    subtotal: 300,
    tax: 24,
    discount: 0,
    total: 324,
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 'demo-line-2',
        productId: 'demo-prod-muffin',
        name: 'Blueberry Muffin',
        productType: 'BAKED_ITEM',
        quantity: 1,
        basePrice: 300,
        unitPrice: 300,
        lineTotal: 300,
        selectedModifiers: [],
        notes: '',
      },
    ],
  },
  {
    id: 'demo-order-3',
    orderNumber: 'BF-DEMO-1003',
    orderType: 'PICKUP',
    status: 'READY',
    paymentStatus: 'SUCCEEDED',
    inventoryDeducted: true,
    subtotal: 350,
    tax: 28,
    discount: 0,
    total: 378,
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 'demo-line-3',
        productId: 'demo-prod-americano',
        name: 'Americano',
        productType: 'BEVERAGE',
        quantity: 1,
        basePrice: 350,
        unitPrice: 350,
        lineTotal: 350,
        selectedModifiers: [],
        notes: '',
      },
    ],
  },
];

export const UI_DEMO_INVENTORY = [
  {
    id: 'demo-inv-milk',
    name: 'Whole milk',
    unit: 'ml',
    currentQuantity: 2400,
    reorderLevel: 500,
    isActive: true,
    isLowStock: false,
  },
  {
    id: 'demo-inv-beans',
    name: 'Espresso beans',
    unit: 'g',
    currentQuantity: 180,
    reorderLevel: 400,
    isActive: true,
    isLowStock: true,
  },
  {
    id: 'demo-inv-cups',
    name: 'Paper cups',
    unit: 'pcs',
    currentQuantity: 85,
    reorderLevel: 100,
    isActive: true,
    isLowStock: true,
  },
];

export const UI_DEMO_SALES_REPORT = {
  range: { from: new Date().toISOString(), to: new Date().toISOString() },
  groupBy: 'day',
  summary: { revenue: 16740, orderCount: 18 },
  series: [
    { period: '2026-08-25', revenue: 4200, orderCount: 5 },
    { period: '2026-08-26', revenue: 6100, orderCount: 7 },
    { period: '2026-08-27', revenue: 6440, orderCount: 6 },
  ],
  categorySales: [
    { categoryId: 'demo-cat-coffee', name: 'Coffee', revenue: 9800 },
    { categoryId: 'demo-cat-pastry', name: 'Pastries', revenue: 4200 },
    { categoryId: 'demo-cat-tea', name: 'Tea', revenue: 2740 },
  ],
  failedPayments: 2,
  cancellations: 1,
};

export const UI_DEMO_PRODUCT_REPORT = {
  products: [
    {
      productId: 'demo-prod-latte',
      name: 'Latte',
      unitsSold: 42,
      revenue: 18900,
    },
    {
      productId: 'demo-prod-muffin',
      name: 'Blueberry Muffin',
      unitsSold: 28,
      revenue: 8400,
    },
    {
      productId: 'demo-prod-americano',
      name: 'Americano',
      unitsSold: 19,
      revenue: 6650,
    },
  ],
};

export const UI_DEMO_INVENTORY_REPORT = {
  items: UI_DEMO_INVENTORY,
  summary: {
    totalItems: UI_DEMO_INVENTORY.length,
    lowStockCount: UI_DEMO_INVENTORY.filter((i) => i.isLowStock).length,
  },
};

export function getDemoProductById(id) {
  return UI_DEMO_PRODUCTS.find((p) => p.id === id) || null;
}

export function getDemoOrderById(id) {
  return UI_DEMO_ORDERS.find((o) => o.id === id) || null;
}

export function getDemoProducts(categoryId) {
  if (!categoryId) {
    return UI_DEMO_PRODUCTS;
  }
  return UI_DEMO_PRODUCTS.filter((p) => p.categoryId === categoryId);
}
