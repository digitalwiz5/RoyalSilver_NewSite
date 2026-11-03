import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cartAddOns, giftPool, productFamily, productMinPrice } from "./gifts";
import type { ShopifyProduct } from "./shopify";

const make = (id: string, title: string, price: number, tags: string[] = ["נשים"], available = true): ShopifyProduct => ({
  node: {
    id, handle: id, title, description: "", tags,
    priceRange: { minVariantPrice: { amount: String(price), currencyCode: "ILS" } },
    images: { edges: [] },
    variants: { edges: [{ node: { id: `${id}-v`, title: "x", price: { amount: String(price), currencyCode: "ILS" }, availableForSale: available, selectedOptions: [] } }] },
    options: [],
  },
});

describe("gifts", () => {
  const pool = [make("n1", "שרשרת א", 199), make("n2", "שרשרת ב", 300), make("n3", "שרשרת ג", 400), make("m1", "צמיד גבר", 150, ["גברים"]), make("x1", "טבעת אזלה", 100, ["נשים"], false)];
  it("filters by recipient and price band and drops unavailable items", () => {
    assert.deepEqual(giftPool(pool, "her", "all").map((p) => p.node.id), ["n1", "n2", "n3"]);
    assert.deepEqual(giftPool(pool, "her", "mid").map((p) => p.node.id), ["n2"]);
    assert.deepEqual(giftPool(pool, "him", "low").map((p) => p.node.id), ["m1"]);
  });
  it("detects the jewelry family and min price", () => {
    assert.equal(productFamily("עגילי שי"), "עגיל");
    assert.equal(productMinPrice(pool[0]), 199);
  });
  it("suggests only other families for the same audience and never what is in the cart", () => {
    const catalog = [make("n1", "שרשרת א", 199), make("e1", "עגילי ב", 250), make("r1", "טבעת ג", 280), make("m1", "צמיד גבר", 150, ["גברים"]), make("e2", "עגילי אזלו", 100, ["נשים"], false)];
    const out = cartAddOns(catalog, [{ productId: "n1", handle: "n1", title: "שרשרת א", tags: ["נשים"] }]);
    assert.deepEqual(out.map((p) => p.node.id), ["e1", "r1"]);
    assert.deepEqual(cartAddOns(catalog, []), []);
  });
});
