/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

const SalesSummary = require('../../components/reports/SalesSummary').default;
const PopularProducts =
  require('../../components/reports/PopularProducts').default;
const CategorySales = require('../../components/reports/CategorySales').default;
const ReportFilters = require('../../components/reports/ReportFilters').default;
const InventoryReport =
  require('../../components/reports/InventoryReport').default;

describe('report components', () => {
  it('SalesSummary shows revenue and series', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(SalesSummary, {
          summary: { revenue: 1080, orderCount: 2 },
          failedPayments: 1,
          cancellations: 0,
          series: [{ period: '2026-08-01', revenue: 1080, orderCount: 2 }],
        })
      );
    });
    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('2026-08-01');
    expect(body).toContain('Failed pays');
  });

  it('PopularProducts and CategorySales empty states', async () => {
    let popular;
    let cats;
    await act(async () => {
      popular = TestRenderer.create(
        React.createElement(PopularProducts, { products: [] })
      );
      cats = TestRenderer.create(
        React.createElement(CategorySales, { categorySales: [] })
      );
    });
    expect(JSON.stringify(popular.toJSON())).toContain('No product sales');
    expect(JSON.stringify(cats.toJSON())).toContain('No category sales');
  });

  it('ReportFilters renders Apply', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(ReportFilters, {
          from: '2026-08-01',
          to: '2026-08-07',
          groupBy: 'day',
          onChange: jest.fn(),
          onApply: jest.fn(),
        })
      );
    });
    expect(JSON.stringify(tree.toJSON())).toContain('Apply');
  });

  it('InventoryReport shows summary and item names', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(InventoryReport, {
          report: {
            summary: { totalItems: 1, lowStockCount: 1 },
            items: [
              {
                id: 'i1',
                name: 'Espresso beans',
                unit: 'g',
                currentQuantity: 50,
                reorderLevel: 100,
              },
            ],
          },
        })
      );
    });
    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('Espresso beans');
    expect(body).toContain('items ·');
    expect(body).toContain('low stock');
  });
});
