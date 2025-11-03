const fc = require('fast-check');

const { subtotal } = require('../../src/subtotal');
const { discounts } = require('../../src/discounts');
const { total } = require('../../src/total');
const { tax } = require('../../src/tax');
const { delivery } = require('../../src/delivery');

// These arbitrary generators provide primitive building blocks for constructing orders and contexts in property-based tests
//
// To learn more about primitives: https://fast-check.dev/docs/core-blocks/arbitraries/primitives
// To learn more about combiners: https://fast-check.dev/docs/core-blocks/arbitraries/combiners
const skuArb = fc.constantFrom('P6-POTATO', 'P12-POTATO', 'P24-POTATO', 'P6-SAUER', 'P12-SAUER');
const addOnArb = fc.constantFrom('sour-cream', 'fried-onion', 'bacon-bits');
const fillingArb = fc.constantFrom('potato', 'sauerkraut', 'sweet-cheese', 'mushroom');
const kindArb = fc.constantFrom('hot', 'frozen');
const tierArb = fc.constantFrom('guest', 'regular', 'vip');
const zoneArb = fc.constantFrom('local', 'outer');

// This composite arbitrary generator builds an order item object using the primitive building blocks defined above
// Each field in the object below specifies the arbitrary generator to use for that field
//
// To learn more about composite arbitraries: https://fast-check.dev/docs/core-blocks/arbitraries/composites
const orderItemArb = fc.record({
  // e.g., this will use the kindArb to generate a value for the 'kind' field
  kind: kindArb,
  sku: skuArb,
  title: fc.string(),
  filling: fillingArb,
  qty: fc.constantFrom(6, 12, 24),
  unitPriceCents: fc.integer({ min: 500, max: 3000 }),
  addOns: fc.array(addOnArb, { maxLength: 3 })
});

// We use the orderItemArb defined above to build an order object that contains an array of order items
const orderArb = fc.record({
  // we specify the maximum and minimum length of the items array here
  items: fc.array(orderItemArb, { minLength: 1, maxLength: 5 })
});

// Context arbitrary for discounts/tax/delivery/total
const contextArb = fc.record({
  tier: tierArb,
  zone: zoneArb,
  // whether the customer requested delivery; when false, delivery fee should be 0
  isDelivery: fc.boolean(),
  // extra flags that implementation might or might not use
  hasCoupon: fc.boolean()
});

// ------------------------------------------------------------------------------
// To test discounts, tax, delivery and total, you will need to add more
// arbitraries to represent the context in which an order is placed.
//
// You will find the following building blocks helpful:
//
// fc.boolean() - to represent true/false flags
// fc.constantFrom(...) - to represent enumerated values
// fc.record({ ... }) - to build composite objects
// fc.optional(...) - to represent optional fields
// ------------------------------------------------------------------------------


describe('Property-Based Tests for Orders', () => {
  describe('Invariants', () => {
    
    // Here's an example preservation property!
    it('subtotal should always be non-negative integer', () => {
      fc.assert(
        fc.property(orderArb, (order) => {
          const result = subtotal(order);
          return result >= 0 && Number.isInteger(result);
        }),
        { numRuns: 50 }
      );
    });

    // ---------------------------------------------------------------------------
    // Add more invariant properties for discounts, tax, delivery, and total here
    // You can adapt the starter code below.
    // Feel free to copy, paste, and modify as needed multiple times.
    // ---------------------------------------------------------------------------
    //

    // ...existing code...
    it('discounted price should always be less than the actual price', () => {
      fc.assert(
        fc.property(
          orderArb,
          contextArb,
          fc.constantFrom(null, 'PIEROGI-BOGO', 'FIRST10'),
          (order, ctx, couponCode) => {
            const profile = { tier: ctx.tier };
            const sub = subtotal(order);
            const discountAmount = discounts(order, profile, couponCode);
            const discountedPrice = sub - discountAmount;
            // discounted price should not exceed subtotal and must be non-negative
            return discountedPrice <= sub && discountedPrice >= 0 && Number.isInteger(discountAmount);
          }
        ),
        { numRuns: 100 }
      );
    });

    
  });
});