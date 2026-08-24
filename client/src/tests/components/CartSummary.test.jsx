/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

const CartSummary = require('../../components/cart/CartSummary').default;

describe('CartSummary', () => {
  it('renders item count and formatted subtotal', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(CartSummary, {
          subtotal: 1250,
          itemCount: 3,
        })
      );
    });

    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('3');
    expect(body).toContain('$12.50');
    expect(body).toContain('Subtotal');
  });
});
