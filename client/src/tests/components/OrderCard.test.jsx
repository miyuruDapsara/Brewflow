/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;
const { MemoryRouter } = require('react-router-dom');

const OrderCard = require('../../components/orders/OrderCard').default;

describe('OrderCard', () => {
  it('renders order number and total', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(OrderCard, {
            order: {
              id: 'o1',
              orderNumber: 'BF-20260824-ABC123',
              orderType: 'PICKUP',
              status: 'PLACED',
              total: 1080,
              items: [{ id: 'i1' }],
            },
          })
        )
      );
    });

    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('BF-20260824-ABC123');
    expect(body).toContain('$10.80');
  });
});
