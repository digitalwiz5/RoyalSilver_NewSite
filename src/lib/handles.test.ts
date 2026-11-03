import { describe, it } from "node:test";
import { categoryQuery } from "@/routes/category.$slug";
import { strict as assert } from "node:assert";
import { HIDDEN_HANDLES, HOME_ONLY_HANDLES, PRETTY_TO_REAL_HANDLE, REAL_TO_PRETTY_HANDLE } from "./handles";
import { OMER_HANDLE, OMER_COLOR_IMAGE } from "./omer";
import { MENS_BRACELETS } from "./mens-bracelets";

describe("Chen heart ring existing identity", () => {
  it("keeps the imported heart ring behind the חן לב slug only", () => {
    assert.equal(PRETTY_TO_REAL_HANDLE["טבעת-חן-לב"], "טבעת-כסף-לב");
    assert.equal(REAL_TO_PRETTY_HANDLE["טבעת-כסף-לב"], "טבעת-חן-לב");
    assert.equal(PRETTY_TO_REAL_HANDLE["mia-heart-ring"], undefined);
  });
});

describe("Confirmed Lia ring", () => {
  it("preserves the existing imported product behind the Lia public slug", () => {
    assert.equal(PRETTY_TO_REAL_HANDLE["טבעת-ליה"], "טבעת-כסף-זרקון-ריבוע");
    assert.equal(REAL_TO_PRETTY_HANDLE["טבעת-כסף-זרקון-ריבוע"], "טבעת-ליה");
  });
  it("permits home delivery only", () => {
    assert.equal(HOME_ONLY_HANDLES.has("טבעת-כסף-זרקון-ריבוע"), true);
  });
});

describe("Approved existing men's bracelets", () => {
  const products = [
    ["צמיד-נועם", "צמיד-לגבר-קרמי-מעוצב-2", "JBM1184-1"],
    ["צמיד-עידו", "צמיד-לגבר-קרמי-מעוצב-1", "JBM1183-1"],
    ["צמיד-טל", "צמיד-לגבר-קרמי-מעוצב", "JBM1182-1"],
  ];
  for (const [pretty, real, sku] of products) {
    it(`${sku} keeps its original identity`, () => {
      assert.equal(PRETTY_TO_REAL_HANDLE[pretty], real);
      assert.equal(MENS_BRACELETS[real]?.sku, sku);
    });
    it(`${sku} has the approved 20.5 cm length`, () => {
      assert.equal(MENS_BRACELETS[real]?.lengthCm, 20.5);
    });
    it(`${sku} can shorten to 19.5 cm`, () => {
      assert.equal(MENS_BRACELETS[real]?.shortenedLengthCm, 19.5);
    });
    it(`${sku} uses home delivery only`, () => {
      assert.equal(HOME_ONLY_HANDLES.has(real), true);
    });
  }
});

describe("Guy compass necklace identity", () => {
  it("maps Guy to JNM1139's existing product rather than the Idan surfboard", () => {
    assert.equal(PRETTY_TO_REAL_HANDLE["שרשרת-גיא"], "שרשרת-סטיל-לגבר-מצפן-עם-עוגן");
    assert.equal(REAL_TO_PRETTY_HANDLE[OMER_HANDLE], "שרשרת-גיא");
    assert.notEqual(PRETTY_TO_REAL_HANDLE["שרשרת-גיא"], PRETTY_TO_REAL_HANDLE["שרשרת-עידן"]);
  });
  it("preserves the photo mapping for the three approved colors", () => {
    assert.deepEqual(OMER_COLOR_IMAGE, { כסף: 0, שחור: 1, זהב: 2 });
  });
});

describe("Idan necklace identity", () => {
  it("keeps the existing Shopify product behind the renamed public URL", () => {
    assert.equal(PRETTY_TO_REAL_HANDLE["שרשרת-עידן"], "שרשרת-כסף-גלשן-נשוך");
    assert.equal(REAL_TO_PRETTY_HANDLE["שרשרת-כסף-גלשן-נשוך"], "שרשרת-עידן");
  });
});

describe("Approved home-only necklaces", () => {
  it("Efrat cannot use pickup delivery", () => {
    assert.equal(HOME_ONLY_HANDLES.has("שרשרת-כסף-925-עניבה-עם-טיפה-משובצת-באבני-זרקון"), true);
  });
  it("Maayan cannot use pickup delivery", () => {
    assert.equal(HOME_ONLY_HANDLES.has("שרשרת-כסף-925-כפולה-עם-תליוני-טיפה-ירוקים"), true);
  });
});

describe("Category queries", () => {
  const cat = { slug: "women-necklaces", title: "שרשראות נשים", tag: "שרשראות נשים", productType: "Necklace", group: "women" } as never;
  it("keeps a product explicitly tagged for this women category even with men tags", () => {
    const q = categoryQuery(cat);
    assert.ok(q.includes("-tag:'שרשראות גברים' OR tag:'שרשראות נשים'"));
  });
  it("still guards every men's tag so men-only products stay out", () => {
    const q = categoryQuery(cat);
    for (const t of ["שרשראות גברים", "צמידים גברים", "עגילים גברים"]) {
      assert.ok(q.includes(`-tag:'${t}'`));
    }
  });
});

describe("Noga ring identity", () => {
  it("shows the imported JRW1236 ring behind the נוגה slug", () => {
    assert.equal(PRETTY_TO_REAL_HANDLE["טבעת-נוגה"], "טבעת-כסף-7-זרקונים");
    assert.equal(REAL_TO_PRETTY_HANDLE["טבעת-כסף-7-זרקונים"], "טבעת-נוגה");
  });
  it("keeps the hand-created 4179 duplicate out of the storefront", () => {
    assert.equal(HIDDEN_HANDLES.has("טבעת-נוגה-טבעת-כסף-925-משובצת-שבעה-זרקונים"), true);
  });
});