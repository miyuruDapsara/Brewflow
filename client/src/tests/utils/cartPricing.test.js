const {
  buildSelectedModifiers,
  clampQuantity,
  computeLineTotal,
  computeSubtotal,
  computeUnitPrice,
  sameModifierSelection,
  validateModifierSelection,
} = require('../../utils/cartPricing');

const sizeGroup = {
  id: 'g-size',
  name: 'Size',
  isRequired: true,
  minSelections: 1,
  selectionType: 'SINGLE',
  options: [
    { id: 's', name: 'Small', priceAdjustment: 0 },
    { id: 'l', name: 'Large', priceAdjustment: 100 },
  ],
};

const addonGroup = {
  id: 'g-addon',
  name: 'Add-ons',
  isRequired: false,
  selectionType: 'MULTIPLE',
  options: [
    { id: 'shot', name: 'Extra shot', priceAdjustment: 50 },
    { id: 'syrup', name: 'Syrup', priceAdjustment: 40 },
  ],
};

describe('cartPricing', () => {
  it('computes unit price, line total, and subtotal', () => {
    const mods = [{ priceAdjustment: 100 }, { priceAdjustment: 50 }];
    expect(computeUnitPrice(400, mods)).toBe(550);
    expect(computeLineTotal(400, mods, 2)).toBe(1100);
    expect(
      computeSubtotal([
        { basePrice: 400, selectedModifiers: mods, quantity: 2 },
        { basePrice: 300, selectedModifiers: [], quantity: 1 },
      ])
    ).toBe(1400);
  });

  it('compares modifier selections ignoring order', () => {
    expect(
      sameModifierSelection(
        [
          { optionId: 'a' },
          { optionId: 'b' },
        ],
        [{ optionId: 'b' }, { optionId: 'a' }]
      )
    ).toBe(true);
    expect(
      sameModifierSelection([{ optionId: 'a' }], [{ optionId: 'b' }])
    ).toBe(false);
  });

  it('clamps quantity between 1 and 10', () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(15)).toBe(10);
    expect(clampQuantity(3)).toBe(3);
  });

  it('requires a selection for required SINGLE groups', () => {
    const result = validateModifierSelection([sizeGroup], {});
    expect(result.valid).toBe(false);
    expect(result.errors['g-size']).toMatch(/at least 1/i);
  });

  it('accepts valid SINGLE + MULTIPLE selections', () => {
    const selection = {
      'g-size': ['l'],
      'g-addon': ['shot', 'syrup'],
    };
    const result = validateModifierSelection(
      [sizeGroup, addonGroup],
      selection
    );
    expect(result.valid).toBe(true);

    const built = buildSelectedModifiers([sizeGroup, addonGroup], selection);
    expect(built).toHaveLength(3);
    expect(built[0].optionName).toBe('Large');
  });

  it('rejects more than one option for SINGLE groups', () => {
    const result = validateModifierSelection([sizeGroup], {
      'g-size': ['s', 'l'],
    });
    expect(result.valid).toBe(false);
    expect(result.errors['g-size']).toMatch(/only one/i);
  });
});
