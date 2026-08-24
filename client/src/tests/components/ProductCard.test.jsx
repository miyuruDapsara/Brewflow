/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;
const { MemoryRouter } = require('react-router-dom');

const ProductCard = require('../../components/products/ProductCard').default;

describe('ProductCard', () => {
  it('renders name, price, and availability', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(ProductCard, {
            product: {
              id: 'p1',
              name: 'Cappuccino',
              productType: 'DRINK',
              basePrice: 450,
              isCurrentlyAvailable: true,
            },
          })
        )
      );
    });

    const text = tree.root.findAllByType('h3')[0].children.join('');
    expect(text).toBe('Cappuccino');

    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('$4.50');
    expect(body).toContain('Available');
  });

  it('shows unavailable badge when not available', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(ProductCard, {
            product: {
              id: 'p2',
              name: 'Sold Out Drink',
              productType: 'DRINK',
              basePrice: 300,
              isCurrentlyAvailable: false,
            },
          })
        )
      );
    });

    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('Unavailable');
  });
});
