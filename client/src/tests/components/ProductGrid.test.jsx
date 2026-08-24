/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;
const { MemoryRouter } = require('react-router-dom');

const ProductGrid = require('../../components/products/ProductGrid').default;

describe('ProductGrid', () => {
  it('shows empty state when there are no products', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(ProductGrid, { products: [] })
        )
      );
    });

    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('No products to show');
  });

  it('renders a card for each product', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(ProductGrid, {
            products: [
              {
                id: 'p1',
                name: 'Latte',
                productType: 'DRINK',
                basePrice: 500,
                isCurrentlyAvailable: true,
              },
              {
                id: 'p2',
                name: 'Muffin',
                productType: 'FOOD',
                basePrice: 350,
                isCurrentlyAvailable: true,
              },
            ],
          })
        )
      );
    });

    const headings = tree.root.findAllByType('h3');
    expect(headings.map((node) => node.children.join(''))).toEqual([
      'Latte',
      'Muffin',
    ]);
  });
});
