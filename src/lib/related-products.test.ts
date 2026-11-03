import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  RELATED_EXCLUDED_HANDLES,
  isRelatedExcludedHandle,
  relatedQuery,
  relatedPool,
} from "./related-products";
import { HIDDEN_HANDLES } from "./handles";

const item = (id: string, handle: string, tags: string[] = ["נשים"]) => ({ node: { id, handle, tags } });

describe("Related products exclusions", () => {
  it("never suggests the 3 מ״מ hoop-stone earrings (JEW1307)", () => {
    assert.equal(isRelatedExcludedHandle("עגיל-כסף-חישוק-אבנים-3-ממ"), true);
  });
  it("never suggests the 3.5 מ״מ hoop-stone earrings (JEW1308)", () => {
    assert.equal(isRelatedExcludedHandle("עגיל-כסף-חישוק-אבנים-3-5-ממ"), true);
  });
  it("excludes exactly those two products", () => {
    assert.deepEqual([...RELATED_EXCLUDED_HANDLES], [
      "עגיל-כסף-חישוק-אבנים-3-ממ",
      "עגיל-כסף-חישוק-אבנים-3-5-ממ",
    ]);
  });
  it("keeps other hoop earrings eligible for suggestions", () => {
    assert.equal(isRelatedExcludedHandle("עגילי-סוליטר-זרקון"), false);
  });
  it("does not hide them from the storefront itself", () => {
    for (const handle of RELATED_EXCLUDED_HANDLES) {
      assert.equal(HIDDEN_HANDLES.has(handle), false);
    }
  });
});

describe("Related products pool", () => {
  const current = { id: "gid://shopify/Product/1", tags: ["נשים", "עגילים"] };
  const pool = [
    item("gid://shopify/Product/1", "עגילי-מילנה"),
    item("gid://shopify/Product/2", "עגיל-כסף-חישוק-אבנים-3-ממ"),
    item("gid://shopify/Product/3", "עגיל-כסף-חישוק-אבנים-3-5-ממ"),
    item("gid://shopify/Product/4", "עגילי-סוליטר-זרקון"),
    item("gid://shopify/Product/5", "עגילי-גבר-חישוק", ["גברים", "עגילים"]),
  ];

  it("drops the current product, both never-suggested earrings and the other gender", () => {
    assert.deepEqual(
      relatedPool(pool, current).map((p) => p.node.handle),
      ["עגילי-סוליטר-זרקון"],
    );
  });
  it("keeps men's suggestions separate for a men's product", () => {
    const mensPool = [
      item("gid://shopify/Product/5", "צמיד-רון", ["גברים"]),
      item("gid://shopify/Product/6", "עגילי-גבר-חישוק", ["גברים"]),
      item("gid://shopify/Product/7", "עגיל-כסף-חישוק-אבנים-3-ממ", ["גברים"]),
      item("gid://shopify/Product/8", "עגילי-סוליטר-זרקון", ["נשים"]),
    ];
    assert.deepEqual(
      relatedPool(mensPool, { id: "gid://shopify/Product/6", tags: ["גברים", "עגילים"] }).map((p) => p.node.handle),
      ["צמיד-רון"],
    );
  });
});

describe("Related products search", () => {
  it("searches the earring family with a wildcard so 'עגילי …' products are found", () => {
    assert.equal(relatedQuery("עגילי מילנה"), "title:עגיל*");
  });
  it("searches the other product families the same way", () => {
    assert.equal(relatedQuery("צמיד יובל – צמיד כסף"), "title:צמיד*");
    assert.equal(relatedQuery("טבעת ענבל מואסנייט"), "title:טבעת*");
    assert.equal(relatedQuery("שרשרת אפרת"), "title:שרשרת*");
    assert.equal(relatedQuery("סט נוי"), "title:סט*");
  });
  it("falls back to the whole catalog when the title matches no family", () => {
    assert.equal(relatedQuery("מוצר בדיקה"), "");
  });
});
