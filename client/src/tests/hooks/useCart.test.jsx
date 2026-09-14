/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

const { CartProvider } = require('../../context/CartContext');
const useCart = require('../../hooks/useCart').default;

function Probe({ onValue }) {
  const value = useCart();
  React.useEffect(() => {
    onValue(value);
  }, [value, onValue]);
  return null;
}

describe('useCart', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('exposes CartContext values when wrapped in CartProvider', async () => {
    let latest;
    await act(async () => {
      TestRenderer.create(
        React.createElement(
          CartProvider,
          null,
          React.createElement(Probe, {
            onValue: (value) => {
              latest = value;
            },
          })
        )
      );
    });

    expect(Array.isArray(latest.items)).toBe(true);
    expect(typeof latest.addItem).toBe('function');
    expect(typeof latest.removeItem).toBe('function');
    expect(typeof latest.clearCart).toBe('function');
  });
});
