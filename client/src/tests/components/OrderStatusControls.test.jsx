/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

const OrderStatusControls =
  require('../../components/staff/OrderStatusControls').default;

describe('OrderStatusControls', () => {
  it('shows only next legal transitions for PLACED', async () => {
    const onStatusChange = jest.fn();
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(OrderStatusControls, {
          status: 'PLACED',
          onStatusChange,
        })
      );
    });

    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('Start preparing');
    expect(body).toContain('Cancel');
    expect(body).not.toContain('Mark ready');
    expect(body).not.toContain('Complete');
  });

  it('does not allow skipping from PREPARING to COMPLETED', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(OrderStatusControls, { status: 'PREPARING' })
      );
    });

    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('Mark ready');
    expect(body).not.toContain('Complete');
  });

  it('shows no actions for COMPLETED', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(OrderStatusControls, { status: 'COMPLETED' })
      );
    });

    expect(JSON.stringify(tree.toJSON())).toContain('No further actions');
  });
});
