import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { materialsLines } from "./shopify-catalog";

describe("materials metafield", () => {
  it("returns the listed lines", () => {
    assert.deepEqual(materialsLines({ materials: { value: '["חומר: כסף 925","אבן: זירקון"]' } }), [
      "חומר: כסף 925",
      "אבן: זירקון",
    ]);
  });
  it("is empty when missing, blank or malformed", () => {
    assert.deepEqual(materialsLines({}), []);
    assert.deepEqual(materialsLines(null), []);
    assert.deepEqual(materialsLines({ materials: null }), []);
    assert.deepEqual(materialsLines({ materials: { value: "not json" } }), []);
    assert.deepEqual(materialsLines({ materials: { value: '["", "  "]' } }), []);
  });
});
