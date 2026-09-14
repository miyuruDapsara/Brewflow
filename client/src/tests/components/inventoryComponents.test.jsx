/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

const StockBadge = require('../../components/inventory/StockBadge').default;
const LowStockList =
  require('../../components/inventory/LowStockList').default;
const InventoryForm =
  require('../../components/inventory/InventoryForm').default;
const InventoryTable =
  require('../../components/inventory/InventoryTable').default;

describe('inventory components', () => {
  it('StockBadge shows Low when at or below reorder', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(StockBadge, {
          quantity: 5,
          reorderLevel: 10,
        })
      );
    });
    expect(JSON.stringify(tree.toJSON())).toContain('Low');
  });

  it('LowStockList shows empty state', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(LowStockList, { items: [] })
      );
    });
    expect(JSON.stringify(tree.toJSON())).toContain('No low-stock items');
  });

  it('InventoryForm submits trimmed create payload', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(InventoryForm, { onSubmit })
      );
    });

    const inputs = tree.root.findAllByType('input');
    const nameInput = inputs[0];
    const unitInput = inputs[1];
    const qtyInput = inputs[2];
    const reorderInput = inputs[3];
    const form = tree.root.findByType('form');

    await act(async () => {
      nameInput.props.onChange({ target: { value: '  Milk  ' } });
      unitInput.props.onChange({ target: { value: 'ml' } });
      qtyInput.props.onChange({ target: { value: '500' } });
      reorderInput.props.onChange({ target: { value: '100' } });
    });

    await act(async () => {
      await form.props.onSubmit({ preventDefault() {} });
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Milk',
      unit: 'ml',
      currentQuantity: 500,
      reorderLevel: 100,
    });
  });

  it('InventoryTable calls onAdjust for an item', async () => {
    const onAdjust = jest.fn();
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(InventoryTable, {
          items: [
            {
              id: 'inv-1',
              name: 'Beans',
              unit: 'g',
              currentQuantity: 50,
              reorderLevel: 100,
            },
          ],
          onAdjust,
        })
      );
    });

    expect(JSON.stringify(tree.toJSON())).toContain('Beans');

    const buttons = tree.root.findAllByType('button');
    const adjustBtn = buttons.find(
      (b) =>
        typeof b.props.children === 'string' &&
        b.props.children.includes('Adjust')
    );
    expect(adjustBtn).toBeTruthy();

    await act(async () => {
      adjustBtn.props.onClick();
    });

    expect(onAdjust).toHaveBeenCalledWith('inv-1', {
      type: 'RESTOCK',
      quantityChange: 10,
      notes: '',
    });
  });

  it('InventoryTable shows empty state', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(InventoryTable, { items: [] })
      );
    });
    expect(JSON.stringify(tree.toJSON())).toContain('No inventory items');
  });
});
