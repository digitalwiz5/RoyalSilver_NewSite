import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { GA_MEASUREMENT_ID, gaItems } from "./google-analytics";

describe("Google Analytics", () => {
  it("uses the Royal Silver GA4 property", () => assert.equal(GA_MEASUREMENT_ID, "G-BED7CYTM2Z"));
  it("reports the numeric Shopify variant ID, price and quantity", () => {
    assert.deepEqual(
      gaItems([
        {
          variantId: "gid://shopify/ProductVariant/123",
          price: { amount: "189.0", currencyCode: "ILS" },
          quantity: 2,
        },
      ]),
      [{ item_id: "123", price: 189, quantity: 2 }],
    );
  });
});
