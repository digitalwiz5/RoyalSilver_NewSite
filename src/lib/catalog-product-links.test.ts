import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { catalogProductDestination } from "./catalog-product-links";

describe("Catalog product destinations", () => {
  it("keeps Hila on the exact requested product page, not the homepage", () => {
    assert.equal(catalogProductDestination("צמיד-כסף-זיג-זג"), `/product/${encodeURIComponent("צמיד-כסף-זיג-זג")}`);
  });
  it("resolves Noga's original Shopify handle to the existing public page", () => {
    assert.equal(catalogProductDestination("טבעת-כסף-7-זרקונים"), `/product/${encodeURIComponent("טבעת-נוגה")}`);
  });
  it("resolves Noy's original Shopify handle to the existing public page", () => {
    assert.equal(catalogProductDestination("סט-תכשיטים-זרקונים-4-חלקים"), `/product/${encodeURIComponent("סט-נוי")}`);
  });
  it("keeps variant and advertising query parameters unchanged", () => {
    const search = "?variant=68229570134237&utm_source=facebook&fbclid=example";
    assert.equal(catalogProductDestination("צמיד-כסף-זיג-זג", search), `/product/${encodeURIComponent("צמיד-כסף-זיג-זג")}${search}`);
  });
  it("handles future Shopify products without a manual mapping", () => {
    assert.equal(catalogProductDestination("future-product"), "/product/future-product");
  });
});