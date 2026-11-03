import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { BRAND_IDENTITY, brandStructuredData } from "./brand-identity";

describe("verified Royal Silver identity", () => {
  it("uses the user-confirmed official telephone", () => {
    assert.equal(BRAND_IDENTITY.telephone, "+972502426661");
    const store = brandStructuredData([])["@graph"][0];
    assert.equal(store.telephone, "+972502426661");
    assert.equal(store.contactPoint?.telephone, "+972502426661");
  });
  it("preserves the confirmed Facebook URL without guessing an account", () => {
    assert.equal(BRAND_IDENTITY.facebook, "https://www.facebook.com/share/1JthjFJdWu/?mibextid=wwXIfr");
    const store = brandStructuredData([BRAND_IDENTITY.facebook])["@graph"][0];
    assert.deepEqual(store.sameAs, ["https://www.facebook.com/share/1JthjFJdWu/?mibextid=wwXIfr"]);
  });
  it("links one store identity to its official website and actual logo", () => {
    const data = brandStructuredData([])["@graph"];
    assert.equal(data.length, 2);
    assert.equal(data[0]["@type"], "OnlineStore");
    assert.equal(data[0].url, "https://www.royalsilver.net/");
    assert.equal(data[1].publisher?.["@id"], data[0]["@id"]);
    assert.equal(data[0].logo, "https://www.royalsilver.net/__l5e/assets-v1/5421c45f-3387-4c30-a99b-24635bce17fc/royalsilver-logo.png");
  });
});