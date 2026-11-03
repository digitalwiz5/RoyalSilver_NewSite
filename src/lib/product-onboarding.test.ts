import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { collectPages, fetchCatalogProduct, fetchCategoryProducts } from "./shopify-catalog";
import { exactVariant, requiresProductSelection, variantGalleryImages, variantShownByPrimaryImage } from "./product-presentation";
import type { ShopifyProduct } from "./shopify";

function product(): ShopifyProduct["node"] {
  return { id: "1", handle: "one", title: "תכשיט", description: "", priceRange: { minVariantPrice: { amount: "269", currencyCode: "ILS" } },
    images: { edges: [{ node: { url: "model", altText: "זהב" } }, { node: { url: "silver", altText: "זהב" } }] },
    variants: { edges: ["כסף", "זהב"].map((value, i) => ({ node: { id: String(i), title: value, image: { url: i ? "gold" : "silver", altText: "" }, price: { amount: "269", currencyCode: "ILS" }, availableForSale: i === 0, selectedOptions: [{ name: "צבע", value }] } })) },
    options: [{ name: "צבע", values: ["כסף", "זהב"] }] };
}
describe("batch onboarding", () => {
  it("loads beyond 50 products without duplicate identities or lost source order", async () => {
    const edges = await collectPages(async after => ({ edges: Array.from({ length: 50 }, (_, i) => ({ node: { id: String(i + (after ? 49 : 0)) } })), pageInfo: { hasNextPage: !after, endCursor: "page2" } }), node => node.id);
    assert.equal(edges.length, 99);
    assert.equal(edges[50].node.id, "50");
    assert.equal(edges[98].node.id, "98");
  });
  it("rejects repeated cursors rather than looping or silently truncating", async () => {
    await assert.rejects(collectPages(async () => ({ edges: [], pageInfo: { hasNextPage: true, endCursor: "same" } }), () => ""), /cursor/);
  });
  it("requires selection for two colors but keeps single-variant quick add", () => {
    const p = product(); assert.equal(requiresProductSelection(p), true);
    p.options[0].values = ["כסף"]; assert.equal(requiresProductSelection(p), false);
  });
  it("never substitutes a variant for a nonexistent combination", () => {
    const variants = product().variants.edges.map(e => e.node);
    assert.equal(exactVariant(variants, { צבע: "רוז גולד" }), undefined);
    assert.equal(exactVariant(variants, { צבע: "זהב" })?.availableForSale, false);
    assert.equal(exactVariant(variants, { צבע: "כסף" })?.id, "0");
  });
  it("maps media from Shopify relationships regardless of ALT and preserves card source order", () => {
    const p = product(); const images = variantGalleryImages(p, p.variants.edges[0].node);
    assert.equal(images[0].node.url, "silver");
    assert.equal(p.images.edges[0].node.url, "model");
    assert.equal(variantShownByPrimaryImage(p), undefined);
    p.images.edges[0].node.url = "silver";
    assert.equal(variantShownByPrimaryImage(p)?.id, "0");
  });
});

describe("live Shopify onboarding pilot", () => {
  it("retains imported Noga and Lia identities, full options and live prices", async () => {
    const [lia, noga, rings] = await Promise.all([fetchCatalogProduct("טבעת-כסף-זרקון-ריבוע"), fetchCatalogProduct("טבעת-כסף-7-זרקונים"), fetchCategoryProducts("tag:'טבעות נשים'")]);
    assert.equal(lia?.id, "gid://shopify/Product/15436229705949");
    assert.equal(noga?.id, "gid://shopify/Product/15436229804253");
    assert.equal(lia?.variants.edges.length, 3);
    assert.equal(noga?.variants.edges.length, 5);
    assert.equal(noga?.variants.edges.find(e => e.node.sku === "JRW1236-7")?.node.id, "gid://shopify/ProductVariant/68213748826333");
    assert.equal(noga?.variants.edges.find(e => e.node.sku === "JRW1236-7")?.node.price.amount, "249.0");
    assert.equal(rings.filter(e => e.node.id === noga?.id).length, 1);
  });
});