/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

const OrderStatusBadge =
  require('../../components/orders/OrderStatusBadge').default;

describe('OrderStatusBadge', () => {
  it('renders the status label', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(OrderStatusBadge, { status: 'PLACED' })
      );
    });

    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('PLACED');
  });
});
