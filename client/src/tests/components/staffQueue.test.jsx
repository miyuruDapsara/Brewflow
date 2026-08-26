/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

const ActiveOrderQueue =
  require('../../components/staff/ActiveOrderQueue').default;
const StaffOrderCard =
  require('../../components/staff/StaffOrderCard').default;
const StaffStats = require('../../components/staff/StaffStats').default;

const sampleOrder = {
  id: 'o1',
  orderNumber: 'BF-100',
  orderType: 'PICKUP',
  status: 'PLACED',
  total: 1080,
  items: [
    {
      id: 'i1',
      name: 'Latte',
      quantity: 1,
      lineTotal: 1000,
      selectedModifiers: [
        { groupId: 'g1', optionId: 'opt1', groupName: 'Size', optionName: 'Small' },
      ],
      notes: 'Extra hot',
    },
  ],
};

describe('staff queue components', () => {
  it('ActiveOrderQueue shows empty state when there are no orders', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(ActiveOrderQueue, { orders: [] })
      );
    });

    expect(JSON.stringify(tree.toJSON())).toContain('No active orders');
  });

  it('StaffOrderCard renders order number, modifiers, and notes', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(StaffOrderCard, { order: sampleOrder })
      );
    });

    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('BF-100');
    expect(body).toContain('Latte');
    expect(body).toContain('Size');
    expect(body).toContain('Small');
    expect(body).toContain('Extra hot');
    expect(body).toContain('Start preparing');
  });

  it('StaffStats shows counts by status', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(StaffStats, {
          counts: { PLACED: 2, PREPARING: 1, READY: 0 },
        })
      );
    });

    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain('2');
    expect(body).toContain('1');
    expect(body).toContain('Placed');
  });
});
