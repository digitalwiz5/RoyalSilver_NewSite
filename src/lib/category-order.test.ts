import { describe, it as test } from "node:test";
import { strict as assert } from "node:assert";
import { compareCategoryProducts } from "./category-order";

describe("category product order", () => {
  test("every category shows newly created products before old ones", () => {
    const products = [
      { id: "old", createdAt: "2026-10-01T10:00:00Z" },
      { id: "new", createdAt: "2026-10-21T18:07:00Z" },
      { id: "middle", createdAt: "2026-10-19T10:00:00Z" },
    ];
    assert.deepEqual([...products].sort(compareCategoryProducts).map(p => p.id), ["new", "middle", "old"]);
  });

  test("a future addition automatically sorts to the top", () => {
    const products = [{ createdAt: "2026-10-21T18:07:00Z" }, { createdAt: "2026-10-22T10:00:00Z" }];
    assert.equal([...products].sort(compareCategoryProducts)[0].createdAt, "2026-10-22T10:00:00Z");
  });

  test("equal dates retain source order and missing dates sort last", () => {
    const products = [{ id: "missing" }, { id: "one", createdAt: "2026-10-21T18:07:00Z" }, { id: "two", createdAt: "2026-10-21T18:07:00Z" }];
    assert.deepEqual([...products].sort(compareCategoryProducts).map(p => p.id), ["one", "two", "missing"]);
  });
});