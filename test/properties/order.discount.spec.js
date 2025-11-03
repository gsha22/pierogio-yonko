const { subtotal } = require('../../src/subtotal');
const { discounts } = require('../../src/discounts');
const { deliveryFee } = require('../../src/delivery');
const { tax } = require('../../src/tax');
const { total } = require('../../src/total');

describe('Deterministic pricing tests against README rules', () => {

  it('FIRST10 coupon should never produce a negative discount', () => {
    const order = {
      items: [
        { kind: 'frozen', sku: 'P12-POTATO', title: 'Pack', filling: 'potato', qty: 1, unitPriceCents: 2500, addOns: [] }
      ]
    };
    const profile = { tier: 'guest' };

    const d = discounts(order, profile, 'FIRST10');
    expect(Number.isInteger(d)).toBe(true);
    expect(d).toBeGreaterThanOrEqual(0);
  });

});
