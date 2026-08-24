/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

const CategoryTabs = require('../../components/products/CategoryTabs').default;

describe('CategoryTabs', () => {
  it('renders All plus category names and calls onChange', () => {
    const onChange = jest.fn();

    let tree;
    act(() => {
      tree = TestRenderer.create(
        React.createElement(CategoryTabs, {
          categories: [
            { id: 'c1', name: 'Drinks' },
            { id: 'c2', name: 'Food' },
          ],
          selectedId: null,
          onChange,
        })
      );
    });

    const buttons = tree.root.findAllByType('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0].children.join('')).toBe('All');
    expect(buttons[1].children.join('')).toBe('Drinks');

    act(() => {
      buttons[1].props.onClick();
    });

    expect(onChange).toHaveBeenCalledWith('c1');
  });
});
