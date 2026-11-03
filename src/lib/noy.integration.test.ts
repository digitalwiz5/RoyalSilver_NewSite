import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { PRETTY_TO_REAL_HANDLE } from "./handles";
import { SHOPIFY_STOREFRONT_URL, SHOPIFY_STOREFRONT_TOKEN } from "./shopify";

describe("Existing Noy set commerce preservation", () => {
  it("keeps the existing product, variant and 399 ILS price", async () => {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN },
      body: JSON.stringify({ query: `query ($handle: String!) { productByHandle(handle: $handle) { id variants(first: 10) { edges { node { id sku price { amount currencyCode } } } } } }`, variables: { handle: PRETTY_TO_REAL_HANDLE["סט-נוי"] } }),
    });
    assert.equal(response.ok, true);
    const result = await response.json();
    assert.equal(result.errors, undefined);
    const product = result.data.productByHandle;
    assert.equal(product.id, "gid://shopify/Product/9644243353821");
    assert.equal(product.variants.edges.length, 1);
    const variant = product.variants.edges[0].node;
    assert.equal(variant.id, "gid://shopify/ProductVariant/48479508496605");
    assert.equal(variant.sku, null);
    assert.equal(Number(variant.price.amount), 399);
    assert.equal(variant.price.currencyCode, "ILS");
  });
});