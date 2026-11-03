import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { advertisingAllowed, requiresAdvertisingConsent } from "./advertising-consent";
import { META_PIXEL_ID, STOREFRONT_EVENTS, commerceParameters } from "./meta-pixel";
describe("Royal Silver advertising rules", () => {
  it("uses the existing pixel only", () => assert.equal(META_PIXEL_ID, "2901339290228652"));
  it("leaves checkout and purchase events to Shopify to avoid duplicate reporting", () => {
    assert.deepEqual(STOREFRONT_EVENTS, ["PageView", "ViewContent", "AddToCart"]);
  });
  it("blocks regulated regions until acceptance", () => {
    assert.equal(advertisingAllowed("FR"), false);
    assert.equal(advertisingAllowed("FR", "accepted"), true);
  });
  it("blocks unresolved regions until acceptance", () => {
    for (const region of [null, "XX", "T1"]) assert.equal(advertisingAllowed(region), false);
  });
  it("does not show the regional prompt for Israel by default", () => {
    assert.equal(requiresAdvertisingConsent("IL"), false);
    assert.equal(advertisingAllowed("IL"), true);
  });
  it("honors withdrawal and applicable opt-outs in all regions", () => {
    assert.equal(advertisingAllowed("IL", "rejected"), false);
    assert.equal(advertisingAllowed("FR", "accepted", true), false);
  });
  it("reports original Shopify variant identity, quantity and actual item price", () => {
    const value = commerceParameters([{ variantId: "gid://shopify/ProductVariant/68229565251805", price: { amount: "399.0", currencyCode: "ILS" }, quantity: 2 }]);
    assert.deepEqual(value.content_ids, ["68229565251805"]);
    assert.equal(value.value, 798); assert.equal(value.currency, "ILS"); assert.equal(value.num_items, 2);
  });
});