import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { readDiscountCost, singleDiscountCode, type DiscountCart } from "./cart-discounts";

const cart: DiscountCart = {
  discountCodes: [{ code: "iris27", applicable: true }],
  cost: { subtotalAmount: { amount: "249.00" } },
  discountAllocations: [{ discountedAmount: { amount: "24.90" } }],
  lines: { edges: [{ node: { cost: { subtotalAmount: { amount: "249.00" }, totalAmount: { amount: "249.00" } }, discountAllocations: [] } }] },
};
describe("Iris coupon cart rules", () => {
  it("uses Shopify's 10% allocation for a 249 ILS jewelry item", () => {
    assert.deepEqual(readDiscountCost(cart), { discountAmount: 24.9, merchandiseSubtotal: 249, merchandiseTotal: 224.1 });
  });
  it("does not discount 29.90 ILS delivery", () => {
    assert.equal(Math.round((readDiscountCost(cart).merchandiseTotal + 29.9) * 100) / 100, 254);
  });
  it("replaces rather than appends a coupon", () => {
    assert.deepEqual(singleDiscountCode(" iris27 "), ["iris27"]);
    assert.deepEqual(singleDiscountCode("GIFT10"), ["GIFT10"]);
    assert.deepEqual(singleDiscountCode(""), []);
  });
  it("does not infer a discount if Shopify returns none", () => {
    assert.equal(readDiscountCost({ ...cart, discountAllocations: [] }).merchandiseTotal, 249);
  });
  it("does not count a line-level allocation twice", () => {
    const lineCart: DiscountCart = { ...cart, cost: { subtotalAmount: { amount: "224.10" } }, discountAllocations: [], lines: { edges: [{ node: { cost: { subtotalAmount: { amount: "249" }, totalAmount: { amount: "224.10" } }, discountAllocations: [{ discountedAmount: { amount: "24.90" } }] } }] } };
    assert.deepEqual(readDiscountCost(lineCart), { discountAmount: 24.9, merchandiseSubtotal: 249, merchandiseTotal: 224.1 });
  });
});