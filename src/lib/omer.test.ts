import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { guyImages, guyImageIndexForColor } from "./omer";

describe("Guy live variant media", () => {
  const product = {
    images: { edges: ["black-current", "silver-current", "gold-current"].map(url => ({ node: { url, altText: null } })) },
    variants: { edges: [
      { node: { sku: "JNM1139-1", image: { url: "silver-current", altText: null } } },
      { node: { sku: "JNM1139-2", image: { url: "black-current", altText: null } } },
      { node: { sku: "JNM1139-3", image: { url: "gold-current", altText: null } } },
    ] },
  };
  it("uses current SKU-linked media once in silver/black/gold order", () => {
    assert.deepEqual(guyImages(product).map(({ node }) => node.url), ["silver-current", "black-current", "gold-current"]);
  });
  for (const [color, index] of [["כסף", 0], ["שחור", 1], ["זהב", 2]] as const) {
    it(`selects the correct image for ${color}`, () => {
      assert.equal(guyImageIndexForColor(product, color), index);
    });
  }
  it("keeps live gallery images when a variant image is missing", () => {
    assert.deepEqual(guyImages({ ...product, variants: { edges: [] } }), product.images.edges);
  });
});