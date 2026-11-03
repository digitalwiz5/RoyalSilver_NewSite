import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { eitanImages, eitanImageIndexForColor } from "./eitan";
import { mergeGalleryImages } from "./product-presentation";
const closeup = "https://cdn.shopify.com/files/F49B7EFB-8810-45A8-BF5C-013DE5B1C2B9.png?v=1";
const image = (url: string) => ({ node: { url, altText: null } });
const product = {
  images: { edges: [image(closeup), image("rose"), image("silver"), image("black"), image("gold")] },
  variants: { edges: ["silver", "black", "gold", "rose"].map((url, i) => ({ node: { sku: `JBM1216-${i + 1}`, image: image(url).node } })) },
};
describe("Eitan catalog and gallery integrity", () => {
  it("retains every live Shopify image including clicked catalog close-up in source order", () => {
    assert.deepEqual(eitanImages(product).slice(0, 5), product.images.edges);
  });
  it("preserves all six approved existing images including separate full Lior portrait", () => {
    const urls = eitanImages(product).map(x => x.node.url);
    assert.equal(urls.length, 11);
    assert.ok(urls.some(url => url.endsWith("/eitan-lior-rose.webp")));
    assert.ok(urls.some(url => url.endsWith("/eitan-black-hand.webp")));
  });
  it("selects original catalog close-up for verified rose-black", () => {
    assert.equal(eitanImages(product)[eitanImageIndexForColor(product, "רוז שחור")]?.node.url, closeup);
  });
  for (const [color, url] of [["שחור", "black"], ["כסף שחור", "silver"], ["זהב שחור", "gold"]]) {
    it(`selects live SKU-linked image for ${color}`, () => {
      assert.equal(eitanImages(product)[eitanImageIndexForColor(product, color)]?.node.url, url);
    });
  }
  it("includes new synchronized media rather than a fixed closed image list", () => {
    assert.equal(eitanImages({ ...product, images: { edges: [image("new-model"), ...product.images.edges] } })[0]?.node.url, "new-model");
  });
  it("deduplicates identical files with different version parameters without hiding distinct photos", () => {
    assert.deepEqual(mergeGalleryImages([image("photo?v=1")], [image("photo?v=2"), image("portrait")]).map(x => x.node.url), ["photo?v=1", "portrait"]);
  });
});