import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { liorGalleryImages } from "./lior";

const hand = "https://cdn.shopify.com/files/ADFEE098-D066-4B05-90B2-2372722DA1A9.png?v=2";
const image = (url: string) => ({ node: { url, altText: null } });
const product = {
  images: { edges: [image(hand), image("silver?v=2"), image("black?v=2"), image("silver-detail")] },
  variants: { edges: [
    { node: { sku: "JBM1215-1", image: image("black?v=2").node, selectedOptions: [{ name: "צבע", value: "שחור" }] } },
    { node: { sku: "JBM1215-2", image: image("silver?v=2").node, selectedOptions: [{ name: "צבע", value: "כסף" }] } },
    { node: { sku: "JBM1215-2", image: image("silver-detail").node, selectedOptions: [{ name: "צבע", value: "כסף" }] } },
  ] },
};
describe("Lior colour galleries", () => {
  it("leads silver with the approved hand and retains every matching linked photo", () => {
    assert.deepEqual(liorGalleryImages(product, "כסף").map(x => x.node.url), [hand, "silver?v=2", "silver-detail"]);
  });
  it("black contains only black media, never silver model or product photos", () => {
    assert.deepEqual(liorGalleryImages(product, "שחור").map(x => x.node.url), ["black?v=2"]);
  });
  it("resolves changed variant images after supplier sync, not saved product URLs", () => {
    const synced = { images: { edges: [image(hand), image("new-silver")] }, variants: { edges: [
      { node: { sku: "JBM1215-2", image: image("new-silver").node, selectedOptions: [{ name: "צבע", value: "כסף" }] } },
    ] } };
    assert.deepEqual(liorGalleryImages(synced, "כסף").map(x => x.node.url), [hand, "new-silver"]);
  });
  it("keeps the unchanged approved hand when a sync removes its Shopify media", () => {
    const images = liorGalleryImages({ ...product, images: { edges: [] } }, "כסף");
    assert.ok(images[0]?.node.url.endsWith("/lior-silver-hand.png"));
    assert.deepEqual(images.slice(1).map(x => x.node.url), ["silver?v=2", "silver-detail"]);
  });
  it("does not offer images for unknown colours", () => {
    assert.deepEqual(liorGalleryImages(product, "זהב"), []);
  });
});