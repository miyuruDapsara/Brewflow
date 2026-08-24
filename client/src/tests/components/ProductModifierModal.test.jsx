/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

const ProductModifierModal =
  require('../../components/products/ProductModifierModal').default;

const product = {
  id: 'p1',
  name: 'Latte',
  basePrice: 400,
  modifierGroups: [
    {
      id: 'g-size',
      name: 'Size',
      isRequired: true,
      minSelections: 1,
      selectionType: 'SINGLE',
      options: [
        { id: 's', name: 'Small', priceAdjustment: 0 },
        { id: 'l', name: 'Large', priceAdjustment: 100 },
      ],
    },
  ],
};

describe('ProductModifierModal', () => {
  it('blocks add when required modifiers are missing', async () => {
    const onAdd = jest.fn();
    let tree;

    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(ProductModifierModal, {
          open: true,
          product,
          onClose: jest.fn(),
          onAdd,
        })
      );
    });

    const buttons = tree.root.findAllByType('button');
    const addButton = buttons.find((btn) =>
      btn.children.some((child) => child === 'Add to cart')
    );

    await act(async () => {
      addButton.props.onClick();
    });

    expect(onAdd).not.toHaveBeenCalled();
    const body = JSON.stringify(tree.toJSON());
    expect(body).toMatch(/Select at least 1/i);
  });

  it('adds to cart when required selection is made', async () => {
    const onAdd = jest.fn();
    const onClose = jest.fn();
    let tree;

    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(ProductModifierModal, {
          open: true,
          product,
          onClose,
          onAdd,
        })
      );
    });

    const radios = tree.root.findAllByType('input').filter(
      (node) => node.props.type === 'radio'
    );

    await act(async () => {
      radios[1].props.onChange();
    });

    const addButton = tree.root
      .findAllByType('button')
      .find((btn) => btn.children.some((child) => child === 'Add to cart'));

    await act(async () => {
      addButton.props.onClick();
    });

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        product,
        quantity: 1,
        selectedModifiers: [
          expect.objectContaining({
            optionId: 'l',
            optionName: 'Large',
            priceAdjustment: 100,
          }),
        ],
      })
    );
    expect(onClose).toHaveBeenCalled();
  });
});
