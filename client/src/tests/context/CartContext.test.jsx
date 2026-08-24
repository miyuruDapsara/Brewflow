/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

const { CartProvider } = require('../../context/CartContext');
const useCart = require('../../hooks/useCart').default;
const { STORAGE_KEYS } = require('../../utils/constants');

function Probe({ onValue }) {
  const value = useCart();
  React.useEffect(() => {
    onValue(value);
  }, [value, onValue]);
  return null;
}

const latte = {
  id: 'p1',
  name: 'Latte',
  productType: 'BEVERAGE',
  basePrice: 400,
  isCurrentlyAvailable: true,
};

describe('CartContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('adds, merges matching modifiers, caps quantity, and removes items', async () => {
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

    const mods = [
      {
        groupId: 'g1',
        groupName: 'Size',
        optionId: 'l',
        optionName: 'Large',
        priceAdjustment: 100,
      },
    ];

    await act(async () => {
      latest.addItem({
        product: latte,
        selectedModifiers: mods,
        quantity: 2,
      });
    });

    expect(latest.items).toHaveLength(1);
    expect(latest.itemCount).toBe(2);
    expect(latest.subtotal).toBe(1000);

    await act(async () => {
      latest.addItem({
        product: latte,
        selectedModifiers: mods,
        quantity: 9,
      });
    });

    expect(latest.items[0].quantity).toBe(10);
    expect(latest.itemCount).toBe(10);

    const stored = JSON.parse(
      window.localStorage.getItem(STORAGE_KEYS.CART)
    );
    expect(stored).toHaveLength(1);

    const lineId = latest.items[0].lineId;

    await act(async () => {
      latest.removeItem(lineId);
    });

    expect(latest.items).toHaveLength(0);
    expect(latest.itemCount).toBe(0);
  });

  it('rejects unavailable products', async () => {
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

    expect(() =>
      latest.addItem({
        product: { ...latte, isCurrentlyAvailable: false },
        selectedModifiers: [],
        quantity: 1,
      })
    ).toThrow(/unavailable/i);
  });
});
