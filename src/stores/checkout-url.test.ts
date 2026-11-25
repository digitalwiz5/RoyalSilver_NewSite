import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { formatCheckoutUrl } from "./cartStore";

const KEY = "?key=abc123";

describe("checkout URL", () => {
  it("sends checkout to checkout.royalsilver.net on the online store channel", () => {
    const url = new URL(formatCheckoutUrl(`https://hc2k41-jj.myshopify.com/cart/c/hWN1${KEY}`));
    assert.equal(url.host, "checkout.royalsilver.net");
    assert.equal(url.pathname, "/cart/c/hWN1");
    assert.equal(url.searchParams.get("key"), "abc123");
    assert.equal(url.searchParams.get("channel"), "online_store");
  });

  it("drops a language folder, which Shopify answers with 404 and a jump to the home page", () => {
    for (const prefix of ["he", "HE", "he-il", "en", "en-us"]) {
      const url = new URL(formatCheckoutUrl(`https://checkout.royalsilver.net/${prefix}/cart/c/hWN1${KEY}`));
      assert.equal(url.pathname, "/cart/c/hWN1", prefix);
      assert.equal(url.searchParams.get("key"), "abc123");
    }
    const co = new URL(formatCheckoutUrl("https://checkout.royalsilver.net/he/checkouts/cn/hWN1"));
    assert.equal(co.pathname, "/checkouts/cn/hWN1");
  });

  it("leaves paths that are not a language folder alone", () => {
    assert.equal(new URL(formatCheckoutUrl("https://x.myshopify.com/cart/c/he")).pathname, "/cart/c/he");
    assert.equal(new URL(formatCheckoutUrl("https://x.myshopify.com/checkouts/cn/ab")).pathname, "/checkouts/cn/ab");
  });
});
